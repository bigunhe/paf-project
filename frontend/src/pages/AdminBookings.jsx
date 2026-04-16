import { useEffect, useMemo, useState } from 'react'
import api from '../features/core/api'
import { PRIMARY_FILTER_ACTIVE_CLASS } from '../features/core/ui'

const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState('')
  const [filters, setFilters] = useState({ status: '' })

  const resourceNameById = useMemo(() => {
    const map = new Map()
    resources.forEach((r) => map.set(r.id, `${r.name} (${r.type})`))
    return map
  }, [resources])

  const loadBookings = async () => {
    setLoading(true)
    setError('')
    try {
      const [{ data: bookingList }, { data: resourceList }] = await Promise.all([
        api.get('/bookings'),
        api.get('/resources'),
      ])
      setBookings(bookingList)
      setResources(resourceList)
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings().catch(() => {})
  }, [])

  const patchStatus = async (id, status, adminReason = null) => {
    setActionId(id)
    setError('')
    try {
      await api.patch(`/bookings/${id}/status`, { status, adminReason })
      await loadBookings()
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Status update failed')
    } finally {
      setActionId('')
    }
  }

  const filteredBookings = useMemo(() => {
    if (!filters.status) return bookings
    return bookings.filter((booking) => booking.status === filters.status)
  }, [bookings, filters.status])

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_34px_-26px_rgba(15,23,42,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Booking Requests</h1>
            <p className="mt-2 text-sm font-medium text-slate-400">
              {filteredBookings.length.toLocaleString()} bookings in current view
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Filter by Status</span>
            {STATUS_OPTIONS.map((statusOption) => {
              const active = filters.status === statusOption
              return (
                <button
                  key={statusOption || 'ALL'}
                  type="button"
                  onClick={() => setFilters({ status: statusOption })}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    active ? PRIMARY_FILTER_ACTIVE_CLASS : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {statusOption || 'All'}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-[0_18px_34px_-26px_rgba(15,23,42,0.45)]">
        {loading ? (
          <div className="grid place-items-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-500">No bookings match your filters.</p>
          </div>
        ) : (
          <table className="w-full min-w-[980px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">User</th>
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">Resource</th>
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">Start</th>
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">End</th>
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">Status</th>
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((booking) => {
                const actionDisabled = booking.status !== 'PENDING' || actionId === booking.id
                return (
                  <tr key={booking.id} className="transition hover:bg-slate-50/70">
                    <td className="px-4 py-4 text-slate-700">{booking.userId}</td>
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      {resourceNameById.get(booking.resourceId) ?? booking.resourceId}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{booking.startTime}</td>
                    <td className="px-4 py-4 text-slate-700">{booking.endTime}</td>
                    <td className="px-4 py-4 text-slate-700">{booking.status}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={actionDisabled}
                          onClick={() => patchStatus(booking.id, 'APPROVED')}
                          className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={actionDisabled}
                          onClick={() => {
                            const reason = window.prompt('Reason for rejection (optional)') || 'Rejected'
                            patchStatus(booking.id, 'REJECTED', reason)
                          }}
                          className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
