import { useEffect, useState } from 'react'
import api from '../core/api'
import { useAuth } from '../core/AuthContext'
import { Edit2, Trash2, CheckCircle, Wrench, ChevronRight, MessageSquare } from 'lucide-react'

const CATEGORIES = ['Electrical', 'Network', 'Hardware']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']

export default function TicketsPage() {
  const { currentUserId, isAdmin } = useAuth()
  const [tickets, setTickets] = useState([])
  const [resources, setResources] = useState([])
  const [selected, setSelected] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editCommentText, setEditCommentText] = useState('')
  
  const [resolutionText, setResolutionText] = useState('')
  const [techText, setTechText] = useState('')
  const [selectedBuilding, setSelectedBuilding] = useState('')
  const [isEditingTicket, setIsEditingTicket] = useState(false)
  const [editForm, setEditForm] = useState(null)
  
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
      if (!selectedBuilding) setSelectedBuilding(r[0].name)
      if (!form.resourceId) setForm((f) => ({ ...f, resourceId: r[0].id }))
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
      setIsEditingTicket(false)
      setEditForm({
        resourceId: data.resourceId,
        category: data.category,
        description: data.description,
        priority: data.priority,
        contactDetails: data.contactDetails,
      })
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

  const updateComment = async (commentId) => {
    if (!editCommentText.trim()) return
    setError('')
    try {
      await api.put(`/tickets/${selected.id}/comments/${commentId}`, {
        userId: currentUserId,
        content: editCommentText.trim(),
      })
      setEditingCommentId(null)
      await openDetail(selected.id)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const deleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return
    setError('')
    try {
      await api.delete(`/tickets/${selected.id}/comments/${commentId}?userId=${currentUserId}`)
      await openDetail(selected.id)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const patchStatus = async (id, status) => {
    setError('')
    try {
      await api.patch(`/tickets/${id}/status?isAdmin=${isAdmin}`, {
        status,
        resolutionNotes: status === 'RESOLVED' || status === 'CLOSED' ? resolutionText : ''
      })
      if (status === 'RESOLVED' || status === 'CLOSED') setResolutionText('')
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
      await api.put(`/tickets/${id}/assign?isAdmin=${isAdmin}`, { technicianAssigned: techText.trim() })
      setTechText('')
      await load()
      if (selected?.id === id) await openDetail(id)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const deleteTicket = async (id) => {
    if (!window.confirm("Permanent action: Are you sure you want to delete this incident entirely?")) return
    setError('')
    try {
      await api.delete(`/tickets/${id}?userId=${currentUserId}&isAdmin=${isAdmin}`)
      setSelected(null)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const updateTicket = async () => {
    setError('')
    try {
      await api.put(`/tickets/${selected.id}?userId=${currentUserId}&isAdmin=${isAdmin}`, {
        ...editForm,
        imageAttachments: selected.imageAttachments || []
      })
      setIsEditingTicket(false)
      await load()
      await openDetail(selected.id)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {isAdmin ? 'Incidents & Maintenance' : 'Report a Problem'}
        </h1>
        <p className="text-slate-500 mt-2">
          {isAdmin
            ? 'Manage all campus incidents, deploy technicians, and resolve issues.'
            : 'Tell us what needs fixing on campus — our technicians act fast.'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg shadow-sm font-medium">{error}</div>
      )}

      {!isAdmin && (
      <form onSubmit={submit} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 grid gap-5 max-w-2xl">
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
                 const newB = e.target.value;
                 setSelectedBuilding(newB);
                 const matching = resources.filter(r => r.name === newB);
                 if (matching.length > 0) setForm(f => ({ ...f, resourceId: matching[0].id }));
              }}
              className="border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50"
            >
              {Array.from(new Set(resources.map(r => r.name))).map((bName) => (
                <option key={bName} value={bName}>{bName}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Lecture Hall / Room</label>
            <select
              value={form.resourceId}
              onChange={(e) => setForm((f) => ({ ...f, resourceId: e.target.value }))}
              className="border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-slate-50"
            >
              {resources.filter(r => r.name === selectedBuilding).map((r) => (
                <option key={r.id} value={r.id}>{r.location} ({r.type})</option>
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
            className="border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
          >
            <option value="" disabled>Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
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
            className="border border-slate-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
           <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Priority Level</label>
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              className="border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Contact Number</label>
            <input
              required
              placeholder="+123456789"
              value={form.contactDetails}
              onChange={(e) => setForm((f) => ({ ...f, contactDetails: e.target.value }))}
              className="border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
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
        
        <button type="submit" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-3 px-6 w-full sm:w-auto shadow-md transition-colors flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Submit Ticket
        </button>
      </form>
      )}

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
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
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-900 font-medium">{t.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        t.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        t.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        t.priority === 'LOW' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        t.status === 'RESOLVED' || t.status === 'CLOSED' ? 'bg-slate-100 text-slate-600' :
                        t.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
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
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No active tickets found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-300">
            {isEditingTicket ? (
              <div className="p-6 border-b border-slate-100 space-y-4 bg-slate-50/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Edit2 className="w-5 h-5"/> Edit Incident</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-100">
                  <div className="grid gap-1">
                     <label className="text-xs font-semibold text-slate-600 uppercase">Building</label>
                     <select 
                       value={resources.find(r => r.id === editForm.resourceId)?.name || ''} 
                       onChange={e => {
                         const matching = resources.filter(r => r.name === e.target.value);
                         if (matching.length > 0) setEditForm(f => ({ ...f, resourceId: matching[0].id }));
                       }} 
                       className="border border-slate-200 rounded p-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                     >
                       {Array.from(new Set(resources.map(r => r.name))).map((bName) => (
                         <option key={bName} value={bName}>{bName}</option>
                       ))}
                     </select>
                  </div>
                  <div className="grid gap-1">
                     <label className="text-xs font-semibold text-slate-600 uppercase">Hall</label>
                     <select 
                       value={editForm.resourceId} 
                       onChange={e => setEditForm(f => ({ ...f, resourceId: e.target.value }))} 
                       className="border border-slate-200 rounded p-1.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                     >
                       {resources.filter(r => r.name === (resources.find(x => x.id === editForm.resourceId)?.name)).map((r) => (
                         <option key={r.id} value={r.id}>{r.location}</option>
                       ))}
                     </select>
                  </div>
                </div>
                <div className="grid gap-3">
                  <div className="grid gap-1">
                     <label className="text-xs font-semibold text-slate-600 uppercase">Category</label>
                     <select required value={editForm.category} onChange={e => setEditForm(f => ({...f, category: e.target.value}))} className="border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                       <option value="" disabled>Select a category</option>
                       {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>
                  <div className="grid gap-1">
                     <label className="text-xs font-semibold text-slate-600 uppercase">Description</label>
                     <textarea rows={3} value={editForm.description} onChange={e => setEditForm(f => ({...f, description: e.target.value}))} className="border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1">
                       <label className="text-xs font-semibold text-slate-600 uppercase">Priority</label>
                       <select value={editForm.priority} onChange={e => setEditForm(f => ({...f, priority: e.target.value}))} className="border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                         {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                       </select>
                    </div>
                    <div className="grid gap-1">
                       <label className="text-xs font-semibold text-slate-600 uppercase">Contact</label>
                       <input value={editForm.contactDetails} onChange={e => setEditForm(f => ({...f, contactDetails: e.target.value}))} className="border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                     <button onClick={() => setIsEditingTicket(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                     <button onClick={updateTicket} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Save</button>
                  </div>
                </div>
              </div>
            ) : (
            <div className="p-6 border-b border-slate-100 space-y-4 bg-slate-50/30">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                   <div className="flex items-center gap-3">
                     <h3 className="text-xl font-bold text-slate-900">{selected.category}</h3>
                     {(isAdmin || selected.userId === currentUserId) && (
                       <div className="flex items-center gap-1">
                          <button onClick={() => setIsEditingTicket(true)} className="text-slate-400 hover:text-blue-600 p-1 transition-colors" title="Edit Incident"><Edit2 className="w-4 h-4"/></button>
                          <button onClick={() => deleteTicket(selected.id)} className="text-slate-400 hover:text-red-600 p-1 transition-colors" title="Delete Incident"><Trash2 className="w-4 h-4"/></button>
                       </div>
                     )}
                   </div>
                   <p className="text-slate-500 text-sm mt-1 whitespace-pre-wrap">{selected.description}</p>
                   
                   {selected.imageAttachments?.length > 0 && (
                     <div className="flex flex-wrap gap-3 mt-4">
                        {selected.imageAttachments.map((img, i) => (
                          <img 
                            key={i} 
                            src={img} 
                            alt={`Attachment ${i+1}`} 
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
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-blue-800">Technician</p>
                      <p className="text-sm text-blue-900 font-medium">{selected.technicianAssigned}</p>
                    </div>
                  )}
                  {selected.resolutionNotes && (
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-emerald-800">Resolution Notes</p>
                      <p className="text-sm text-emerald-900">{selected.resolutionNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            )}

            {isAdmin && (
              <div className="p-6 border-b border-slate-100 space-y-5">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Technician Controls</h4>
                
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1.5 flex-1 min-w-[200px]">
                    <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Assign Tech</label>
                    <input 
                      value={techText} 
                      onChange={e => setTechText(e.target.value)} 
                      placeholder="e.g. John Doe"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <button onClick={() => assignTechnician(selected.id)} className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                    Assign
                  </button>
                </div>

                <div className="space-y-3 pt-3">
                  <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Update Ticket Status</label>
                  
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.filter(s => s !== selected.status).map((s) => (
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

                  <div className="pt-2">
                     <textarea
                      placeholder="Add resolution notes before resolving/closing (Optional)"
                      value={resolutionText}
                      onChange={e => setResolutionText(e.target.value)}
                      rows={2}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    />
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
                  <li key={c.commentId} className={`flex gap-3 ${c.userId === currentUserId ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm shrink-0 ${c.userId === currentUserId ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {c.userId.substring(0, 2).toUpperCase()}
                    </div>
                    <div className={`flex flex-col ${c.userId === currentUserId ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      {editingCommentId === c.commentId ? (
                        <div className="w-full mb-1 flex items-end gap-2">
                          <input 
                            value={editCommentText}
                            onChange={e => setEditCommentText(e.target.value)}
                            className="w-full text-sm border-b border-blue-500 bg-blue-50/50 outline-none px-2 py-1"
                            autoFocus
                          />
                          <button onClick={() => updateComment(c.commentId)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                         <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${c.userId === currentUserId ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                          {c.content}
                        </div>
                      )}
                      
                      {c.userId === currentUserId && editingCommentId !== c.commentId && (
                        <div className="flex gap-2 mt-1 px-1">
                          <button onClick={() => { setEditingCommentId(c.commentId); setEditCommentText(c.content); }} className="text-xs text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1"><Edit2 className="w-3 h-3"/> Edit</button>
                          <button onClick={() => deleteComment(c.commentId)} className="text-xs text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1"><Trash2 className="w-3 h-3"/> Delete</button>
                        </div>
                      )}
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
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none shadow-inner"
                />
                <button
                  type="button"
                  onClick={addComment}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 px-5 text-sm font-medium shadow-md transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
