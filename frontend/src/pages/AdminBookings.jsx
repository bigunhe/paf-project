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

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-6 shadow-[0_16px_40px_-24px_rgba(8,145,178,0.5)]">
        <h1 className="text-2xl font-bold text-slate-900">Admin Bookings</h1>
        <p className="mt-1 text-sm text-slate-600">Review requests and decide quickly with status filters.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm text-slate-700">
            Status Filter
            <select
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              className="rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status || 'ALL'} value={status}>
                  {status || 'ALL'}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Date Filter
            <input
              type="date"
              value={filters.date}
              onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))}
              className="rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2"
            />
          </label>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/50 bg-white/65 shadow-[0_10px_34px_-20px_rgba(15,23,42,0.45)] backdrop-blur-md">
        {loading ? (
          <div className="grid place-items-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-slate-500">No bookings match your filters.</p>
          </div>
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-slate-200/80 bg-white/70 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Faculty</th>
                <th className="px-4 py-3">Resource</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {bookings.map((booking) => {
                const actionDisabled = booking.status !== 'PENDING' || actionId === booking.id

                return (
                  <tr key={booking.id} className="transition hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium text-slate-700">{booking.userId}</td>
                    <td className="px-4 py-3 text-slate-700">
                      <div className="font-medium">{booking.studentName}</div>
                      <div className="text-xs text-slate-500">{booking.studentId}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{booking.faculty}</td>
                    <td className="px-4 py-3 text-slate-700">{booking.resourceName}</td>
                    <td className="px-4 py-3 text-slate-600">{displayDate(booking.date)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {booking.startTime} - {booking.endTime}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={actionDisabled}
                          onClick={() => approve(booking.id)}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={actionDisabled}
                          onClick={() => setRejectModal({ isOpen: true, bookingId: booking.id, reason: '' })}
                          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
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
