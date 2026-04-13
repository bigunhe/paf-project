import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import BookingCard from '../components/BookingCard'
import BookingFormModal from '../components/BookingFormModal'
import StatusBadge from '../components/StatusBadge'
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
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_100%)] text-slate-900 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.45)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_26%)]" />

      <div className="relative space-y-6 p-5 md:p-6 lg:p-7">
        <header className="space-y-4">
          <div className="space-y-2 px-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-800/45">Institutional Overview</p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-emerald-950 md:text-5xl">
              Welcome back. Find Your Resource Allocation & Curated Scheduling here.
            </h1>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_44px_-30px_rgba(15,23,42,0.3)]">
            <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
              <div className="p-6 md:p-8">
                <p className="text-xs font-semibold text-slate-400">Session Status: Active</p>
                <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight tracking-tight text-emerald-950">
                  Resource Booking Hub
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                  Manage the balance between laboratory availability and research requirements with a clean, focused workspace.
                </p>

                <div className="mt-8 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-3">
                  <div>
                    <p className="text-3xl font-semibold text-emerald-950">{String(totalBookings).padStart(2, '0')}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Total Bookings</p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-emerald-950">{String(pendingAction).padStart(2, '0')}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Pending Approval</p>
                  </div>
                  <div>
                    <p className="text-3xl font-semibold text-emerald-950">{reservedHours}h</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Allocated Hours</p>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[280px] border-t border-slate-200 bg-[linear-gradient(180deg,#0f1f4a_0%,#0b1433_100%)] p-6 md:p-8 lg:border-l lg:border-t-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_32%)]" />

                <div className="relative mx-auto mt-6 max-w-sm rounded-2xl bg-white/95 p-6 text-center shadow-[0_24px_44px_-30px_rgba(0,0,0,0.45)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-900/55">Quick Action</p>
                  <h3 className="mt-3 text-2xl font-semibold text-blue-950">Start New Session</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Initiate a new resource request for your upcoming academic schedule.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="mt-5 w-full rounded-xl bg-blue-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    + New Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Approved & upcoming</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Next Up Bookings</h2>
            </div>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700">
              Upcoming
            </span>
          </div>

          {nextUpBookings.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 px-6 py-10 text-sm text-slate-500">
              No upcoming approved bookings right now.
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <article className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-950 text-white shadow-[0_20px_42px_-30px_rgba(15,23,42,0.75)]">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-35"
                  style={{
                    backgroundImage: "linear-gradient(135deg, rgba(15,23,42,0.15), rgba(30,64,175,0.7)), url('/study1.jpg')",
                  }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.2),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.18),rgba(15,23,42,0.78))]" />
                <div className="relative flex min-h-[320px] flex-col justify-between p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-3">
                      <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                        Featured booking
                      </div>
                      <div>
                        <h3 className="max-w-md text-3xl font-black tracking-tight text-white">{nextUpBookings[0].resourceName}</h3>
                        <p className="mt-2 text-sm text-slate-300">{nextUpBookings[0].faculty || nextUpBookings[0].resourceId}</p>
                      </div>
                    </div>
                    <StatusBadge status="APPROVED" />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <MiniMetric label="Date" value={formatPrettyDate(nextUpBookings[0].date)} />
                    <MiniMetric label="Time" value={`${nextUpBookings[0].startTime} - ${nextUpBookings[0].endTime}`} />
                    <MiniMetric label="Capacity" value={`${nextUpBookings[0].attendeesCount} people`} />
                  </div>

                </div>
              </article>

              <div className="space-y-3">
                {nextUpBookings.slice(1).map((booking, index) => (
                  <article
                    key={`next-${booking.id}`}
                    className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_14px_32px_-24px_rgba(15,23,42,0.45)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_38px_-26px_rgba(15,23,42,0.5)]"
                  >
                    <div className="flex items-stretch">
                      <div className="flex w-16 items-center justify-center bg-gradient-to-b from-blue-600 to-indigo-600 text-lg font-black text-white">
                        0{index + 2}
                      </div>
                      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <h3 className="text-base font-semibold tracking-tight text-slate-950">{booking.resourceName}</h3>
                              <p className="text-xs text-slate-500">{booking.faculty || booking.resourceId}</p>
                            </div>
                            <StatusBadge status="APPROVED" />
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            <CompactStat label="Date" value={formatPrettyDate(booking.date)} />
                            <CompactStat label="Time" value={`${booking.startTime} - ${booking.endTime}`} />
                            <CompactStat label="People" value={String(booking.attendeesCount)} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-slate-500">Up next in your timeline</p>
                          <button
                            type="button"
                            disabled={cancellingId === booking.id}
                            onClick={() => handleCancelBooking(booking)}
                            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950 md:text-xl">Recent Request History</h2>
              <p className="text-xs text-slate-500">{bookings.length} total</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                Filters
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_-18px_rgba(15,23,42,0.65)] transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                + New Request
              </button>
            </div>
          </div>

          <div className="mt-4 hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 md:grid md:grid-cols-[2fr_1.3fr_1fr_1.3fr]">
            <span>Resource Details</span>
            <span>Scheduled Time</span>
            <span>Status</span>
            <span>Operations</span>
          </div>

          {loading ? (
            <div className="grid place-items-center rounded-[1.5rem] border border-slate-200 py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 py-14 text-center">
              <h2 className="text-lg font-semibold text-slate-800">No bookings yet</h2>
              <p className="mt-2 text-sm text-slate-500">Create your first booking request to get started.</p>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {bookings.map((booking, index) => (
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

          <div className="mt-3 text-xs text-slate-500">Displaying {bookings.length} of {bookings.length} records</div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "linear-gradient(135deg, rgba(30,64,175,0.78), rgba(37,99,235,0.55)), url('/study1.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/35 via-transparent to-transparent" />
            <div className="relative p-6 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-200">New Facility</p>
              <h3 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">Postgrad Research Clusters</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-100/95">
                High-performance computing resources are now available for prioritized academic bookings.
              </p>
              <button
                type="button"
                className="mt-6 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:-translate-y-0.5"
              >
                Explore Catalog
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.45)]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "linear-gradient(135deg, rgba(15,23,42,0.78), rgba(30,41,59,0.65)), url('/study2.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-transparent to-blue-950/25" />
            <div className="relative p-6 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-lg backdrop-blur">
                ⚖
              </div>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight">Resource Policy</h3>
              <p className="mt-3 text-sm leading-6 text-slate-100/90">
                Ensure compliance with the 2024 University Resource Access guidelines.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                <li>Safety module verified</li>
                <li>Departmental approval active</li>
                <li>Booking rules enforced</li>
              </ul>
              <button
                type="button"
                className="mt-6 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                View Official Guidelines
              </button>
            </div>
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

function InfoChip({ label, value, valueClassName = 'text-slate-800' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${valueClassName}`}>{value}</p>
    </div>
  )
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/8 p-3 backdrop-blur">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

function CompactStat({ label, value }) {
  return (
    <div className="rounded-[1rem] border border-slate-200 bg-white px-3 py-2 shadow-[0_8px_18px_-16px_rgba(15,23,42,0.45)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
