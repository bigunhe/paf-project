import { useEffect, useMemo, useState } from 'react'
import api from '../features/core/api'
import { useAuth } from '../features/core/AuthContext'
import PageHero, { PageHeroMetric } from '../features/core/PageHero'
import { PRIMARY_BUTTON_CLASS } from '../features/core/ui'

export default function MyBookings() {
  const { currentUserId } = useAuth()
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
  const [loading, setLoading] = useState(true)

  const totalBookings = bookings.length
  const pendingRequests = useMemo(
    () => bookings.filter((booking) => booking.status === 'PENDING').length,
    [bookings],
  )

  const resourceNameById = useMemo(() => {
    const map = new Map()
    resources.forEach((r) => map.set(r.id, `${r.name} (${r.type})`))
    return map
  }, [resources])

  const load = async () => {
    setLoading(true)
    const [{ data: bookingData }, { data: resourceData }] = await Promise.all([
      api.get('/bookings', { params: { userId: currentUserId } }),
      api.get('/resources', { params: { status: 'ACTIVE' } }),
    ])

    setBookings(bookingData)
    setResources(resourceData)
    const firstActiveId = resourceData.find((r) => r.status === 'ACTIVE')?.id
    if (firstActiveId) {
      setForm((prev) => {
        const stillValid = resourceData.some((r) => r.id === prev.resourceId)
        if (stillValid) return prev
        return { ...prev, resourceId: firstActiveId }
      })
    } else {
      setForm((prev) => ({ ...prev, resourceId: '' }))
    }
    setLoading(false)
  }

  useEffect(() => {
    load().catch((e) => {
      setLoading(false)
      setError(e.response?.data?.message || e.message)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/bookings', { ...form, userId: currentUserId })
      setForm((prev) => ({ ...prev, purpose: '', expectedAttendees: 0 }))
      await load()
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  return (
    <section className="relative isolate space-y-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-100/80 p-4 shadow-[0_30px_70px_-45px_rgba(15,23,42,0.55)] md:p-6">
      <PageHero
        eyebrow="Enterprise Workspace"
        title="Resource Booking Hub"
        description="Create and manage your booking requests with a streamlined institutional workflow."
        aside={<PageHeroMetric label="Records" value={totalBookings} />}
      />

      {error && (
        <div className="relative rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
        <form
          onSubmit={submit}
          className="min-w-0 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.55)] md:p-6"
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

          <div className="min-w-0 space-y-5">
            <label className="grid min-w-0 gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Resource
              {resources.length === 0 ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-normal normal-case text-amber-800">
                  No bookable resources are available right now. Check back after facilities marks resources as active.
                </p>
              ) : (
                <select
                  value={form.resourceId}
                  onChange={(e) => setForm((prev) => ({ ...prev, resourceId: e.target.value }))}
                  className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
                >
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} ({resource.type})
                    </option>
                  ))}
                </select>
              )}
            </label>

            <div className="grid min-w-0 grid-cols-1 gap-3">
              <label className="grid min-w-0 gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Start
                <input
                  type="datetime-local"
                  required
                  value={form.startTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                  className="min-h-[2.75rem] w-full min-w-[12rem] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
                />
              </label>
              <label className="grid min-w-0 gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                End
                <input
                  type="datetime-local"
                  required
                  value={form.endTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                  className="min-h-[2.75rem] w-full min-w-[12rem] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
                />
              </label>
            </div>

            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Purpose
              <input
                required
                value={form.purpose}
                onChange={(e) => setForm((prev) => ({ ...prev, purpose: e.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Expected Attendees
              <input
                type="number"
                min={0}
                value={form.expectedAttendees}
                onChange={(e) => setForm((prev) => ({ ...prev, expectedAttendees: Number(e.target.value) }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
              />
            </label>

            <button
              type="submit"
              disabled={resources.length === 0}
              className={`w-full py-3 text-sm font-semibold ${PRIMARY_BUTTON_CLASS}`}
            >
              Submit Request
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.55)]">
          <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-4 md:px-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Operations</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">My Booking Timeline</h2>
            <p className="mt-2 text-xs text-slate-500">{pendingRequests} pending requests</p>
          </div>

          {loading ? (
            <div className="grid min-h-[240px] place-items-center p-6">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="grid min-h-[240px] place-items-center p-6 text-sm text-slate-500">
              Your bookings will appear here after you submit a request.
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="bg-white">
                      <td className="px-4 py-4 font-semibold text-slate-900 md:px-6">
                        {resourceNameById.get(booking.resourceId) ?? booking.resourceId}
                      </td>
                      <td className="px-4 py-4 text-slate-600">{booking.startTime}</td>
                      <td className="px-4 py-4 text-slate-600">{booking.endTime}</td>
                      <td className="max-w-[270px] px-4 py-4 text-slate-600">
                        <span className="line-clamp-2">{booking.purpose}</span>
                      </td>
                      <td className="px-4 py-4">{booking.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
