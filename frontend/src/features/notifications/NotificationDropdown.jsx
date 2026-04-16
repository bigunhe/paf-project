import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../core/api'
import { useAuth } from '../core/AuthContext'

function buildNavigateTarget(n) {
  if (n.linkPath && n.entityId) {
    const param = n.linkPath.includes('booking') ? 'bookingId' : 'ticketId'
    return `${n.linkPath}?${param}=${encodeURIComponent(n.entityId)}`
  }
  if (n.linkPath) return n.linkPath
  if (n.type === 'BOOKING_UPDATE') return '/app/bookings'
  if (n.type === 'TICKET_UPDATE') return '/app/report'
  return '/app'
}

function formatWhen(iso) {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return ''
  }
}

export default function NotificationDropdown() {
  const { currentUserId } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const ref = useRef(null)

  const load = useCallback(async () => {
    if (!currentUserId) return
    const { data } = await api.get('/notifications', { params: { userId: currentUserId } })
    setItems(data)
  }, [currentUserId])

  useEffect(() => {
    load().catch(() => setItems([]))
  }, [load])

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        load().catch(() => {})
      }
    }, 45000)
    return () => clearInterval(id)
  }, [load])

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const unread = items.filter((n) => !n.isRead).length

  const onSelect = async (n) => {
    const target = buildNavigateTarget(n)
    try {
      if (!n.isRead) {
        await api.patch(`/notifications/${n.id}/read`)
      }
    } catch {
      /* still navigate */
    }
    setOpen(false)
    navigate(target)
    load().catch(() => {})
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o)
          load().catch(() => {})
        }}
        className="px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 border border-slate-200"
      >
        Alerts {unread > 0 ? `(${unread})` : ''}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-[min(24rem,70vh)] overflow-y-auto">
          {items.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No notifications.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(n)}
                    className={`w-full text-left p-3.5 hover:bg-slate-50 transition-colors ${
                      n.isRead ? 'bg-white' : 'bg-sky-50/60'
                    }`}
                  >
                    <p className={`text-sm ${n.isRead ? 'text-slate-700' : 'text-slate-900 font-medium'}`}>
                      {n.message}
                    </p>
                    <p className="text-slate-400 text-xs mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5">
                      <span>{formatWhen(n.createdAt)}</span>
                      <span className="text-cyan-700 font-medium">Open</span>
                      {!n.isRead && <span className="text-amber-700">Unread</span>}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
