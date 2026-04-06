import { createContext, useContext, useMemo, useState } from 'react'
import { DEV_ADMIN_ID, DEV_USER_ID } from './constants'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUserId, setCurrentUserId] = useState(DEV_USER_ID)
  const [isAdminView, setIsAdminView] = useState(false)

  const value = useMemo(
    () => ({
      currentUserId: isAdminView ? DEV_ADMIN_ID : currentUserId,
      actingUserId: currentUserId,
      isAdminView,
      setIsAdminView,
      setCurrentUserId,
      /** True when the effective API user is ADMIN (dev toggle). */
      isAdmin: isAdminView,
    }),
    [currentUserId, isAdminView],
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
