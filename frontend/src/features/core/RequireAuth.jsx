import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-slate-500 text-sm">Loading session…</div>
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

export function RequireAdmin() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-slate-500 text-sm">Loading session…</div>
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (user.role !== 'ADMIN') {
    return <Navigate to="/app" replace />
  }
  return <Outlet />
}
