import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import type { User } from '@/lib/types'

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const data = await api<{ user: User }>('/session', {
        method: 'POST',
        body: JSON.stringify({ email_address: emailAddress, password }),
      })
      setUser(data.user)
      navigate('/employees')
    } catch (err) {
      setError(err instanceof ApiError ? 'Invalid email or password.' : 'Something went wrong.')
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-sm rounded-lg bg-white p-8 shadow">
      <h1 className="mb-6 text-xl font-bold">Log in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Log in
        </button>
      </form>
    </div>
  )
}