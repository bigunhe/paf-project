import { useEffect, useState } from 'react'
import api from '../core/api'
import { useAuth } from '../core/AuthContext'

const TYPES = ['ROOM', 'LAB', 'EQUIPMENT']
const STATUSES = ['ACTIVE', 'OUT_OF_SERVICE']

export default function ResourceCatalogPage() {
  const { isAdmin } = useAuth()
  const [resources, setResources] = useState([])
  const [form, setForm] = useState({
    name: '',
    type: 'ROOM',
    capacity: 0,
    location: '',
    status: 'ACTIVE',
  })
  const [error, setError] = useState('')

  const load = async () => {
    const { data } = await api.get('/resources')
    setResources(data)
  }

  useEffect(() => {
    load().catch((e) => setError(e.response?.data?.message || e.message))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/resources', form)
      setForm({ name: '', type: 'ROOM', capacity: 0, location: '', status: 'ACTIVE' })
      await load()
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this resource?')) return
    setError('')
    try {
      await api.delete(`/resources/${id}`)
      await load()
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Facilities catalogue</h1>
        <p className="text-slate-500">Rooms, labs, and equipment (Member 1).</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
      )}

      {isAdmin && (
        <form
          onSubmit={submit}
          className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 grid gap-4 max-w-xl"
        >
          <h2 className="text-lg font-medium text-slate-900">Add resource</h2>
          <div className="grid gap-2">
            <label className="text-sm text-slate-500">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm text-slate-500">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-500">Capacity</label>
              <input
                type="number"
                min={0}
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
                className="border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-slate-500">Location</label>
            <input
              required
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-slate-500">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="border border-slate-200 rounded-lg px-3 py-2"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 w-fit">
            Create
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Type</th>
              <th className="p-3">Capacity</th>
              <th className="p-3">Location</th>
              <th className="p-3">Status</th>
              {isAdmin && <th className="p-3 w-24">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {resources.map((r) => (
              <tr key={r.id}>
                <td className="p-3 text-slate-900 font-medium">{r.name}</td>
                <td className="p-3 text-slate-500">{r.type}</td>
                <td className="p-3 text-slate-500">{r.capacity}</td>
                <td className="p-3 text-slate-500">{r.location}</td>
                <td className="p-3 text-slate-500">{r.status}</td>
                {isAdmin && (
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => remove(r.id)}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-lg py-1 px-2 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
