import { useEffect, useState } from 'react'
import api from '../core/api'
import { useAuth } from '../core/AuthContext'
import { PRIMARY_BUTTON_CLASS } from '../core/ui'

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
      api.get('/resources', { params: { status: 'ACTIVE' } }),
    ])
    setBookings(b)
    setResources(r)
    const firstId = r.find((res) => res.status === 'ACTIVE')?.id
    if (firstId) {
      setForm((f) => {
        const ok = r.some((res) => res.id === f.resourceId)
        return ok ? f : { ...f, resourceId: firstId }
      })
    } else {
      setForm((f) => ({ ...f, resourceId: '' }))
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {isAdmin ? 'Booking approvals' : 'My bookings'}
        </h1>
        <p className="text-slate-500">
          {isAdmin
            ? 'Review pending requests and approve or reject (Member 2 admin surface).'
            : 'Request a slot and track your requests (Member 2 user surface).'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
      )}

      {!isAdmin && (
        <form
          onSubmit={submit}
          className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 grid gap-4 max-w-xl"
        >
          <h2 className="text-lg font-medium text-slate-900">Request a booking</h2>
          <div className="grid gap-2">
            <label className="text-sm text-slate-500">Resource</label>
            {resources.length === 0 ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                No active resources available to book.
              </p>
            ) : (
              <select
                value={form.resourceId}
                onChange={(e) => setForm((f) => ({ ...f, resourceId: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2"
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm text-slate-500">Start</label>
              <input
                type="datetime-local"
                required
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-500">End</label>
              <input
                type="datetime-local"
                required
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-slate-500">Purpose</label>
            <input
              required
              value={form.purpose}
              onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
              className="border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-slate-500">Expected attendees</label>
            <input
              type="number"
              min={0}
              value={form.expectedAttendees}
              onChange={(e) => setForm((f) => ({ ...f, expectedAttendees: Number(e.target.value) }))}
              className="border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={resources.length === 0}
            className={`w-fit py-2 px-4 ${PRIMARY_BUTTON_CLASS}`}
          >
            Submit request
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="p-3">Resource</th>
              <th className="p-3">Start</th>
              <th className="p-3">End</th>
              <th className="p-3">Purpose</th>
              <th className="p-3">Status</th>
              {isAdmin && <th className="p-3">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {bookings.map((b) => (
              <tr key={b.id}>
                <td className="p-3 text-slate-900 font-medium">{b.resourceId}</td>
                <td className="p-3 text-slate-500">{b.startTime}</td>
                <td className="p-3 text-slate-500">{b.endTime}</td>
                <td className="p-3 text-slate-500">{b.purpose}</td>
                <td className="p-3 text-slate-500">{b.status}</td>
                {isAdmin && b.status === 'PENDING' && (
                  <td className="p-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => patchStatus(b.id, 'APPROVED')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-1 px-2 text-xs"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const reason = prompt('Rejection reason (optional)') || 'Rejected'
                        patchStatus(b.id, 'REJECTED', reason)
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-lg py-1 px-2 text-xs"
                    >
                      Reject
                    </button>
                  </td>
                )}
                {isAdmin && b.status !== 'PENDING' && <td className="p-3 text-slate-400">—</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
