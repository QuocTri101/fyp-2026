import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '../../api/auth'
import { onUnauthorized } from '../../api/http'
import { tokenStorage } from '../../api/tokenStorage'
import { parseToken } from './jwt'
import type { TokenUser } from './jwt'

interface AuthState {
  user: TokenUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

function loadUser(): TokenUser | null {
  const token = tokenStorage.get()
  if (!token) return null

  const user = parseToken(token)
  const expired = user?.expiresAt != null && user.expiresAt < Date.now()
  if (!user || expired) {
    tokenStorage.clear()
    return null
  }
  return user
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TokenUser | null>(loadUser)

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const token = await authApi.login(email, password)
    const parsed = parseToken(token)
    if (!parsed) throw new Error('The server returned an invalid token.')
    tokenStorage.set(token)
    setUser(parsed)
  }, [])

  // If any request comes back 401, sign out so the user lands on the login page.
  useEffect(() => {
    onUnauthorized(logout)
  }, [logout])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.')
  return ctx
}
