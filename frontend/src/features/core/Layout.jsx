import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'
import NotificationDropdown from '../notifications/NotificationDropdown'

export default function Layout() {
  const { isAdminView, setIsAdminView } = useAuth()

  const navClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100'}`

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <Link to="/" className="text-lg font-semibold text-slate-900">
            Smart Campus Hub
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Dashboard
            </NavLink>
            <NavLink to="/resources" className={navClass}>
              Resources
            </NavLink>
            <NavLink to="/bookings" className={navClass}>
              Bookings
            </NavLink>
            <NavLink to="/tickets" className={navClass}>
              Tickets
            </NavLink>
            <NavLink to="/login" className={navClass}>
              Login
            </NavLink>
            <NotificationDropdown />
          </nav>
          <label className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer">
            <input
              type="checkbox"
              checked={isAdminView}
              onChange={(e) => setIsAdminView(e.target.checked)}
              className="rounded border-slate-200"
            />
            Admin view (dev)
          </label>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
