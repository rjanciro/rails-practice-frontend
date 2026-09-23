import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import type { EmployeeDetail } from '@/lib/types'

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [active, setActive] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    api<EmployeeDetail>(`/employees/${id}`)
      .then(setEmployee)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          navigate('/login')
        }
      })
  }, [id, navigate])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const updated = await api<EmployeeDetail>(`/employees/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          employee: { full_name: fullName, age: age ? Number(age) : null, active },
        }),
      })
      setEmployee(updated)
      setEditing(false)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login')
        return
      }
      setError(err instanceof ApiError && err.status === 403 ? 'Admin access required.' : 'Failed to update employee.')
    }
  }

  const handleDelete = async () => {
    if (!employee || !window.confirm(`Delete ${employee.full_name}?`)) return
    setError('')
    try {
      await api<void>(`/employees/${employee.id}`, { method: 'DELETE' })
      navigate('/employees')
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        navigate('/login')
        return
      }
      setError(err instanceof ApiError && err.status === 403 ? 'Admin access required.' : 'Failed to delete employee.')
    }
  }

  return (
    <div>
      <Link to="/employees" className="text-sm text-blue-600 hover:underline">
        &larr; Back to employees
      </Link>

      {employee && (
        <div className="mt-4 rounded-lg bg-white p-6 shadow">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{employee.full_name}</h1>
              <p className="mt-1 text-gray-600">Age: {employee.age}</p>
              <p className="text-sm text-gray-500">
                Status: {employee.active ? 'Active' : 'Inactive'}
              </p>
            </div>
            {isAdmin && !editing && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFullName(employee.full_name)
                    setAge(employee.age?.toString() ?? '')
                    setActive(employee.active)
                    setEditing(true)
                  }}
                  className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {isAdmin && editing && (
            <form onSubmit={handleUpdate} className="mt-4 space-y-4 rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold">Edit employee</h2>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="age">
                  Age
                </label>
                <input
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  type="number"
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                Active
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded border border-gray-300 px-4 py-2 font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <h2 className="mt-6 mb-2 font-semibold">Tasks assigned</h2>
          {employee.tasks.length === 0 ? (
            <p className="text-sm text-gray-500">No tasks assigned.</p>
          ) : (
            <ul className="space-y-2">
              {employee.tasks.map((task) => (
                <li key={task.id} className="rounded-lg border border-gray-200 px-4 py-3">
                  <p className="font-medium">{task.title}</p>
                  {task.description && (
                    <p className="text-sm text-gray-600">{task.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  )
}