import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import api from './api'
import { useAuth } from './AuthContext'
import PageHero, { PageHeroMetric } from './PageHero'

export default function UserDashboardPage() {
  const { user } = useAuth()
  const [bookingCount, setBookingCount] = useState(0)
  const [reportCount, setReportCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false

    Promise.all([
      api.get('/bookings'),
      api.get('/tickets'),
      api.get(`/notifications?userId=${encodeURIComponent(user.id)}`),
    ])
      .then(([bookingsRes, ticketsRes, notificationsRes]) => {
        if (cancelled) return
        const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : []
        const tickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : []
        const notifications = Array.isArray(notificationsRes.data) ? notificationsRes.data : []
        setBookingCount(bookings.length)
        setReportCount(tickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length)
        setUnreadCount(notifications.filter((n) => !n.isRead).length)
      })
      .catch(() => {
        if (cancelled) return
        setBookingCount(0)
        setReportCount(0)
        setUnreadCount(0)
      })

    return () => {
      cancelled = true
    }
  }, [user?.id])

  const bookingHint = useMemo(() => {
    if (user?.userType === 'LECTURER') {
      return 'Lecturer requests are typically auto-approved when no time conflict exists.'
    }
    return 'Student and staff requests are usually reviewed before approval.'
  }, [user?.userType])

  const cards = [
    {
      to: '/app/resources',
      title: 'Browse spaces & equipment',
      desc: 'See rooms, labs, and gear you can book.',
    },
    {
      to: '/app/bookings',
      title: 'My bookings',
      desc: bookingHint,
    },
    {
      to: '/app/report',
      title: 'Report a problem',
      desc: 'Something broken or unsafe? Tell facilities.',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Enterprise Workspace"
        title="Operations Dashboard"
        description={`Welcome back, ${user?.name ?? 'user'}. Access your daily operations and track current activity.`}
        aside={
          <div className="flex flex-wrap justify-end gap-2">
            <PageHeroMetric label="Bookings" value={bookingCount} />
            <PageHeroMetric label="Open reports" value={reportCount} />
            <PageHeroMetric label="Unread" value={unreadCount} />
          </div>
        }
      />
      <section className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">Profile ready</span>
          <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">Role: {user?.role ?? 'USER'}</span>
          <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
            Type: {user?.userType ?? 'UNASSIGNED'}
          </span>
          <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
            Today: {new Date().toLocaleDateString()}
          </span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
          <p className="text-xs text-slate-500">My booking requests</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{bookingCount}</p>
        </article>
        <article className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
          <p className="text-xs text-slate-500">Open reports</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{reportCount}</p>
        </article>
        <article className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
          <p className="text-xs text-slate-500">Unread alerts</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{unreadCount}</p>
        </article>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Quick actions</h2>
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
