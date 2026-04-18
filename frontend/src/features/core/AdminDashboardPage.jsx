import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from './api'

const isOpenIncident = (t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS'

const priorityRank = (p) => (p === 'CRITICAL' ? 0 : p === 'HIGH' ? 1 : p === 'MEDIUM' ? 2 : 3)

const ticketTime = (t) => {
  const ms = new Date(t.createdAt ?? 0).getTime()
  return Number.isNaN(ms) ? 0 : ms
}

function truncate(text, max = 100) {
  if (!text) return ''
  return text.length <= max ? text : `${text.slice(0, max)}…`
}

function formatShortDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState([])
  const [tickets, setTickets] = useState([])
  const [resources, setResources] = useState([])
  const [metrics, setMetrics] = useState({
    pendingBookings: 0,
    openIncidents: 0,
    completedIncidents: 0,
    nonAdminUsers: 0,
  })
  const [error, setError] = useState('')
  const [showOtherIncidents, setShowOtherIncidents] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([api.get('/bookings'), api.get('/tickets'), api.get('/users'), api.get('/resources')])
      .then(([bookingsRes, ticketsRes, usersRes, resourcesRes]) => {
        if (cancelled) return
        const bookingList = Array.isArray(bookingsRes.data) ? bookingsRes.data : []
        const ticketList = Array.isArray(ticketsRes.data) ? ticketsRes.data : []
        const userList = Array.isArray(usersRes.data) ? usersRes.data : []
        const resourceList = Array.isArray(resourcesRes.data) ? resourcesRes.data : []
        setBookings(bookingList)
        setTickets(ticketList)
        setResources(resourceList)
        setMetrics({
          pendingBookings: bookingList.filter((b) => b.status === 'PENDING').length,
          openIncidents: ticketList.filter((t) => isOpenIncident(t)).length,
          completedIncidents: ticketList.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
          nonAdminUsers: userList.filter((u) => u.role !== 'ADMIN').length,
        })
      })
      .catch((e) => {
        if (cancelled) return
        setError(e.response?.data?.message || e.message || 'Unable to load dashboard summary.')
        setBookings([])
        setTickets([])
        setResources([])
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

  const resourceNameById = useMemo(() => {
    const map = new Map()
    resources.forEach((r) => map.set(r.id, `${r.name} (${r.type})`))
    return map
  }, [resources])

  const urgentTickets = useMemo(() => {
    return tickets
      .filter((t) => isOpenIncident(t) && (t.priority === 'HIGH' || t.priority === 'CRITICAL'))
      .sort((a, b) => {
        const ra = priorityRank(a.priority)
        const rb = priorityRank(b.priority)
        if (ra !== rb) return ra - rb
        return ticketTime(b) - ticketTime(a)
      })
  }, [tickets])

  const otherOpenTickets = useMemo(() => {
    return tickets
      .filter((t) => isOpenIncident(t) && (t.priority === 'MEDIUM' || t.priority === 'LOW'))
      .sort((a, b) => ticketTime(b) - ticketTime(a))
  }, [tickets])

  const pendingBookingRows = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'PENDING')
      .sort((a, b) => ticketTime(b.startTime) - ticketTime(a.startTime))
      .slice(0, 5)
  }, [bookings])

  const moduleCards = [
    {
      to: '/admin/resources',
      title: 'Resource catalogue',
      desc: 'Rooms, labs, and equipment.',
      rail: 'bg-sky-500',
      iconTile: 'bg-sky-100 text-sky-900',
      icon: '◇',
    },
    {
      to: '/admin/bookings',
      title: 'Booking approvals',
      desc: 'Review and approve requests.',
      rail: 'bg-indigo-500',
      iconTile: 'bg-indigo-100 text-indigo-900',
      icon: '◧',
    },
    {
      to: '/admin/incidents',
      title: 'Incidents',
      desc: 'Maintenance and safety reports.',
      rail: 'bg-amber-500',
      iconTile: 'bg-amber-100 text-amber-950',
      icon: '!',
    },
    {
      to: '/admin/users',
      title: 'Users & access',
      desc: 'Directory and roles.',
      rail: 'bg-slate-600',
      iconTile: 'bg-slate-200 text-slate-800',
      icon: '◎',
    },
  ]

  const priorityBadge = (priority) => {
    if (priority === 'CRITICAL') {
      return 'border-rose-300 bg-rose-50 text-rose-800'
    }
    return 'border-amber-300 bg-amber-50 text-amber-900'
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
      <aside className="w-full shrink-0 space-y-3 lg:sticky lg:top-24 lg:w-72 lg:self-start">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Operations</p>
        <nav className="space-y-3" aria-label="Admin modules">
          {moduleCards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group relative flex min-h-[5.5rem] flex-col justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white py-4 pl-6 pr-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
            >
              <span className={`absolute left-0 top-0 h-full w-1 ${c.rail}`} aria-hidden />
              <div className="flex items-start gap-3 pl-1">
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-semibold ${c.iconTile}`}
                  aria-hidden
                >
                  {c.icon}
                </span>
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-slate-900">{c.title}</span>
                  <p className="mt-0.5 text-xs leading-snug text-slate-500">{c.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 space-y-6">
        <div className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-[#0f172a] via-[#111c38] to-[#0b1020] px-4 py-5 shadow-[0_22px_45px_-30px_rgba(15,23,42,0.75)] md:px-6 md:py-6">
          <div className="max-w-3xl text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/85">Staff workspace</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Admin operations dashboard</h1>
            <p className="mt-2 text-sm text-slate-300">
              Monitor urgent incidents, booking approvals, and campus operations from one view.
            </p>
          </div>
          <div className="mt-4 inline-flex rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/70">Pending approvals</p>
            <p className="ml-4 text-2xl font-semibold tabular-nums text-white">{metrics.pendingBookings}</p>
          </div>
        </div>

        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}

        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Priority attention</h2>
              <p className="text-lg font-semibold text-slate-900">Urgent incidents and pending approvals</p>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/90 via-white to-amber-50/40 p-4 shadow-sm md:p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-900/90">Urgent incidents</h3>
            <p className="mt-1 text-xs text-slate-600">High or critical priority, still open or in progress.</p>
            {urgentTickets.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No urgent incidents right now.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {urgentTickets.map((t) => (
                  <li key={t.id}>
                    <Link
                      to={`/admin/incidents?ticketId=${encodeURIComponent(t.id)}`}
                      className="flex flex-col gap-2 rounded-xl border border-rose-200/60 bg-white/90 p-4 shadow-sm transition hover:border-rose-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${priorityBadge(t.priority)}`}
                          >
                            {t.priority}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">{t.status}</span>
                        </div>
                        <p className="mt-1.5 text-sm font-semibold text-slate-900">{t.category}</p>
                        <p className="mt-0.5 text-xs text-slate-600">{resourceNameById.get(t.resourceId) ?? t.resourceId}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{truncate(t.description, 140)}</p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-slate-500">{formatShortDate(t.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-sky-200/80 bg-white p-4 shadow-sm md:p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-900">Pending approvals</h3>
            <p className="mt-1 text-xs text-slate-600">Booking requests awaiting admin decision (showing up to five).</p>
            {pendingBookingRows.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No pending booking requests.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {pendingBookingRows.map((b) => (
                  <li key={b.id}>
                    <Link
                      to={`/admin/bookings?bookingId=${encodeURIComponent(b.id)}`}
                      className="flex flex-col gap-1 rounded-xl border border-sky-200/70 bg-sky-50/40 p-4 transition hover:border-sky-300 hover:bg-sky-50/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {resourceNameById.get(b.resourceId) ?? b.resourceId}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-600">{b.purpose || 'No purpose stated.'}</p>
                      </div>
                      <span className="shrink-0 text-xs font-medium text-slate-500">{formatShortDate(b.startTime)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {otherOpenTickets.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 md:p-5">
              <button
                type="button"
                onClick={() => setShowOtherIncidents((v) => !v)}
                className="flex w-full items-center justify-between gap-2 text-left text-sm font-semibold text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 rounded-lg"
                aria-expanded={showOtherIncidents}
              >
                <span>
                  Other open incidents <span className="font-normal text-slate-500">({otherOpenTickets.length})</span>
                </span>
                <span className="text-slate-400">{showOtherIncidents ? '−' : '+'}</span>
              </button>
              {showOtherIncidents && (
                <ul className="mt-3 space-y-2 border-t border-slate-200/80 pt-3">
                  {otherOpenTickets.map((t) => (
                    <li key={t.id}>
                      <Link
                        to={`/admin/incidents?ticketId=${encodeURIComponent(t.id)}`}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                      >
                        <span className="font-medium text-slate-900">{t.category}</span>
                        <span className="text-xs text-slate-500">
                          {t.priority} · {t.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-[#eef3f8] p-4 shadow-[0_20px_45px_-40px_rgba(15,23,42,0.65)] md:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Snapshot</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_-30px_rgba(15,23,42,0.35)]">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-sky-100 text-lg font-semibold text-sky-800">
                ◧
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">Pending booking requests</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{metrics.pendingBookings}</p>
              </div>
            </article>
            <article className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_-30px_rgba(15,23,42,0.35)]">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber-100 text-lg font-semibold text-amber-900">
                !
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">Open incidents</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{metrics.openIncidents}</p>
              </div>
            </article>
            <article className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_-30px_rgba(15,23,42,0.35)]">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-100 text-lg font-semibold text-emerald-800">
                ✓
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">Completed incidents</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{metrics.completedIncidents}</p>
              </div>
            </article>
            <article className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_-30px_rgba(15,23,42,0.35)]">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-100 text-lg font-semibold text-indigo-900">
                ◎
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">Active non-admin users</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{metrics.nonAdminUsers}</p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  )
}
