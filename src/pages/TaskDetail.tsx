import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import type { Employee, Task } from '@/lib/types'

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const [task, setTask] = useState<Task | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [notFound, setNotFound] = useState(false)

  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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

  const startEditing = () => {
    if (!task) return
    setTitle(task.title)
    setDescription(task.description ?? '')
    setAssigneeId(task.employee_id?.toString() ?? '')
    setError('')
    setEditing(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return
    setError('')
    setSaving(true)
    try {
      const updated = await api<Task>(`/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          task: {
            title,
            description: description || null,
            employee_id: assigneeId ? Number(assigneeId) : null,
          },
        }),
      })
      setTask(updated)
      setEditing(false)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login')
        return
      }
      setError(
        err instanceof ApiError && err.status === 403
          ? 'Admin access required.'
          : 'Failed to update task.',
      )
    } finally {
      setSaving(false)
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
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold">{task.title}</h1>
            {isAdmin && !editing && (
              <button
                type="button"
                onClick={startEditing}
                className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="mt-4 space-y-4 rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold">Edit task</h2>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="title">
                  Title
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  rows={3}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="assigneeId">
                  Assign to
                </label>
                <select
                  id="assigneeId"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
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
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setError('')
                  }}
                  className="rounded border border-gray-300 px-4 py-2 font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
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
                    className="mt-1 inline-block text-blue-600 hover:underline"
                  >
                    {assignee.full_name}
                  </Link>
                ) : (
                  <p className="mt-1 text-gray-700">No employee assigned yet.</p>
                )}
              </div>

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
            </>
          )}
        </div>
      )}
    </div>
  )
}