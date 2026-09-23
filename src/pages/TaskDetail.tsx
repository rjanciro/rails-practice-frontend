import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, ApiError } from '@/lib/api'
import type { Employee, Task } from '@/lib/types'

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [task, setTask] = useState<Task | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [notFound, setNotFound] = useState(false)

  const [assigneeId, setAssigneeId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState('')

  useEffect(() => {
    if (!id) return

    api<Task>(`/tasks/${id}`)
      .then(setTask)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          navigate('/login')
          return
        }
        setNotFound(true)
      })

    api<Employee[]>('/employees')
      .then(setEmployees)
      .catch(() => {})
  }, [id, navigate])

  const assignee = task?.employee_id
    ? employees.find((employee) => employee.id === task.employee_id)
    : null

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return
    setAssignError('')
    setAssigning(true)
    try {
      const updated = await api<Task>(`/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          task: { employee_id: assigneeId ? Number(assigneeId) : null },
        }),
      })
      setTask(updated)
      setAssigneeId('')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login')
        return
      }
      setAssignError('Failed to assign employee.')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div>
      <Link to="/tasks" className="text-sm text-blue-600 hover:underline">
        &larr; Back to tasks
      </Link>

      {notFound && (
        <div className="mt-4 rounded-lg bg-white p-6 shadow">
          <p className="text-gray-600">Task not found.</p>
        </div>
      )}

      {task && (
        <div className="mt-4 rounded-lg bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">{task.title}</h1>

          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-500">Description</p>
            {task.description ? (
              <p className="text-gray-700">{task.description}</p>
            ) : (
              <p className="text-sm text-gray-500">No description.</p>
            )}
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500">Assigned to</p>
            {assignee ? (
              <Link
                to={`/employees/${assignee.id}`}
                className="text-blue-600 hover:underline"
              >
                {assignee.full_name}
              </Link>
            ) : (
              <>
                <p className="mt-1 text-gray-700">No employee assigned yet.</p>
                {employees.length > 0 && (
                  <form onSubmit={handleAssign} className="mt-2 flex items-center gap-2">
                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="rounded border border-gray-300 px-3 py-2"
                      aria-label="Assign to employee"
                    >
                      <option value="">Unassigned</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.full_name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={assigning}
                      className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      Assign
                    </button>
                  </form>
                )}
                {assignError && (
                  <p className="mt-1 text-sm text-red-600">{assignError}</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}