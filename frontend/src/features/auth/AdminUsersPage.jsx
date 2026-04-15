import { useEffect, useState } from 'react'
import api from '../core/api'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [includeAdmins, setIncludeAdmins] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .get('/users')
      .then(({ data }) => {
        if (!cancelled) setUsers(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e.response?.data?.message || e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const visibleUsers = users.filter((u) => {
    if (!includeAdmins && u.role === 'ADMIN') return false
    if (typeFilter === 'ALL') return true
    if (u.role === 'ADMIN') return false
    return (u.userType ?? 'UNASSIGNED') === typeFilter
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Users & access</h1>
        <p className="text-slate-500 text-sm">
          View and categorize user accounts by type for daily operational monitoring.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-700 mr-2">Filter by type</span>
        <button
          type="button"
          onClick={() => setTypeFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-sm ${
            typeFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All non-admin users
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter('STUDENT')}
          className={`px-3 py-1.5 rounded-lg text-sm ${
            typeFilter === 'STUDENT'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Students
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter('LECTURER')}
          className={`px-3 py-1.5 rounded-lg text-sm ${
            typeFilter === 'LECTURER'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Lecturers
        </button>
        <button
          type="button"
          onClick={() => setTypeFilter('STAFF')}
          className={`px-3 py-1.5 rounded-lg text-sm ${
            typeFilter === 'STAFF' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Staff
        </button>
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={includeAdmins}
            onChange={(e) => setIncludeAdmins(e.target.checked)}
            className="rounded border-slate-300"
          />
          Include admins
        </label>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading users…</p>
        ) : visibleUsers.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No users returned.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">User type</th>
                <th className="p-3">Id</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {visibleUsers.map((u) => (
                <tr key={u.id}>
                  <td className="p-3 text-slate-900 font-medium">{u.name}</td>
                  <td className="p-3 text-slate-600">{u.email}</td>
                  <td className="p-3 text-slate-600">{u.role}</td>
                  <td className="p-3 text-slate-600">{u.userType ?? '—'}</td>
                  <td className="p-3 text-slate-400 font-mono text-xs">{u.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
