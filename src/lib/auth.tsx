import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api } from '@/lib/api'
import { AuthContext } from '@/lib/auth-context'
import type { User } from '@/lib/types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    api<{ user: User }>('/session')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}