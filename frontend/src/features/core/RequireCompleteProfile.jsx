import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

/**
 * Ensures profile onboarding is finished before /app or /admin child routes.
 */
export default function RequireCompleteProfile() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-slate-500 text-sm">Loading session…</div>
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (user.profileCompleted !== true) {
    return <Navigate to="/complete-profile" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
