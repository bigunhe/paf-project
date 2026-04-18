import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api from './api'
import { API_ORIGIN, TOKEN_KEY } from './constants'

const AuthContext = createContext(null)

/**
 * Authenticated identity: JWT in sessionStorage + GET /auth/me.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMe = useCallback(async () => {
    const t = sessionStorage.getItem(TOKEN_KEY)
    if (!t) {
      setUser(null)
      setLoading(false)
      return null
    }
    try {
      const { data } = await api.get('/auth/me')
      setUser(data)
      return data
    } catch {
      sessionStorage.removeItem(TOKEN_KEY)
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMe()
  }, [loadMe])

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  const completeLoginWithToken = useCallback(async (token) => {
    sessionStorage.setItem(TOKEN_KEY, token)
    const { data } = await api.get('/auth/me')
    setUser(data)
    return data
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      /** True when signed-in user has ADMIN role (DB). */
      isAdmin: user?.role === 'ADMIN',
      currentUserId: user?.id ?? null,
      logout,
      refreshSession: loadMe,
      completeLoginWithToken,
      apiOrigin: API_ORIGIN,
    }),
    [user, loading, logout, loadMe, completeLoginWithToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
