import { createContext, useContext, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { DEV_ADMIN_ID, DEV_USER_ID } from './constants'

const AuthContext = createContext(null)

/**
 * Staff vs student is derived from URL prefix /admin vs /app.
 * Dev checkbox in Layout navigates between those prefixes.
 */
export function AuthProvider({ children }) {
  const location = useLocation()
  const isStaffPortal = location.pathname.startsWith('/admin')

  const value = useMemo(
    () => ({
      currentUserId: isStaffPortal ? DEV_ADMIN_ID : DEV_USER_ID,
      /** Alias for staff portal — same as previous isAdmin from checkbox. */
      isAdmin: isStaffPortal,
      isStaffPortal,
    }),
    [isStaffPortal],
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
