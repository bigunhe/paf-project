import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import BookingCard from '../components/BookingCard'
import BookingFormModal from '../components/BookingFormModal'
import api from '../features/core/api'
import { useAuth } from '../features/core/AuthContext'

export default function MyBookings() {
  const { currentUserId } = useAuth()
  const [bookings, setBookings] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [cancellingId, setCancellingId] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const [{ data: bookingData }, { data: resourceData }] = await Promise.all([
        api.get('/bookings/my', { params: { userId: currentUserId } }),
        api.get('/resources'),
      ])
      setBookings(bookingData)
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
      await loadData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancel failed')
    } finally {
      setCancellingId('')
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-sky-50 p-6 shadow-[0_16px_40px_-24px_rgba(2,132,199,0.45)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
            <p className="mt-1 text-sm text-slate-600">
              Request spaces quickly and track approval status in real time.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-700"
          >
            + Request Booking
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white/70 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-12 text-center">
          <h2 className="text-lg font-semibold text-slate-800">No bookings yet</h2>
          <p className="mt-2 text-sm text-slate-500">Create your first booking request to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              editing={editingId === booking.id}
              onEdit={handleOpenEditBooking}
              cancelling={cancellingId === booking.id}
              onCancel={handleCancelBooking}
            />
          ))}
        </div>
      )}

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
