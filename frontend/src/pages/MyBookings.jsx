import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import BookingCard from '../components/BookingCard'
import BookingFormModal from '../components/BookingFormModal'
import api from '../features/core/api'
import { useAuth } from '../features/core/AuthContext'

function getReservedHours(bookings) {
  const approvedMinutes = bookings
    .filter((booking) => booking.status === 'APPROVED')
    .reduce((total, booking) => {
      const [startHours, startMinutes] = booking.startTime.split(':').map(Number)
      const [endHours, endMinutes] = booking.endTime.split(':').map(Number)
      const duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes)
      return total + Math.max(duration, 0)
    }, 0)

  return (approvedMinutes / 60).toFixed(1)
}

function toBookingStartDate(booking) {
  return new Date(`${booking.date}T${booking.startTime}:00`)
}

function formatPrettyDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function MyBookings() {
  const { currentUserId } = useAuth()
  const [bookings, setBookings] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [cancellingId, setCancellingId] = useState('')
  const [removingId, setRemovingId] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState(null)

  const totalBookings = bookings.length
  const activeRequests = bookings.filter((booking) => booking.status === 'APPROVED' || booking.status === 'PENDING').length
  const pendingAction = bookings.filter((booking) => booking.status === 'PENDING').length
  const reservedHours = getReservedHours(bookings)
  const nextUpBookings = bookings
    .filter((booking) => booking.status === 'APPROVED')
    .filter((booking) => toBookingStartDate(booking).getTime() >= Date.now())
    .sort((a, b) => toBookingStartDate(a).getTime() - toBookingStartDate(b).getTime())
    .slice(0, 3)

  const loadData = async () => {
    setLoading(true)
    try {
      const [{ data: bookingData }, { data: resourceData }] = await Promise.all([
        api.get('/bookings/my', { params: { userId: currentUserId } }),
        api.get('/resources'),
      ])
      setBookings(bookingData.filter((booking) => booking.status !== 'CANCELLED'))
      setResources(resourceData)
    } catch (error) {
      if (!error.response) {
        toast.error('Backend is unavailable. Start backend and verify MongoDB connection settings.')
      } else {
        toast.error(error.response?.data?.message || 'Failed to load bookings')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])

  const handleUpsertBooking = async (payload) => {
    setSubmitting(true)
    try {
      if (editingBooking) {
        await api.put(
          `/bookings/${editingBooking.id}`,
          {
            ...payload,
            userId: currentUserId,
          },
          {
            params: { userId: currentUserId },
          },
        )
        toast.success('Booking request updated')
      } else {
        await api.post('/bookings', {
          ...payload,
          userId: currentUserId,
        })
        toast.success('Booking request submitted')
      }

      setIsModalOpen(false)
      setEditingBooking(null)
      await loadData()
    } catch (error) {
      if (!error.response) {
        toast.error('Cannot submit: backend is offline or MongoDB connection failed.')
        return
      }
      const msg = error.response?.data?.message || 'Could not submit booking request'
      if (error.response?.status === 409) {
        toast.error(`Conflict: ${msg}`)
      } else {
        toast.error(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenEditBooking = (booking) => {
    if (booking.status !== 'PENDING') {
      return
    }
    setEditingId(booking.id)
    setEditingBooking(booking)
    setIsModalOpen(true)
    setTimeout(() => setEditingId(''), 250)
  }

  const handleCancelBooking = async (booking) => {
    if (booking.status !== 'PENDING' && booking.status !== 'APPROVED') {
      return
    }

    const confirmed = window.confirm('Cancel this booking request?')
    if (!confirmed) {
      return
    }

    setCancellingId(booking.id)
    try {
      await api.put(`/bookings/${booking.id}/cancel`, null, {
        params: { userId: currentUserId },
      })
      toast.success('Booking cancelled')
      setBookings((prev) => prev.filter((item) => item.id !== booking.id))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancel failed')
    } finally {
      setCancellingId('')
    }
  }

  const handleRemoveRejectedBooking = async (booking) => {
    if (booking.status !== 'REJECTED') {
      return
    }

    const confirmed = window.confirm('Remove this rejected booking from your list?')
    if (!confirmed) {
      return
    }

    setRemovingId(booking.id)
    try {
      await api.put(`/bookings/${booking.id}/remove-rejected`, null, {
        params: { userId: currentUserId },
      })
      toast.success('Rejected booking removed')
      setBookings((prev) => prev.filter((item) => item.id !== booking.id))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Remove failed')
    } finally {
      setRemovingId('')
    }
  }

  return (
    <section className="space-y-7">
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 px-5 py-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Resource Management</h1>
            <p className="text-sm text-slate-500">Track and manage your institutional bookings</p>
          </div>

         
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Total Bookings</p>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-3xl font-bold text-slate-900">{String(totalBookings).padStart(2, '0')}</span>
              <span className="text-xs font-semibold text-emerald-500">+12%</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Active Requests</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{String(activeRequests).padStart(2, '0')}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Pending Action</p>
            <p className="mt-1 text-3xl font-bold text-orange-500">{String(pendingAction).padStart(2, '0')}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Reserved Hours</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{reservedHours}h</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Next Up Bookings</h2>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Approved & Upcoming</p>
          </div>

          {nextUpBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-6 text-sm text-slate-500">
              No upcoming approved bookings right now.
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {nextUpBookings.map((booking) => (
                <article
                  key={`next-${booking.id}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-[0_10px_26px_-22px_rgba(15,23,42,0.6)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-700">⌂</div>
                      <div>
                        <h3 className="text-2xl font-semibold leading-tight text-slate-900">{booking.resourceName}</h3>
                        <p className="text-sm text-slate-500">{booking.faculty || booking.resourceId}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                      Next Up
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Date</p>
                      <p className="text-base font-semibold text-slate-800">{formatPrettyDate(booking.date)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Time</p>
                      <p className="text-base font-semibold text-slate-800">{booking.startTime} - {booking.endTime}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Capacity</p>
                      <p className="text-base font-semibold text-slate-800">{booking.attendeesCount} People</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Status</p>
                      <p className="text-sm font-semibold text-blue-700">Approved</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="min-w-44 flex-1 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                    >
                      Entry Pass
                    </button>
                    <button
                      type="button"
                      disabled={cancellingId === booking.id}
                      onClick={() => handleCancelBooking(booking)}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent Request History</h2>
            <p className="text-xs text-slate-500">{bookings.length} total</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
            >
              Filters
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl bg-sky-950 px-4 py-2 text-sm font-semibold text-white shadow-sm"
            >
              + New Request
            </button>
          </div>
        </div>

        <div className="mt-4 hidden rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 md:grid md:grid-cols-[2fr_1.3fr_1fr_1.3fr]">
          <span>Resource Details</span>
          <span>Scheduled Time</span>
          <span>Status</span>
          <span>Operations</span>
        </div>

        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-slate-200 py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 py-14 text-center">
            <h2 className="text-lg font-semibold text-slate-800">No bookings yet</h2>
            <p className="mt-2 text-sm text-slate-500">Create your first booking request to get started.</p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                editing={editingId === booking.id}
                onEdit={handleOpenEditBooking}
                cancelling={cancellingId === booking.id}
                onCancel={handleCancelBooking}
                removing={removingId === booking.id}
                onRemoveRejected={handleRemoveRejectedBooking}
              />
            ))}
          </div>
        )}

        <div className="mt-3 text-xs text-slate-500">
          Displaying {bookings.length} of {bookings.length} records
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
           <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.65)]">

            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/study1.jpg')",
              }}
            />

            {/* Blue Overlay */}
            <div className="absolute inset-0 bg-sky-900/60" />

            {/* Content */}
            <div className="relative p-6 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-200">
                New Facility
              </p>

              <h3 className="mt-3 text-3xl font-semibold leading-tight">
                Postgrad Research Clusters
              </h3>

              <p className="mt-3 max-w-md text-sm text-slate-100">
                High-performance computing resources are now available for prioritized academic bookings.
              </p>

              <button
                type="button"
                className="mt-6 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900"
              >
                Explore Catalog
              </button>
            </div>

          </div>

        <div className="relative overflow-hidden rounded-3xl shadow-[0_18px_40px_-28px_rgba(15,23,42,0.8)]">

      {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/study2.jpg')",
          }}
        />

        {/* Blue Transparent Overlay */}
        <div className="absolute inset-0 bg-sky-950/70" />

        {/* Content */}
        <div className="relative p-6 text-white">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg">
            ⚖
          </div>

          <h3 className="mt-4 text-2xl font-semibold">Resource Policy</h3>

          <p className="mt-3 text-sm text-sky-100">
            Ensure compliance with the 2024 University Resource Access guidelines.
          </p>

          <ul className="mt-4 space-y-2 text-sm text-sky-200">
            <li>Safety module verified</li>
            <li>Departmental approval active</li>
            <li>Booking rules enforced</li>
          </ul>

          <button
            type="button"
            className="mt-6 text-sm font-semibold text-white underline decoration-sky-300 underline-offset-4"
          >
            View Official Guidelines
          </button>

        </div>
    </div>
      </div>

      <BookingFormModal
        isOpen={isModalOpen}
        resources={resources}
        submitting={submitting}
        mode={editingBooking ? 'edit' : 'create'}
        initialValues={editingBooking}
        onClose={() => {
          setIsModalOpen(false)
          setEditingBooking(null)
        }}
        onSubmit={handleUpsertBooking}
      />
    </section>
  )
}
