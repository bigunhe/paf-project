import { useEffect, useState, useRef } from 'react'
import api from '../core/api'
import { useAuth } from '../core/AuthContext'

export default function NotificationDropdown() {
  const { currentUserId } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const ref = useRef(null)

  const load = async () => {
    const { data } = await api.get('/notifications', { params: { userId: currentUserId } })
    setItems(data)
  }

  useEffect(() => {
    load().catch(() => setItems([]))
  }, [currentUserId])

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const unread = items.filter((n) => !n.isRead).length

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
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-sm z-50 max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No notifications.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {items.map((n) => (
                <li key={n.id} className="p-3 text-sm">
                  <p className="text-slate-900">{n.message}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    {n.type} · {n.isRead ? 'Read' : 'Unread'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
