import { useEffect, useState } from 'react'
import api from '../core/api'
import { useAuth } from '../core/AuthContext'

const TYPES = ['ROOM', 'LAB', 'EQUIPMENT']
const STATUSES = ['ACTIVE', 'OUT_OF_SERVICE']

const INITIAL_FORM = {
  name: '',
  type: 'ROOM',
  capacity: 0,
  location: '',
  availabilityWindow: 'Mon-Fri 08:00-18:00',
  status: 'ACTIVE',
}

const INITIAL_FILTERS = {
  query: '',
  type: 'ALL',
  minCapacity: '',
  location: '',
  status: 'ALL',
}

export default function ResourceCatalogPage() {
  const { isAdmin } = useAuth()
  const [resources, setResources] = useState([])
  const [form, setForm] = useState(INITIAL_FORM)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState('')

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
      if (editingId) {
        await api.put(`/resources/${editingId}`, form)
      } else {
        await api.post('/resources', form)
      }
      setForm(INITIAL_FORM)
      setEditingId('')
      await load()
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    }
  }

  const startEdit = (resource) => {
    setEditingId(resource.id)
    setForm({
      name: resource.name || '',
      type: resource.type || 'ROOM',
      capacity: Number(resource.capacity ?? 0),
      location: resource.location || '',
      availabilityWindow: resource.availabilityWindow || 'Mon-Fri 08:00-18:00',
      status: resource.status || 'ACTIVE',
    })
  }

  const cancelEdit = () => {
    setEditingId('')
    setForm(INITIAL_FORM)
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

  const filteredResources = resources.filter((resource) => {
    const query = filters.query.trim().toLowerCase()
    const location = filters.location.trim().toLowerCase()
    const minCapacity = filters.minCapacity === '' ? null : Number(filters.minCapacity)

    const matchesQuery =
      !query ||
      resource.name?.toLowerCase().includes(query) ||
      resource.location?.toLowerCase().includes(query) ||
      resource.availabilityWindow?.toLowerCase().includes(query)

    const matchesType = filters.type === 'ALL' || resource.type === filters.type
    const matchesStatus = filters.status === 'ALL' || resource.status === filters.status
    const matchesLocation = !location || resource.location?.toLowerCase().includes(location)
    const matchesCapacity = minCapacity === null || Number(resource.capacity) >= minCapacity

    return matchesQuery && matchesType && matchesStatus && matchesLocation && matchesCapacity
  })

  const activeCount = resources.filter((resource) => resource.status === 'ACTIVE').length
  const outOfServiceCount = resources.filter((resource) => resource.status === 'OUT_OF_SERVICE').length

  const badgeClass = (status) =>
    status === 'ACTIVE'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-amber-50 text-amber-700 border-amber-200'

  return (
    <div className="space-y-8">
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Member 1</p>
            <h1 className="text-3xl font-semibold text-slate-900">
              {isAdmin ? 'Manage resource catalogue' : 'Browse bookable resources'}
            </h1>
            <p className="text-slate-500">
              Maintain lecture halls, labs, meeting rooms, and equipment with capacity, location, availability,
              and operational status.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xl font-semibold text-slate-900">{resources.length}</div>
              <div className="text-xs text-slate-500">Total</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xl font-semibold text-slate-900">{activeCount}</div>
              <div className="text-xs text-slate-500">Active</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xl font-semibold text-slate-900">{outOfServiceCount}</div>
              <div className="text-xs text-slate-500">Out of service</div>
            </div>
          </div>
        </div>
      </section>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-medium text-slate-900">Search and filters</h2>
            <p className="text-sm text-slate-500">Search by name, location, or availability window.</p>
          </div>
          <button
            type="button"
            onClick={() => setFilters(INITIAL_FILTERS)}
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            Reset filters
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <div className="grid gap-2 lg:col-span-2">
            <label className="text-sm text-slate-500">Search</label>
            <input
              value={filters.query}
              onChange={(e) => setFilters((current) => ({ ...current, query: e.target.value }))}
              placeholder="Auditorium, projector, block A..."
              className="border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-slate-500">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters((current) => ({ ...current, type: e.target.value }))}
              className="border border-slate-200 rounded-lg px-3 py-2"
            >
              <option value="ALL">All</option>
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-slate-500">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((current) => ({ ...current, status: e.target.value }))}
              className="border border-slate-200 rounded-lg px-3 py-2"
            >
              <option value="ALL">All</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-slate-500">Min capacity</label>
            <input
              type="number"
              min={0}
              value={filters.minCapacity}
              onChange={(e) => setFilters((current) => ({ ...current, minCapacity: e.target.value }))}
              className="border border-slate-200 rounded-lg px-3 py-2"
              placeholder="50"
            />
          </div>
          <div className="grid gap-2 lg:col-span-2">
            <label className="text-sm text-slate-500">Location</label>
            <input
              value={filters.location}
              onChange={(e) => setFilters((current) => ({ ...current, location: e.target.value }))}
              placeholder="Block A, Floor 1"
              className="border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </section>

      {isAdmin && (
        <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 grid gap-4">
          <div>
            <h2 className="text-lg font-medium text-slate-900">
              {editingId ? 'Edit resource' : 'Add resource'}
            </h2>
            <p className="text-sm text-slate-500">
              {editingId
                ? 'Update the catalogue entry metadata, availability, or status.'
                : 'Create a catalogue entry with the metadata needed for booking.'}
            </p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-slate-500">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
              className="border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm text-slate-500">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((current) => ({ ...current, type: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2"
              >
                {TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-500">Capacity</label>
              <input
                type="number"
                min={0}
                required
                value={form.capacity}
                onChange={(e) => setForm((current) => ({ ...current, capacity: Number(e.target.value) }))}
                className="border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm text-slate-500">Location</label>
              <input
                required
                value={form.location}
                onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-slate-500">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((current) => ({ ...current, status: e.target.value }))}
                className="border border-slate-200 rounded-lg px-3 py-2"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-slate-500">Availability window</label>
            <input
              required
              value={form.availabilityWindow}
              onChange={(e) => setForm((current) => ({ ...current, availabilityWindow: e.target.value }))}
              placeholder="Mon-Fri 08:00-18:00"
              className="border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 w-fit">
              {editingId ? 'Save changes' : 'Create resource'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg py-2 px-4 w-fit"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      )}

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-medium text-slate-900">Catalogue</h2>
            <p className="text-sm text-slate-500">{filteredResources.length} matching resources</p>
          </div>
        </div>

        {filteredResources.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500">
            No resources match the current filters.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredResources.map((resource) => (
              <article key={resource.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">{resource.name}</h3>
                    <p className="text-sm text-slate-500">{resource.location}</p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeClass(resource.status)}`}
                  >
                    {resource.status}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                    <dt className="text-slate-500 text-xs uppercase tracking-wide">Type</dt>
                    <dd className="text-slate-900 font-medium mt-1">{resource.type}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                    <dt className="text-slate-500 text-xs uppercase tracking-wide">Capacity</dt>
                    <dd className="text-slate-900 font-medium mt-1">{resource.capacity}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 col-span-2">
                    <dt className="text-slate-500 text-xs uppercase tracking-wide">Availability</dt>
                    <dd className="text-slate-900 font-medium mt-1">{resource.availabilityWindow || 'Not set'}</dd>
                  </div>
                </dl>

                {isAdmin && (
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(resource)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg py-2 px-3 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(resource.id)}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 px-3 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
