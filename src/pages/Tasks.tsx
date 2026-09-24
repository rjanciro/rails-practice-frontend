import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EmployeeCheckboxList from '@/components/EmployeeCheckboxList'
import { api, ApiError } from '@/lib/api'
import type { Employee, Task } from '@/lib/types'

export default function Tasks() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [employeeIds, setEmployeeIds] = useState<number[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    api<Task[]>('/tasks')
      .then(setTasks)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          navigate('/login')
        }
      })

    api<Employee[]>('/employees')
      .then(setEmployees)
      .catch(() => {})
  }, [navigate])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const task = await api<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          task: {
            title,
            description: description || null,
            employee_ids: employeeIds,
          },
        }),
      })
      setTasks((prev) => [...prev, task])
      setTitle('')
      setDescription('')
      setEmployeeIds([])
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login')
        return
      }
      setError('Failed to create task.')
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Tasks</h1>
      <form onSubmit={handleCreate} className="mb-6 space-y-4 rounded-lg bg-white p-4 shadow">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
            rows={3}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <p className="mb-1 block text-sm font-medium">Assign to</p>
          <EmployeeCheckboxList
            employees={employees}
            selected={employeeIds}
            onChange={setEmployeeIds}
            idPrefix="new-task-employee"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Create task
        </button>
      </form>
      <ul className="space-y-2">
        {tasks.map((task) => {
          const assignees = task.employees.map((employee) => employee.full_name).join(', ')
          return (
            <li key={task.id} className="rounded-lg bg-white px-4 py-3 shadow">
              <div className="flex items-center justify-between gap-4">
                <Link
                  to={`/tasks/${task.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {task.title}
                </Link>
                {assignees && (
                  <span className="text-right text-sm text-gray-500">{assignees}</span>
                )}
              </div>
              {task.description && (
                <p className="text-sm text-gray-600">{task.description}</p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
