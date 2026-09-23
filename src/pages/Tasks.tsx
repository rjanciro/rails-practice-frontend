import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '@/lib/api'
import type { Employee, Task } from '@/lib/types'

export default function Tasks() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [employeeId, setEmployeeId] = useState('')
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
            employee_id: employeeId ? Number(employeeId) : null,
          },
        }),
      })
      setTasks((prev) => [...prev, task])
      setTitle('')
      setDescription('')
      setEmployeeId('')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login')
        return
      }
      setError('Failed to create task.')
    }
  }

  const employeeName = (id: number | null) =>
    id ? employees.find((employee) => employee.id === id)?.full_name : null

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
          <label className="mb-1 block text-sm font-medium" htmlFor="employeeId">
            Assign to
          </label>
          <select
            id="employeeId"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="">Unassigned</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name}
              </option>
            ))}
          </select>
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
          const assignee = employeeName(task.employee_id)
          return (
            <li key={task.id} className="rounded-lg bg-white px-4 py-3 shadow">
              <div className="flex items-center justify-between">
                <p className="font-medium">{task.title}</p>
                {assignee && (
                  <span className="text-sm text-gray-500">{assignee}</span>
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