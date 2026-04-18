import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../features/core/api'
import { useAuth } from '../features/core/AuthContext'
import BookingFormModal from '../components/BookingFormModal'

export default function MyBookings() {
  const { currentUserId, user } = useAuth()
  const [searchParams] = useSearchParams()
  const [bookings, setBookings] = useState([])
  const [resources, setResources] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeView, setActiveView] = useState('ALL')
  const [editingBooking, setEditingBooking] = useState(null)
  const [cancellingBookingId, setCancellingBookingId] = useState('')
  const [deletingBookingId, setDeletingBookingId] = useState('')

  const totalBookings = bookings.length
  const pendingRequests = useMemo(
    () => bookings.filter((booking) => booking.status === 'PENDING').length,
    [bookings],
  )
  const approvedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === 'APPROVED'),
    [bookings],
  )
  const rejectedRequests = useMemo(
    () => bookings.filter((booking) => booking.status === 'REJECTED').length,
    [bookings],
  )

  const timelineSectionRef = useRef(null)

  const resourceNameById = useMemo(() => {
    const map = new Map()
    resources.forEach((r) => map.set(r.id, `${r.name} (${r.type})`))
    return map
  }, [resources])

  const formatDate = (value) => {
    if (!value) return 'N/A'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (value) => {
    if (!value) return 'N/A'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const allocatedHours = useMemo(() => {
    const total = approvedBookings.reduce((sum, booking) => {
      const start = new Date(booking.startTime).getTime()
      const end = new Date(booking.endTime).getTime()
      if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return sum
      return sum + (end - start) / (1000 * 60 * 60)
    }, 0)
    return Math.round(total * 10) / 10
  }, [approvedBookings])

  const nextApprovedBooking = useMemo(() => {
    const now = Date.now()
    const upcoming = approvedBookings
      .filter((booking) => {
        const start = new Date(booking.startTime).getTime()
        return !Number.isNaN(start) && start >= now
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

    if (upcoming.length > 0) return upcoming[0]
    return approvedBookings[0] || null
  }, [approvedBookings])

  const peakHourWindow = useMemo(() => {
    if (bookings.length === 0) return 'N/A'

    const counts = new Map()
    bookings.forEach((booking) => {
      const start = new Date(booking.startTime)
      if (Number.isNaN(start.getTime())) return
      const hour = start.getHours()
      counts.set(hour, (counts.get(hour) || 0) + 1)
    })

    if (counts.size === 0) return 'N/A'

    const [hour, count] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
    const nextHour = (hour + 2) % 24
    const formatHour = (h) => {
      const suffix = h >= 12 ? 'PM' : 'AM'
      const normalized = h % 12 === 0 ? 12 : h % 12
      return `${normalized} ${suffix}`
    }

    return {
      label: `${formatHour(hour)} - ${formatHour(nextHour)}`,
      count,
    }
  }, [bookings])

  const load = async () => {
    setLoading(true)
    const [{ data: bookingData }, { data: resourceData }] = await Promise.all([
      api.get('/bookings', { params: { userId: currentUserId } }),
      api.get('/resources', { params: { status: 'ACTIVE' } }),
    ])

    // Keep cancelled rows out of the user dashboard after a cancel action.
    setBookings(bookingData.filter((booking) => booking.status !== 'CANCELLED'))
    setResources(resourceData)
    const firstActiveId = resourceData.find((r) => r.status === 'ACTIVE')?.id
    if (!firstActiveId) {
      setIsBookingFormOpen(false)
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

  const bookingIdParam = searchParams.get('bookingId')
  useEffect(() => {
    if (!bookingIdParam || loading || bookings.length === 0) return
    const el = document.querySelector(`[data-booking-id="${bookingIdParam}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('ring-2', 'ring-cyan-500', 'ring-offset-2', 'bg-sky-50/80')
    const t = window.setTimeout(() => {
      el.classList.remove('ring-2', 'ring-cyan-500', 'ring-offset-2', 'bg-sky-50/80')
    }, 2400)
    return () => window.clearTimeout(t)
  }, [bookingIdParam, loading, bookings])

  const submitFromModal = async (formValues) => {
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        resourceId: formValues.resourceId,
        startTime: `${formValues.date}T${formValues.startTime}`,
        endTime: `${formValues.date}T${formValues.endTime}`,
        purpose: formValues.purpose,
        expectedAttendees: Number(formValues.attendeesCount),
        userId: currentUserId,
      }

      if (editingBooking?.id) {
        await api.put(`/bookings/${editingBooking.id}`, {
          resourceId: payload.resourceId,
          startTime: payload.startTime,
          endTime: payload.endTime,
          purpose: payload.purpose,
          expectedAttendees: payload.expectedAttendees,
        })
        toast.success('Booking updated successfully.')
      } else {
        await api.post('/bookings', payload)
        toast.success('Booking request submitted.')
      }

      closeBookingForm()
      await load()
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const openBookingForm = () => {
    setEditingBooking(null)
    setIsBookingFormOpen(true)
  }

  const closeBookingForm = () => {
    setIsBookingFormOpen(false)
    setEditingBooking(null)
  }

  const toDateInput = (value) => {
    if (!value) return ''
    if (typeof value === 'string' && value.includes('T')) return value.slice(0, 10)
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toISOString().slice(0, 10)
  }

  const toTimeInput = (value) => {
    if (!value) return ''
    if (typeof value === 'string' && value.includes('T')) return value.slice(11, 16)
    if (typeof value === 'string' && value.length >= 5 && value.includes(':')) return value.slice(0, 5)
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toTimeString().slice(0, 5)
  }

  const openEditBookingForm = (booking) => {
    setEditingBooking(booking)
    setIsBookingFormOpen(true)
  }

  const cancelBooking = async (booking) => {
    if (!booking?.id) return
    setError('')
    setCancellingBookingId(booking.id)
    try {
      await api.patch(`/bookings/${booking.id}/cancel`)
      toast.success('Booking cancelled successfully.')
      await load()
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setCancellingBookingId('')
    }
  }

  const deleteBooking = async (booking) => {
    if (!booking?.id) return
    setError('')
    setDeletingBookingId(booking.id)
    try {
      await api.delete(`/bookings/${booking.id}`)
      toast.success('Booking removed from list.')
      await load()
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setDeletingBookingId('')
    }
  }

  const modalInitialValues = useMemo(() => {
    const fallbackStudentName =
      user?.name || user?.fullName || user?.displayName || user?.username || user?.email?.split('@')[0] || 'Student User'

    return {
      studentId: editingBooking?.studentId || user?.studentId || currentUserId || '',
      studentName: editingBooking?.studentName || fallbackStudentName,
      faculty: 'Faculty of Computing',
      resourceId: editingBooking?.resourceId || '',
      date: toDateInput(editingBooking?.startTime || editingBooking?.date),
      startTime: toTimeInput(editingBooking?.startTime),
      endTime: toTimeInput(editingBooking?.endTime),
      purpose: editingBooking?.purpose || '',
      attendeesCount: editingBooking?.expectedAttendees ?? editingBooking?.attendeesCount ?? 1,
    }
  }, [editingBooking, user, currentUserId])

  const scrollToTimeline = () => {
    timelineSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const visibleBookings = useMemo(() => {
    if (activeView === 'ACTIVE') {
      return bookings.filter((booking) => booking.status === 'APPROVED')
    }
    return bookings
  }, [activeView, bookings])

  const featureBooking = useMemo(() => {
    return approvedBookings[0] || bookings[0] || null
  }, [approvedBookings, bookings])

  const getStatusTheme = (status) => {
    if (status === 'APPROVED') {
      return {
        rail: 'bg-emerald-400',
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      }
    }
    if (status === 'PENDING') {
      return {
        rail: 'bg-amber-400',
        badge: 'border-amber-200 bg-amber-50 text-amber-700',
      }
    }
    if (status === 'REJECTED') {
      return {
        rail: 'bg-rose-400',
        badge: 'border-rose-200 bg-rose-50 text-rose-700',
      }
    }
    return {
      rail: 'bg-slate-300',
      badge: 'border-slate-200 bg-slate-50 text-slate-700',
    }
  }

  return (
    <section className="space-y-6" ref={timelineSectionRef}>
      <div className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-[#0f172a] via-[#111c38] to-[#0b1020] px-4 py-3 shadow-[0_22px_45px_-30px_rgba(15,23,42,0.75)] md:px-6 md:py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/85">My Bookings</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white md:text-3xl">Manage your bookings</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-300 md:text-sm">
              Track your active research and laboratory reservations.
            </p>
          </div>

          <button
            type="button"
            onClick={openBookingForm}
            className="inline-flex h-10 items-center gap-2 self-start rounded-xl bg-white px-4 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-950 text-xs text-white">+</span>
            Start New Session
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/70">Total Bookings</p>
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <p className="text-2xl font-semibold leading-none">{totalBookings}</p>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-100 text-sky-700">□</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/70">Pending Approval</p>
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <p className="text-2xl font-semibold leading-none">{pendingRequests}</p>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-100 text-sky-700">◧</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-white backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/70">Allocated Hours</p>
            <div className="mt-1.5 flex items-center justify-between gap-3">
              <p className="text-2xl font-semibold leading-none">{allocatedHours}</p>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-100 text-indigo-700">◔</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-[#eef3f8] p-4 shadow-[0_20px_45px_-40px_rgba(15,23,42,0.65)] md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveView('ALL')}
              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                activeView === 'ALL' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Reservations
            </button>
            <button
              type="button"
              onClick={() => setActiveView('ACTIVE')}
              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition ${
                activeView === 'ACTIVE' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Active Only
            </button>
          </div>
          <div className="text-xs text-slate-400">{visibleBookings.length} cards</div>
        </div>

        {loading ? (
          <div className="mt-6 grid min-h-[220px] place-items-center rounded-2xl border border-slate-200 bg-white">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
          </div>
        ) : visibleBookings.length === 0 ? (
          <div className="mt-6 grid min-h-[220px] place-items-center rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            No reservations in this view.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {visibleBookings.map((booking) => {
              const statusTheme = getStatusTheme(booking.status)
              const resourceLabel = resourceNameById.get(booking.resourceId) ?? booking.resourceId
              return (
                <article
                  key={booking.id}
                  data-booking-id={booking.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_30px_-30px_rgba(15,23,42,0.8)]"
                >
                  <div className="grid min-h-[220px] grid-cols-[4px_minmax(0,1fr)]">
                    <div className={statusTheme.rail} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-md bg-slate-100 text-xs font-semibold text-slate-700">
                          {(resourceLabel || 'R').charAt(0)}
                        </div>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusTheme.badge}`}>
                          {booking.status}
                        </span>
                      </div>

                      <h3 className="mt-3 text-2xl font-semibold leading-tight text-slate-900">{resourceLabel}</h3>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">{booking.purpose || 'No purpose provided.'}</p>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                        <span>{formatDate(booking.startTime)}</span>
                        <span>
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => openEditBookingForm(booking)}
                          disabled={booking.status === 'CANCELLED'}
                          className="rounded-lg border border-slate-200 bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700"
                        >
                          Modify
                        </button>
                        {booking.status === 'PENDING' || booking.status === 'APPROVED' ? (
                          <button
                            type="button"
                            disabled={cancellingBookingId === booking.id}
                            onClick={() => cancelBooking(booking)}
                            className="text-xs font-semibold uppercase tracking-[0.08em] text-rose-500 disabled:opacity-50"
                          >
                            {cancellingBookingId === booking.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        ) : booking.status === 'REJECTED' ? (
                          <button
                            type="button"
                            disabled={deletingBookingId === booking.id}
                            onClick={() => deleteBooking(booking)}
                            className="text-xs font-semibold uppercase tracking-[0.08em] text-rose-600 disabled:opacity-50"
                          >
                            {deletingBookingId === booking.id ? 'Deleting...' : 'Delete'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={scrollToTimeline}
                            className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500"
                          >
                            Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}

            <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white">
              <div className="grid h-full min-h-[220px] grid-cols-1 md:grid-cols-[1.2fr_1fr]">
                <div className="p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200/80">Campus Spotlight</p>
                  <h3 className="mt-2 text-3xl font-semibold leading-tight">Research Suite Now Open</h3>
                  <p className="mt-3 text-sm text-slate-300">
                    Check new resource slots, updated equipment availability, and extended operation hours.
                  </p>
                  <button
                    type="button"
                    onClick={openBookingForm}
                    className="mt-5 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white ring-1 ring-white/25"
                  >
                    Book Suite
                  </button>
                </div>
                <div className="hidden md:block bg-[linear-gradient(140deg,rgba(2,6,23,0.2),rgba(14,116,144,0.35)),url('https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
              </div>
            </article>
          </div>
        )}
      </div>

      <BookingFormModal
        isOpen={isBookingFormOpen}
        resources={resources}
        existingBookings={bookings}
        editingBookingId={editingBooking?.id || null}
        resourcesLoading={loading}
        resourcesError={error}
        submitting={submitting}
        mode={editingBooking ? 'edit' : 'create'}
        initialValues={modalInitialValues}
        onClose={closeBookingForm}
        onSubmit={submitFromModal}
      />
    </section>
  )
}
