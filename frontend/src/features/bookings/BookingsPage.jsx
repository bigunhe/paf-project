import { useEffect, useState } from 'react'
import api from '../core/api'
import { useAuth } from '../core/AuthContext'

export default function BookingsPage() {
  const { currentUserId, isAdmin } = useAuth()
  const [bookings, setBookings] = useState([])
  const [resources, setResources] = useState([])
  const [form, setForm] = useState({
    resourceId: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: 0,
  })
  const [error, setError] = useState('')

  const load = async () => {
    const params = isAdmin ? {} : { userId: currentUserId }
    const [{ data: b }, { data: r }] = await Promise.all([
      api.get('/bookings', { params }),
      api.get('/resources'),
    ])
    setBookings(b)
    setResources(r)
    if (!form.resourceId && r[0]?.id) {
      setForm((f) => ({ ...f, resourceId: r[0].id }))
    }
  }

  useEffect(() => {
    load().catch((e) => setError(e.response?.data?.message || e.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, isAdmin])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/bookings', { ...form, userId: currentUserId })
      setForm((f) => ({ ...f, purpose: '', expectedAttendees: 0 }))
      await load()
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      setError(msg)
    }
  }

  const patchStatus = async (id, status, adminReason = null) => {
    setError('')
    try {
      await api.patch(`/bookings/${id}/status`, { status, adminReason })
      await load()
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  return (
    <div className="relative isolate space-y-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-100/80 p-4 shadow-[0_30px_70px_-45px_rgba(15,23,42,0.55)] md:p-6">
      <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-cyan-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-24 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl" />

      <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-6 text-white shadow-[0_18px_40px_-26px_rgba(15,23,42,0.75)] md:px-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.24),transparent_42%)]" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/90">Enterprise Workspace</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              {isAdmin ? 'Booking Approvals' : 'Resource Booking Hub'}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-200/90">
              {isAdmin
                ? 'Review pending requests, approve with confidence, and keep operations synchronized.'
                : 'Create and manage your booking requests with a streamlined institutional workflow.'}
            </p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-right backdrop-blur">
            <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/85">Records</p>
            <p className="text-2xl font-semibold text-white">{bookings.length}</p>
          </div>
        </div>
      </header>

      {error && (
        <div className="relative rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm transition-all duration-300">
          {error}
        </div>
      )}

      <div className={`relative grid gap-6 ${isAdmin ? 'xl:grid-cols-1' : 'xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]'}`}>
        {!isAdmin && (
          <form
            onSubmit={submit}
            className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.55)] transition-all duration-500 md:p-6"
          >
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Request</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Create Booking</h2>
              </div>
              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
                Active Form
              </span>
            </div>

            <div className="space-y-5">
              <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Resource Selection</p>
                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Resource
                  <select
                    value={form.resourceId}
                    onChange={(e) => setForm((f) => ({ ...f, resourceId: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition duration-200 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100"
                  >
                    {resources.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.type})
                      </option>
                    ))}
                  </select>
                </label>
              </section>

              <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Schedule</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Start
                    <input
                      type="datetime-local"
                      required
                      value={form.startTime}
                      onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition duration-200 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100"
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    End
                    <input
                      type="datetime-local"
                      required
                      value={form.endTime}
                      onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition duration-200 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100"
                    />
                  </label>
                </div>
              </section>

              <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Request Details</p>
                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Purpose
                  <input
                    required
                    value={form.purpose}
                    onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition duration-200 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Expected Attendees
                  <input
                    type="number"
                    min={0}
                    value={form.expectedAttendees}
                    onChange={(e) => setForm((f) => ({ ...f, expectedAttendees: Number(e.target.value) }))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm transition duration-200 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-100"
                  />
                </label>
              </section>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_24px_-20px_rgba(14,116,144,0.85)] transition-all duration-200 hover:-translate-y-0.5 hover:from-cyan-500 hover:to-blue-500 hover:shadow-[0_22px_30px_-18px_rgba(14,116,144,0.75)]"
              >
                Submit Request
              </button>
            </div>
          </form>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.55)]">
          <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-4 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Operations</p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                  {isAdmin ? 'Incoming Booking Queue' : 'My Booking Timeline'}
                </h2>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500">
                {bookings.length} entries
              </div>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="grid min-h-[280px] place-items-center p-6">
              <div className="max-w-sm text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-slate-100 shadow-inner" />
                <h3 className="text-base font-semibold text-slate-900">No bookings found</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {isAdmin
                    ? 'No requests match the current view. New pending requests will appear here.'
                    : 'Your bookings will appear here after you submit a request.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-white text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3 md:px-6">Resource</th>
                    <th className="px-4 py-3">Start</th>
                    <th className="px-4 py-3">End</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3">Status</th>
                    {isAdmin && <th className="px-4 py-3 md:pr-6">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b, index) => (
                    <tr
                      key={b.id}
                      className="translate-y-0 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50/70 hover:shadow-[inset_0_0_0_1px_rgba(148,163,184,0.16)]"
                      style={{ animation: `bookingRowIn 340ms ease-out ${index * 55}ms both` }}
                    >
                      <td className="px-4 py-4 font-semibold text-slate-900 md:px-6">{b.resourceId}</td>
                      <td className="px-4 py-4 text-slate-600">{b.startTime}</td>
                      <td className="px-4 py-4 text-slate-600">{b.endTime}</td>
                      <td className="max-w-[270px] px-4 py-4 text-slate-600">
                        <span className="line-clamp-2">{b.purpose}</span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusPill status={b.status} />
                      </td>
                      {isAdmin && b.status === 'PENDING' && (
                        <td className="px-4 py-4 md:pr-6">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => patchStatus(b.id, 'APPROVED')}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-500"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const reason = prompt('Rejection reason (optional)') || 'Rejected'
                                patchStatus(b.id, 'REJECTED', reason)
                              }}
                              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-500"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      )}
                      {isAdmin && b.status !== 'PENDING' && <td className="px-4 py-4 text-slate-400 md:pr-6">—</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <style>{`
        @keyframes bookingRowIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

function StatusPill({ status }) {
  const tones = {
    APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
    REJECTED: 'border-rose-200 bg-rose-50 text-rose-700',
    CANCELLED: 'border-slate-300 bg-slate-100 text-slate-600',
  }

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${tones[status] || 'border-slate-300 bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}
