import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../core/api'
import { useAuth } from '../core/AuthContext'
import PageHero, { PageHeroMetric } from '../core/PageHero'
import { PRIMARY_BUTTON_CLASS } from '../core/ui'
import {
  CheckCircle,
  ChevronRight,
  ClipboardList,
  MessageSquare,
  MousePointerClick,
  UserCog,
  Wrench,
} from 'lucide-react'

const CATEGORIES = ['Electrical', 'Network', 'Hardware']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']

function digitsOnlyContact(value) {
  return value.replace(/\D/g, '').slice(0, 10)
}

function technicianInitials(name) {
  if (!name?.trim()) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.trim().slice(0, 2).toUpperCase()
}

export default function TicketsPage() {
  const { currentUserId, isAdmin } = useAuth()
  const [searchParams] = useSearchParams()
  const [tickets, setTickets] = useState([])
  const [resources, setResources] = useState([])
  const [selected, setSelected] = useState(null)
  const [commentText, setCommentText] = useState('')

  const [techText, setTechText] = useState('')
  const [selectedBuilding, setSelectedBuilding] = useState('')

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

    if (r.length > 0) {
      const buildings = Array.from(new Set(r.map((res) => res.location.split(',')[0].trim())))
      setSelectedBuilding((prev) => prev || buildings[0])
      setForm((f) => (f.resourceId ? f : { ...f, resourceId: r[0].id }))
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
    if (form.contactDetails.length !== 10) {
      setError('Contact number must be exactly 10 digits (numbers only).')
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
      toast.success('Ticket submitted.')
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

  const ticketIdParam = searchParams.get('ticketId')
  useEffect(() => {
    if (!ticketIdParam) return
    openDetail(ticketIdParam).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketIdParam, currentUserId, isAdmin])

  useEffect(() => {
    if (!ticketIdParam) return
    const el = document.querySelector(`[data-ticket-id="${ticketIdParam}"]`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    el.classList.add('bg-sky-50', 'ring-2', 'ring-cyan-500', 'ring-inset')
    const t = window.setTimeout(() => {
      el.classList.remove('bg-sky-50', 'ring-2', 'ring-cyan-500', 'ring-inset')
    }, 2400)
    return () => window.clearTimeout(t)
  }, [ticketIdParam, tickets])

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

  const assignTechnician = async (id) => {
    if (!techText.trim()) return
    setError('')
    try {
      await api.patch(`/tickets/${id}/assignment`, { technicianAssigned: techText.trim() })
      setTechText('')
      await load()
      if (selected?.id === id) await openDetail(id)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const buildingNames = Array.from(new Set(resources.map((r) => r.location.split(',')[0].trim())))
  const roomsInBuilding = resources.filter((r) => r.location.split(',')[0].trim() === selectedBuilding)

  const openTicketCount = tickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Enterprise Workspace"
        title={isAdmin ? 'Incidents & Maintenance' : 'Report a Problem'}
        description={
          isAdmin
            ? 'Manage all campus incidents, deploy technicians, and resolve issues.'
            : 'Tell us what needs fixing on campus — our technicians act fast.'
        }
        aside={
          <PageHeroMetric
            label={isAdmin ? 'Queue' : 'Open reports'}
            value={isAdmin ? tickets.length : openTicketCount}
          />
        }
      />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg shadow-sm font-medium">
          {error}
        </div>
      )}

      {!isAdmin && (
        <form
          onSubmit={submit}
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 grid gap-5 max-w-2xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-900">Incident Details</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Building</label>
              <select
                value={selectedBuilding}
                onChange={(e) => {
                  const newB = e.target.value
                  setSelectedBuilding(newB)
                  const matching = resources.filter((r) => r.location.split(',')[0].trim() === newB)
                  if (matching.length > 0) setForm((f) => ({ ...f, resourceId: matching[0].id }))
                }}
                className="border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 text-slate-900"
              >
                {buildingNames.map((bName) => (
                  <option key={bName} value={bName}>
                    {bName}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Lecture Hall / Room</label>
              <select
                value={form.resourceId}
                onChange={(e) => setForm((f) => ({ ...f, resourceId: e.target.value }))}
                className="border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50 text-slate-900"
              >
                {roomsInBuilding.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select
              required
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white text-slate-900"
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              required
              rows={4}
              placeholder="Please provide details about the incident..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-slate-900 placeholder-slate-400"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Priority Level</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                className="border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">Contact Number</label>
              <input
                required
                type="text"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                placeholder="5551234567"
                value={form.contactDetails}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactDetails: digitsOnlyContact(e.target.value) }))
                }
                className="border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder-slate-400"
              />
              <p className="text-xs text-slate-500">10 digits only — letters and symbols are ignored.</p>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Attach Images (Max 3)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 3))}
              className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className={`mt-2 py-3 px-6 w-full sm:w-auto shadow-md flex items-center justify-center gap-2 ${PRIMARY_BUTTON_CLASS}`}
          >
            <CheckCircle className="w-5 h-5" />
            Submit Ticket
          </button>
        </form>
      )}

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 shrink-0" aria-hidden />
            <h3 className="font-semibold text-slate-800">Recent Tickets</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Priority</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t.id} data-ticket-id={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-900 font-medium">{t.category}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          t.priority === 'CRITICAL'
                            ? 'bg-red-100 text-red-700'
                            : t.priority === 'HIGH'
                              ? 'bg-orange-100 text-orange-700'
                              : t.priority === 'LOW'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          t.status === 'RESOLVED' || t.status === 'CLOSED'
                            ? 'bg-slate-100 text-slate-600'
                            : t.status === 'IN_PROGRESS'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => openDetail(t.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 group"
                      >
                        Review
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No active tickets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selected ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 space-y-4 bg-slate-50/30">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900">{selected.category}</h3>
                  </div>
                  <p className="text-slate-500 text-sm mt-1 whitespace-pre-wrap">{selected.description}</p>

                  {selected.imageAttachments?.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      {selected.imageAttachments.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`Attachment ${i + 1}`}
                          className="h-24 w-auto rounded border border-slate-200 object-cover shadow-sm bg-white"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold tracking-wide uppercase whitespace-nowrap">
                  {selected.status}
                </span>
              </div>

              {(selected.technicianAssigned || selected.resolutionNotes) && (
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 grid md:grid-cols-2 gap-4">
                  {selected.technicianAssigned && (
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="h-12 w-12 shrink-0 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-sm font-bold border border-slate-300 shadow-sm"
                        title="Technician (initials — no photo stored for this ticket)"
                      >
                        {technicianInitials(selected.technicianAssigned)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wider font-semibold text-blue-800">Technician</p>
                        <p className="text-sm text-blue-900 font-medium">{selected.technicianAssigned}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Incident photos appear above when attached to this ticket.
                        </p>
                      </div>
                    </div>
                  )}
                  {selected.resolutionNotes && (
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-emerald-800">
                        Resolution Notes
                      </p>
                      <p className="text-sm text-emerald-900">{selected.resolutionNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="p-6 border-b border-slate-100 space-y-5">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <UserCog className="w-4 h-4 text-slate-600 shrink-0" aria-hidden />
                  Technician Controls
                </h4>

                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1.5 flex-1 min-w-[200px]">
                    <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Assign Tech
                    </label>
                    <select
                      value={techText}
                      onChange={(e) => setTechText(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 bg-white"
                    >
                      <option value="" disabled>
                        Select a technician
                      </option>
                      <option value="Alex Technician">Alex Technician</option>
                      <option value="Sarah Engineer">Sarah Engineer</option>
                      <option value="Mike Fixer">Mike Fixer</option>
                      <option value="John Doe">John Doe</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => assignTechnician(selected.id)}
                    className={`px-4 py-2 text-sm ${PRIMARY_BUTTON_CLASS}`}
                  >
                    Assign
                  </button>
                </div>

                <div className="space-y-3 pt-3">
                  <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Update Ticket Status
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {STATUSES.filter((s) => s !== selected.status).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => patchStatus(selected.id, s)}
                        className="bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 text-slate-700 rounded-lg py-1.5 px-3 text-sm font-medium transition-colors shadow-sm"
                      >
                        Set to {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <h4 className="text-base font-semibold text-slate-900">Communication Log</h4>
              </div>

              <ul className="space-y-4 mb-6">
                {(selected.comments || []).map((c) => (
                  <li
                    key={c.commentId}
                    className={`flex gap-3 ${c.userId === currentUserId ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm shrink-0 ${
                        c.userId === currentUserId ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.userId.substring(0, 2).toUpperCase()}
                    </div>
                    <div
                      className={`flex flex-col ${c.userId === currentUserId ? 'items-end' : 'items-start'} max-w-[80%]`}
                    >
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          c.userId === currentUserId
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-slate-100 text-slate-800 rounded-tl-none'
                        }`}
                      >
                        {c.content}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex gap-3 items-end">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Type your message..."
                  rows={2}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none shadow-inner text-slate-900 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={addComment}
                  className={`py-3 px-5 text-sm shadow-md ${PRIMARY_BUTTON_CLASS} rounded-xl`}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-200 rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center min-h-[240px] lg:min-h-[280px]">
            <MousePointerClick className="w-12 h-12 text-slate-300 mb-4" strokeWidth={1.25} aria-hidden />
            <p className="text-base font-semibold text-slate-800">Select a ticket</p>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">
              Click <span className="font-medium text-slate-700">Review</span> on a ticket to see the full report, attachments, and
              message thread{isAdmin ? ', plus assignment and status controls.' : '.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
