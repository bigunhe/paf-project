import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import NotificationDropdown from '../notifications/NotificationDropdown'

export default function Layout() {
  const navigate = useNavigate()
  const { isStaffPortal } = useAuth()

  const navClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100'}`

  const homeLink = isStaffPortal ? '/admin' : '/app'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-50 to-blue-200 text-slate-900">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <Link to={homeLink} className="text-lg font-semibold text-slate-900">
            Smart Campus Hub
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            {isStaffPortal ? (
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
              </>
            ) : (
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
                  Account
                </NavLink>
              </>
            )}
            <NavLink to="/login" className={navClass}>
              Login
            </NavLink>
            <NotificationDropdown />
          </nav>
          <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
            <input
              type="checkbox"
              checked={isStaffPortal}
              onChange={(e) => navigate(e.target.checked ? '/admin' : '/app')}
              className="rounded border-slate-200"
            />
            Staff portal
          </label>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
