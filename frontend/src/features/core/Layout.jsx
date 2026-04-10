import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import NotificationDropdown from '../notifications/NotificationDropdown'

export default function Layout() {
  const navigate = useNavigate()
  const { isStaffPortal } = useAuth()

  const navClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`

  const homeLink = isStaffPortal ? '/admin' : '/app'

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-500/30">
      <header className="glass-nav">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <Link to={homeLink} className="text-xl font-bold text-white drop-shadow-md tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              S
            </span>
            Smart Campus
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
                  My Bookings
                </NavLink>
                <NavLink to="/app/report" className={navClass}>
                  Report Issue
                </NavLink>
                <NavLink to="/app/account" className={navClass}>
                  Account
                </NavLink>
              </>
            )}
            <NavLink to="/login" className={navClass}>
              Login
            </NavLink>
            <div className="ml-2">
              <NotificationDropdown />
            </div>
          </nav>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer font-medium hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={isStaffPortal}
              onChange={(e) => navigate(e.target.checked ? '/admin' : '/app')}
              className="rounded border-white/20 bg-slate-900/50 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-slate-900"
            />
            Staff Portal
          </label>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1 relative z-10 animate-in fade-in duration-500">
        <Outlet />
      </main>
    </div>
  )
}
