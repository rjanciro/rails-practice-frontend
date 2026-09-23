import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, ApiError } from '@/lib/api'
import type { Employee } from '@/lib/types'

export default function Employees() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api<Employee[]>('/employees')
      .then(setEmployees)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          navigate('/login')
        }
      })
  }, [navigate])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const employee = await api<Employee>('/employees', {
        method: 'POST',
        body: JSON.stringify({ employee: { full_name: fullName, age: age ? Number(age) : null } }),
      })
      setEmployees((prev) => [...prev, employee])
      setFullName('')
      setAge('')
    } catch {
      setError('Failed to create employee.')
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Employees</h1>
      <form onSubmit={handleCreate} className="mb-6 flex gap-2 rounded-lg bg-white p-4 shadow">
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          className="flex-1 rounded border border-gray-300 px-3 py-2"
          required
        />
        <input
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Age"
          type="number"
          className="w-24 rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Add
        </button>
      </form>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <ul className="space-y-2">
        {employees.map((employee) => (
          <li
            key={employee.id}
            className="flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow"
          >
            <Link to={`/employees/${employee.id}`} className="font-medium text-blue-600 hover:underline">
              {employee.full_name}
            </Link>
            <span className="text-sm text-gray-500">{employee.age}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}