import { useEffect, useMemo, useState } from 'react'
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

function formatHourLabel(hour) {
  const normalizedHour = ((hour % 24) + 24) % 24
  const period = normalizedHour >= 12 ? 'PM' : 'AM'
  const displayHour = normalizedHour % 12 || 12
  return `${displayHour} ${period}`
}

function getApprovalHours(bookings) {
  const approvedItems = bookings.filter(
    (booking) => booking.status === 'APPROVED' && booking.createdAt && booking.approvedAt,
  )

  if (approvedItems.length === 0) {
    return 0
  }

  const totalHours = approvedItems.reduce((total, booking) => {
    const createdAt = new Date(booking.createdAt).getTime()
    const approvedAt = new Date(booking.approvedAt).getTime()
    if (Number.isNaN(createdAt) || Number.isNaN(approvedAt) || approvedAt < createdAt) {
      return total
    }

    return total + (approvedAt - createdAt) / (1000 * 60 * 60)
  }, 0)

  return totalHours / approvedItems.length
}

export default function MyBookings() {
  const { currentUserId } = useAuth()
  const [bookings, setBookings] = useState([])
  const [resources, setResources] = useState([])
  const [resourcesLoading, setResourcesLoading] = useState(false)
  const [resourcesError, setResourcesError] = useState('')
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
  const rejectedRequests = bookings.filter((booking) => booking.status === 'REJECTED').length
  const reservedHours = getReservedHours(bookings)
  const bookingInsights = useMemo(() => {
    const hourCounts = new Map()

    bookings.forEach((booking) => {
      const [startHour] = booking.startTime.split(':').map(Number)
      if (Number.isNaN(startHour)) {
        return
      }

      hourCounts.set(startHour, (hourCounts.get(startHour) || 0) + 1)
    })

    let peakHour = null
    let peakCount = 0

    hourCounts.forEach((count, hour) => {
      if (count > peakCount || (count === peakCount && (peakHour === null || hour < peakHour))) {
        peakHour = hour
        peakCount = count
      }
    })

    return {
      peakHour,
      peakCount,
      peakRange: peakHour === null ? 'No data yet' : `${formatHourLabel(peakHour)} – ${formatHourLabel(peakHour + 2)}`,
      avgApprovalHours: getApprovalHours(bookings),
    }
  }, [bookings])
  const nextUpBookings = bookings
    .filter((booking) => booking.status === 'APPROVED')
    .filter((booking) => toBookingStartDate(booking).getTime() >= Date.now())
    .sort((a, b) => toBookingStartDate(a).getTime() - toBookingStartDate(b).getTime())
    .slice(0, 3)

  const loadData = async () => {
    setLoading(true)
    setResourcesLoading(true)
    setResourcesError('')
    try {
      const [bookingResult, resourceResult] = await Promise.allSettled([
        api.get('/bookings/my', { params: { userId: currentUserId } }),
        api.get('/resources'),
      ])

      if (bookingResult.status === 'fulfilled') {
        setBookings(bookingResult.value.data.filter((booking) => booking.status !== 'CANCELLED'))
      } else {
        const error = bookingResult.reason
        if (!error.response) {
          toast.error('Backend is unavailable. Start backend and verify MongoDB connection settings.')
        } else {
          toast.error(error.response?.data?.message || 'Failed to load bookings')
        }
      }

      if (resourceResult.status === 'fulfilled') {
        setResources(resourceResult.value.data)
      } else {
        const error = resourceResult.reason
        const msg = error.response?.data?.message || 'Failed to load resources'
        setResources([])
        setResourcesError(msg)
        toast.error(msg)
      }
    } catch (error) {
      if (!error.response) {
        toast.error('Backend is unavailable. Start backend and verify MongoDB connection settings.')
      } else {
        toast.error(error.response?.data?.message || 'Failed to load bookings')
      }
    } finally {
      setLoading(false)
      setResourcesLoading(false)
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
    <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#f7fafc_0%,#eef2ff_100%)] text-slate-900 shadow-[0_30px_70px_-42px_rgba(15,23,42,0.45)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,116,144,0.15),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(30,64,175,0.14),transparent_30%)]" />

      <div className="relative space-y-6 p-5 md:p-7">
        <header className="rounded-3xl border border-slate-200/80 bg-[linear-gradient(120deg,#0f172a_0%,#1e293b_58%,#0f172a_100%)] p-6 text-white shadow-[0_24px_48px_-34px_rgba(15,23,42,0.9)] md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/90">Bookings Workspace</p>
              <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
                Command center for your resource schedule
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Track approvals, monitor your timeline, and launch new requests from one focused interface.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_12px_24px_-16px_rgba(34,211,238,0.8)] transition hover:-translate-y-0.5 hover:bg-cyan-300"
            >
              + New Request
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricPanel label="Total Bookings" value={String(totalBookings).padStart(2, '0')} />
            <MetricPanel label="Pending" value={String(pendingAction).padStart(2, '0')} />
            <MetricPanel label="Active Requests" value={String(activeRequests).padStart(2, '0')} />
            <MetricPanel label="Allocated Hours" value={`${reservedHours}h`} />
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.5)] backdrop-blur md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Approved timeline</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Next Up</h2>
              </div>
              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Live
              </span>
            </div>

            {nextUpBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                No upcoming approved bookings right now.
              </div>
            ) : (
              <div className="space-y-3">
                {nextUpBookings.map((booking, index) => (
                  <article
                    key={`next-${booking.id}`}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.45)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-20px_rgba(15,23,42,0.5)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Slot {index + 1}</p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-900">{booking.resourceName}</h3>
                        <p className="text-sm text-slate-500">{booking.faculty || booking.resourceId}</p>
                      </div>
                      <StatusBadge status="APPROVED" />
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      <CompactStat label="Date" value={formatPrettyDate(booking.date)} />
                      <CompactStat label="Time" value={`${booking.startTime} - ${booking.endTime}`} />
                      <CompactStat label="People" value={String(booking.attendeesCount)} />
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-500">Timeline item ready</p>
                      <button
                        type="button"
                        disabled={cancellingId === booking.id}
                        onClick={() => handleCancelBooking(booking)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>

          <article className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.6)]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "linear-gradient(140deg, rgba(15,23,42,0.82), rgba(14,116,144,0.62)), url('/study2.jpg')",
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.2),transparent_38%)]" />

            <div className="relative flex min-h-[340px] flex-col justify-between p-6 text-white md:p-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-100/85">Operations snapshot</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">Today&apos;s Booking Pulse</h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-slate-100/90">
                  A quick view of queue pressure, rejected requests, and your next approved slot in the timeline.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-100/80">Pending</p>
                    <p className="mt-1 text-lg font-semibold">{pendingAction}</p>
                  </div>
                  <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-100/80">Rejected</p>
                    <p className="mt-1 text-lg font-semibold">{rejectedRequests}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 backdrop-blur">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-100/80">Next approved slot</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {nextUpBookings[0]
                      ? `${formatPrettyDate(nextUpBookings[0].date)} • ${nextUpBookings[0].startTime}`
                      : 'No approved slot scheduled'}
                  </p>
                  <p className="mt-1 text-xs text-slate-200/90">
                    API: {resourcesError ? 'Degraded' : resourcesLoading ? 'Syncing data' : 'Operational'}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div
                    className="group rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white/15 hover:shadow-[0_16px_30px_-22px_rgba(0,0,0,0.45)]"
                    style={{ animation: 'insightRise 600ms ease-out 90ms both' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/80">Peak Hours</p>
                        <h4 className="mt-1 text-base font-semibold text-white">Most bookings</h4>
                      </div>
                      <div className="rounded-full border border-white/20 bg-white/10 p-2 transition duration-300 group-hover:scale-105">
                        <span className="block h-3 w-3 rounded-full border-2 border-white/80 border-t-transparent" />
                      </div>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-white">
                      {bookingInsights.peakHour === null ? 'No peak yet' : bookingInsights.peakRange}
                    </p>
                    <p className="mt-1 text-xs text-slate-200/90">
                      {bookingInsights.peakHour === null
                        ? 'Waiting for enough booking data'
                        : `${bookingInsights.peakCount} booking${bookingInsights.peakCount === 1 ? '' : 's'} at that window`}
                    </p>
                  </div>

                  <div
                    className="group rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:bg-white/15 hover:shadow-[0_16px_30px_-22px_rgba(0,0,0,0.45)]"
                    style={{ animation: 'insightRise 600ms ease-out 180ms both' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/80">Avg Approval Time</p>
                        <h4 className="mt-1 text-base font-semibold text-white">Approval speed</h4>
                      </div>
                      <div className="rounded-full border border-white/20 bg-white/10 p-2 transition duration-300 group-hover:scale-105">
                        <span className="block h-3 w-3 rounded-full border-2 border-white/80 border-b-transparent" />
                      </div>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-white">~{bookingInsights.avgApprovalHours.toFixed(1)} hours</p>
                    <p className="mt-1 text-xs text-slate-200/90">
                      Based on approved bookings only
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-cyan-50"
                >
                  Open Booking Form
                </button>
              </div>
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/92 p-5 shadow-[0_18px_42px_-32px_rgba(15,23,42,0.45)] backdrop-blur md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">History</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Recent Requests</h2>
            </div>
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">{bookings.length} records</p>
          </div>

          <div className="mt-4 hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 md:grid md:grid-cols-[2fr_1.3fr_1fr_1.3fr]">
            <span>Resource Details</span>
            <span>Scheduled Time</span>
            <span>Status</span>
            <span>Operations</span>
          </div>

          {loading ? (
            <div className="grid place-items-center rounded-2xl border border-slate-200 py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600" />
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
        </section>
      </div>

      <style>{`
        @keyframes insightRise {
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

      <BookingFormModal
        isOpen={isModalOpen}
        resources={resources}
        resourcesLoading={resourcesLoading}
        resourcesError={resourcesError}
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

function MetricPanel({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100/75">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
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
