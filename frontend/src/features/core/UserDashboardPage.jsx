import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import api from './api'
import { useAuth } from './AuthContext'

function GlassMetric({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/70">{label}</p>
      <div className="mt-1.5 flex items-center justify-between gap-3">
        <p className="text-2xl font-semibold leading-none">{value}</p>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-100 text-sm font-semibold text-sky-700">
          {icon}
        </span>
      </div>
    </div>
  )
}

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
      rail: 'bg-sky-500',
      iconTile: 'bg-sky-100 text-sky-800',
      icon: '◇',
    },
    {
      to: '/app/bookings',
      title: 'My bookings',
      desc: bookingHint,
      rail: 'bg-indigo-500',
      iconTile: 'bg-indigo-100 text-indigo-800',
      icon: '◧',
    },
    {
      to: '/app/report',
      title: 'Report a problem',
      desc: 'Something broken or unsafe? Tell facilities.',
      rail: 'bg-blue-600',
      iconTile: 'bg-blue-100 text-blue-900',
      icon: '!',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-[#0f172a] via-[#111c38] to-[#0b1020] px-4 py-5 shadow-[0_22px_45px_-30px_rgba(15,23,42,0.75)] md:px-6 md:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 max-w-3xl text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/85">Enterprise Workspace</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white md:text-3xl">Operations Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Welcome back, {user?.name ?? 'user'}. Access your daily operations and track current activity.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <GlassMetric label="Bookings" value={bookingCount} icon="□" />
          <GlassMetric label="Open reports" value={reportCount} icon="◧" />
          <GlassMetric label="Unread" value={unreadCount} icon="◔" />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4 text-xs">
          <span className="rounded-full bg-emerald-500/20 px-3 py-1.5 font-medium text-emerald-100 ring-1 ring-emerald-400/30">
            Profile ready
          </span>
          <span className="rounded-full bg-sky-500/15 px-3 py-1.5 text-sky-100 ring-1 ring-sky-400/25">
            Role: {user?.role ?? 'USER'}
          </span>
          <span className="rounded-full bg-indigo-500/15 px-3 py-1.5 text-indigo-100 ring-1 ring-indigo-400/25">
            Type: {user?.userType ?? 'UNASSIGNED'}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-slate-200 ring-1 ring-white/15">
            Today: {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-[#eef3f8] p-4 shadow-[0_20px_45px_-40px_rgba(15,23,42,0.65)] md:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">At a glance</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <article className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_-30px_rgba(15,23,42,0.35)]">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sky-100 text-lg font-semibold text-sky-800">
              □
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">My booking requests</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{bookingCount}</p>
            </div>
          </article>
          <article className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_-30px_rgba(15,23,42,0.35)]">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-100 text-lg font-semibold text-indigo-800">
              ◧
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">Open reports</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{reportCount}</p>
            </div>
          </article>
          <article className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_-30px_rgba(15,23,42,0.35)]">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-100 text-lg font-semibold text-blue-900">
              ◔
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">Unread alerts</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{unreadCount}</p>
            </div>
          </article>
        </div>
      </section>

      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Quick actions</h2>
        <p className="mt-1 text-lg font-semibold text-slate-900">Where do you want to go?</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group relative flex min-h-[11rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_12px_30px_-30px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_20px_40px_-28px_rgba(15,23,42,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            >
              <span className={`absolute left-0 top-0 h-full w-1 ${c.rail}`} aria-hidden />
              <div className="flex items-start justify-between gap-3 pl-2">
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-semibold ${c.iconTile}`}
                  aria-hidden
                >
                  {c.icon}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400 transition group-hover:text-sky-600">
                  Open →
                </span>
              </div>
              <h3 className="mt-4 pl-2 text-xl font-semibold leading-snug text-slate-900">{c.title}</h3>
              <p className="mt-2 flex-1 pl-2 text-sm leading-relaxed text-slate-600">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
