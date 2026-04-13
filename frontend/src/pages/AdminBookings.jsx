import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import StatusBadge from '../components/StatusBadge'
import api from '../features/core/api'

const STATUS_OPTIONS = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

function displayDate(isoDate) {
  if (!isoDate) return '-'
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString()
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState('')
  const [filters, setFilters] = useState({ status: '', date: '' })
  const [rejectModal, setRejectModal] = useState({ isOpen: false, bookingId: '', reason: '' })

  const loadBookings = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.status) params.status = filters.status
      if (filters.date) params.date = filters.date

      const { data } = await api.get('/bookings', { params })
      setBookings(data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load admin bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.date])

  const approve = async (id) => {
    setActionId(id)
    try {
      await api.put(`/bookings/${id}/approve`)
      toast.success('Booking approved')
      await loadBookings()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed')
    } finally {
      setActionId('')
    }
  }

  const reject = async () => {
    if (!rejectModal.reason.trim()) {
      toast.error('Rejection reason is required')
      return
    }

    setActionId(rejectModal.bookingId)
    try {
      await api.put(`/bookings/${rejectModal.bookingId}/reject`, {
        reason: rejectModal.reason.trim(),
      })
      toast.success('Booking rejected')
      setRejectModal({ isOpen: false, bookingId: '', reason: '' })
      await loadBookings()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rejection failed')
    } finally {
      setActionId('')
    }
  }

  const totalBookings = bookings.length
  const resourceOptions = [...new Set(bookings.map((booking) => booking.resourceName).filter(Boolean))]

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_34px_-26px_rgba(15,23,42,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Booking Requests</h1>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm font-medium text-slate-400">{totalBookings.toLocaleString()} total bookings recorded this semester</span>
            </div>
          </div>

          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Export CSV
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Filter by Status</span>
              {STATUS_OPTIONS.map((statusOption) => {
                const value = statusOption
                const active = filters.status === value
                return (
                  <button
                    key={statusOption || 'ALL'}
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, status: value }))}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                      active ? 'bg-sky-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {statusOption || 'All'}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Resource</span>
              <select
                value=""
                onChange={() => {}}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
              >
                <option value="">All Resources</option>
                {resourceOptions.map((resourceName) => (
                  <option key={resourceName} value={resourceName}>
                    {resourceName}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-sm text-slate-600">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Date</span>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                />
              </label>

              <button
                type="button"
                onClick={() => setFilters({ status: '', date: '' })}
                className="text-sm font-semibold text-sky-700 hover:text-sky-900"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-[0_18px_34px_-26px_rgba(15,23,42,0.45)]">
        {loading ? (
          <div className="grid place-items-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-500">No bookings match your filters.</p>
          </div>
        ) : (
          <table className="w-full min-w-[980px] text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">User Details</th>
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">Faculty</th>
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">Resource</th>
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">Date & Time</th>
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">Status</th>
                <th className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => {
                const actionDisabled = booking.status !== 'PENDING' || actionId === booking.id

                return (
                  <tr key={booking.id} className="transition hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{booking.studentName || booking.userId}</div>
                      <div className="text-xs text-slate-500">SID: {booking.studentId || '-'}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{booking.faculty}</td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{booking.resourceName}</div>
                      <div className="text-xs text-slate-500">{booking.resourceId}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-800">{displayDate(booking.date)}</div>
                      <div className="text-xs text-slate-500">{booking.startTime} - {booking.endTime}</div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={actionDisabled}
                          onClick={() => approve(booking.id)}
                          className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={actionDisabled}
                          onClick={() => setRejectModal({ isOpen: true, bookingId: booking.id, reason: '' })}
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

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
          <span>Showing 1-{Math.min(10, totalBookings)} of {totalBookings.toLocaleString()} bookings</span>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-md border border-slate-200 px-2 py-1">1</button>
            <button type="button" className="rounded-md border border-slate-200 px-2 py-1">2</button>
            <button type="button" className="rounded-md border border-slate-200 px-2 py-1">3</button>
          </div>
        </div>
      </div>

      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/60 bg-white/80 p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Reject booking</h2>
            <p className="mt-1 text-sm text-slate-600">Add a reason visible to the user.</p>
            <textarea
              rows={4}
              maxLength={300}
              value={rejectModal.reason}
              onChange={(event) =>
                setRejectModal((prev) => ({
                  ...prev,
                  reason: event.target.value,
                }))
              }
              className="mt-3 w-full rounded-xl border border-slate-300/80 bg-white px-3 py-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModal({ isOpen: false, bookingId: '', reason: '' })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
              >
                Close
              </button>
              <button
                type="button"
                disabled={actionId === rejectModal.bookingId}
                onClick={reject}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {actionId === rejectModal.bookingId ? 'Rejecting...' : 'Confirm reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
