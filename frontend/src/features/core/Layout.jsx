import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import NotificationDropdown from '../notifications/NotificationDropdown'

export default function Layout() {
  const location = useLocation()
  const { user, logout } = useAuth()

  const navClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100'}`

  const inAdminArea = location.pathname.startsWith('/admin')
  const onProfileSetup = location.pathname === '/complete-profile'
  const profileDone = user?.profileCompleted === true

  const showStaffNav = profileDone && user?.role === 'ADMIN' && inAdminArea
  const showStudentNav =
    profileDone && user && (user.role === 'USER' || (user.role === 'ADMIN' && !inAdminArea))

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <Link to="/" className="text-lg font-semibold text-slate-900">
            Smart Campus Hub
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            {!user && (
              <>
                <NavLink to="/" end className={navClass}>
                  Home
                </NavLink>
                <NavLink to="/login" className={navClass}>
                  Sign in
                </NavLink>
              </>
            )}

            {showStudentNav && (
              <>
                <NavLink to="/app" end className={navClass}>
                  Home
                </NavLink>
                <NavLink to="/app/resources" className={navClass}>
                  Browse
                </NavLink>
                <NavLink to="/app/bookings" className={navClass}>
                  My bookings
                </NavLink>
                <NavLink to="/app/report" className={navClass}>
                  Report issue
                </NavLink>
                <NavLink to="/app/account" className={navClass}>
                  My Account
                </NavLink>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50"
                  >
                    Staff portal
                  </Link>
                )}
              </>
            )}

            {showStaffNav && (
              <>
                <NavLink to="/admin" end className={navClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/admin/resources" className={navClass}>
                  Resources
                </NavLink>
                <NavLink to="/admin/bookings" className={navClass}>
                  Bookings
                </NavLink>
                <NavLink to="/admin/incidents" className={navClass}>
                  Incidents
                </NavLink>
                <NavLink to="/admin/users" className={navClass}>
                  Users
                </NavLink>
                <NavLink to="/app/account" className={navClass}>
                  My Account
                </NavLink>
                <Link
                  to="/app"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-blue-700 hover:bg-blue-50"
                >
                  Student portal
                </Link>
              </>
            )}

            {onProfileSetup && user && (
              <span className="text-sm text-amber-700 font-medium px-2">Complete your profile to continue</span>
            )}

            {user && profileDone && <NotificationDropdown />}

            {user && (
              <button
                type="button"
                onClick={() => {
                  logout()
                  window.location.assign('/')
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100"
              >
                Sign out
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
