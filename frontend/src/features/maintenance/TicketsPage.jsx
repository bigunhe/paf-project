import { useEffect, useState } from 'react'
import api from '../core/api'
import { useAuth } from '../core/AuthContext'
import { PRIMARY_BUTTON_CLASS } from '../core/ui'

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']

export default function TicketsPage() {
  const { currentUserId, isAdmin } = useAuth()
  const [tickets, setTickets] = useState([])
  const [resources, setResources] = useState([])
  const [selected, setSelected] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [form, setForm] = useState({
    resourceId: '',
    category: '',
    description: '',
    priority: 'MEDIUM',
    contactDetails: '',
  })
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    const params = isAdmin ? {} : { userId: currentUserId }
    const [{ data: t }, { data: r }] = await Promise.all([
      api.get('/tickets', { params }),
      api.get('/resources'),
    ])
    setTickets(t)
    setResources(r)
    if (!form.resourceId && r[0]?.id) {
      setForm((f) => ({ ...f, resourceId: r[0].id }))
    }
  }

  useEffect(() => {
    load().catch((e) => setError(e.response?.data?.message || e.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, isAdmin])

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (files.length > 3) {
      setError('Maximum 3 images allowed.')
      return
    }
    try {
      const imageAttachments = []
      for (const f of files) {
        imageAttachments.push(await fileToBase64(f))
      }
      await api.post('/tickets', {
        ...form,
        userId: currentUserId,
        imageAttachments,
      })
      setForm({
        resourceId: form.resourceId,
        category: '',
        description: '',
        priority: 'MEDIUM',
        contactDetails: '',
      })
      setFiles([])
      await load()
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const openDetail = async (id) => {
    setError('')
    try {
      const { data } = await api.get(`/tickets/${id}`)
      setSelected(data)
      setCommentText('')
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const addComment = async () => {
    if (!selected || !commentText.trim()) return
    setError('')
    try {
      await api.post(`/tickets/${selected.id}/comments`, {
        userId: currentUserId,
        content: commentText.trim(),
      })
      await openDetail(selected.id)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const patchStatus = async (id, status) => {
    setError('')
    try {
      await api.patch(`/tickets/${id}/status`, { status })
      await load()
      if (selected?.id === id) await openDetail(id)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const patchAssignment = async (id, technicianAssigned) => {
    setError('')
    try {
      await api.patch(`/tickets/${id}/assignment`, { technicianAssigned })
      await load()
      if (selected?.id === id) await openDetail(id)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {isAdmin ? 'Incidents & maintenance' : 'Report a problem'}
        </h1>
        <p className="text-slate-500">
          {isAdmin
            ? 'Triage reports, assign technicians, update status (Member 3 admin surface).'
            : 'Tell us what needs fixing on campus — we will route it to facilities (Member 3 user surface).'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
      )}

      {!isAdmin && (
      <form onSubmit={submit} className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 grid gap-4 max-w-xl">
        <h2 className="text-lg font-medium text-slate-900">Tell us what happened</h2>
        <div className="grid gap-2">
          <label className="text-sm text-slate-500">Resource</label>
          <select
            value={form.resourceId}
            onChange={(e) => setForm((f) => ({ ...f, resourceId: e.target.value }))}
            className="border border-slate-200 rounded-lg px-3 py-2"
          >
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-500">Category</label>
          <input
            required
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="border border-slate-200 rounded-lg px-3 py-2"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-500">Description</label>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="border border-slate-200 rounded-lg px-3 py-2"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-sm text-slate-500">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              className="border border-slate-200 rounded-lg px-3 py-2"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-slate-500">Contact</label>
            <input
              value={form.contactDetails}
              onChange={(e) => setForm((f) => ({ ...f, contactDetails: e.target.value }))}
              className="border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm text-slate-500">Images (max 3)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 3))}
            className="text-sm text-slate-500"
          />
        </div>
        <button type="submit" className={`w-fit py-2 px-4 ${PRIMARY_BUTTON_CLASS}`}>
          Submit ticket
        </button>
      </form>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="p-3">Category</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tickets.map((t) => (
                <tr key={t.id}>
                  <td className="p-3 text-slate-900 font-medium">{t.category}</td>
                  <td className="p-3 text-slate-500">{t.priority}</td>
                  <td className="p-3 text-slate-500">{t.status}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => openDetail(t.id)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-medium text-slate-900">Ticket detail</h3>
            <p className="text-slate-500 text-sm">{selected.description}</p>
            <p className="text-slate-500 text-xs">Status: {selected.status}</p>

            {isAdmin && (
              <div className="flex flex-wrap gap-2">
                {STATUSES.filter((s) => s !== selected.status).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => patchStatus(selected.id, s)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-1 px-2 text-xs"
                  >
                    Set {s}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const name = prompt('Technician name')
                    if (name) patchAssignment(selected.id, name)
                  }}
                  className={`py-1 px-2 text-xs ${PRIMARY_BUTTON_CLASS}`}
                >
                  Assign tech
                </button>
              </div>
            )}

            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-medium text-slate-900 mb-2">Comments</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                {(selected.comments || []).map((c) => (
                  <li key={c.commentId} className="border border-slate-100 rounded p-2">
                    {c.content}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add comment"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={addComment}
                  className={`py-2 px-3 text-sm ${PRIMARY_BUTTON_CLASS}`}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
