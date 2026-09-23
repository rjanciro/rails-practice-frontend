import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function Layout() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()

  const handleLogout = async () => {
    await api<void>('/session', { method: 'DELETE' })
    setUser(null)
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900'

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6">
        <Link to="/employees" className="font-bold text-lg">
          Practice
        </Link>
        <NavLink to="/employees" className={linkClass}>
          Employees
        </NavLink>
        <NavLink to="/tasks" className={linkClass}>
          Tasks
        </NavLink>
        {user && (
          <span className="ml-auto flex items-center gap-2 text-sm text-gray-500">
            {user.email_address}
            {user.role === 'admin' && (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                Admin
              </span>
            )}
          </span>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Log out
        </button>
      </nav>
      <main className="max-w-3xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}