import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from './api'

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    pendingBookings: 0,
    openIncidents: 0,
    completedIncidents: 0,
    nonAdminUsers: 0,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([api.get('/bookings'), api.get('/tickets'), api.get('/users')])
      .then(([bookingsRes, ticketsRes, usersRes]) => {
        if (cancelled) return
        const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : []
        const tickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : []
        const users = Array.isArray(usersRes.data) ? usersRes.data : []
        setMetrics({
          pendingBookings: bookings.filter((b) => b.status === 'PENDING').length,
          openIncidents: tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
          completedIncidents: tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
          nonAdminUsers: users.filter((u) => u.role !== 'ADMIN').length,
        })
      })
      .catch((e) => {
        if (cancelled) return
        setError(e.response?.data?.message || e.message || 'Unable to load dashboard summary.')
        setMetrics({
          pendingBookings: 0,
          openIncidents: 0,
          completedIncidents: 0,
          nonAdminUsers: 0,
        })
      })
    return () => {
      cancelled = true
    }
  }, [])

  const cards = [
    {
      to: '/admin/resources',
      title: 'Resource catalogue',
      desc: 'Create, update, and retire rooms, labs, and equipment entries.',
    },
    {
      to: '/admin/bookings',
      title: 'Booking approvals',
      desc: 'Review incoming requests and approve or reject based on policy.',
    },
    {
      to: '/admin/incidents',
      title: 'Incidents and maintenance',
      desc: 'Track reports, assign follow-up, and monitor resolution progress.',
    },
    {
      to: '/admin/users',
      title: 'Users & access',
      desc: 'View account directory by user type and oversee access context.',
    },
  ]

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Admin operations dashboard</h1>
        <p className="text-slate-500">Monitor service requests and manage campus operations from one view.</p>
      </section>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
          <p className="text-xs text-slate-500">Pending booking requests</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{metrics.pendingBookings}</p>
        </article>
        <article className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
          <p className="text-xs text-slate-500">Open incidents</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{metrics.openIncidents}</p>
        </article>
        <article className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
          <p className="text-xs text-slate-500">Completed incidents</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{metrics.completedIncidents}</p>
        </article>
        <article className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
          <p className="text-xs text-slate-500">Active non-admin users</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{metrics.nonAdminUsers}</p>
        </article>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Management modules</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 hover:border-blue-200 transition-colors"
          >
            <h2 className="text-lg font-medium text-slate-900 mb-1">{c.title}</h2>
            <p className="text-slate-500 text-sm">{c.desc}</p>
          </Link>
        ))}
      </div>
      </section>
    </div>
  )
}
