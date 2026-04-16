import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from './api'
import { useAuth } from './AuthContext'
import { PRIMARY_BUTTON_CLASS } from './ui'

export default function UserAccountPage() {
  const { user, refreshSession, logout } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    name: '',
    userType: 'STUDENT',
    contactNumber: '',
    universityId: '',
    academicUnit: '',
  })

  useEffect(() => {
    if (!user) return
    setForm({
      name: user.name ?? '',
      userType: user.userType && user.userType !== 'UNASSIGNED' ? user.userType : 'STUDENT',
      contactNumber: user.contactNumber ?? '',
      universityId: user.universityId ?? '',
      academicUnit: user.academicUnit ?? '',
    })
  }, [user])

  if (!user) {
    return null
  }

  const onSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const digitsOnly = form.contactNumber.replace(/\D/g, '')
    if (!form.name.trim() || !form.universityId.trim() || !form.academicUnit.trim()) {
      setError('Please fill in all profile fields.')
      return
    }
    if (digitsOnly.length !== 10) {
      setError('Contact number must be exactly 10 digits.')
      return
    }
    setSaving(true)
    try {
      await api.patch(`/users/${user.id}`, {
        name: form.name.trim(),
        userType: form.userType,
        contactNumber: digitsOnly,
        universityId: form.universityId.trim(),
        academicUnit: form.academicUnit.trim(),
      })
      await refreshSession()
      setEditing(false)
      setSuccess('Profile updated.')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not update profile.')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async () => {
    const confirmed = window.confirm(
      'Delete your profile permanently? This cannot be undone and will sign you out.',
    )
    if (!confirmed) return
    setError('')
    setSuccess('')
    setDeleting(true)
    try {
      await api.delete(`/users/${user.id}`)
      logout()
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not delete profile.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">My Account</h1>
        <p className="text-slate-500 text-sm">Manage your profile details and account lifecycle.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">{success}</div>
      )}

      {!editing ? (
        <dl className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 text-sm space-y-3">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Name</dt>
            <dd className="text-slate-900 font-medium text-right">{user.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Email</dt>
            <dd className="text-slate-600 text-right break-all">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Role</dt>
            <dd className="text-slate-600 text-right">{user.role}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">User type</dt>
            <dd className="text-slate-600 text-right">{user.userType ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Contact</dt>
            <dd className="text-slate-600 text-right">{user.contactNumber || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">ID / number</dt>
            <dd className="text-slate-600 text-right font-mono text-xs">{user.universityId || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Faculty / department</dt>
            <dd className="text-slate-600 text-right">{user.academicUnit || '—'}</dd>
          </div>
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className={`inline-flex py-2 px-4 text-sm ${PRIMARY_BUTTON_CLASS}`}
            >
              Edit profile
            </button>
          </div>
        </dl>
      ) : (
        <form onSubmit={onSave} className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-slate-700 mb-1">
              User type
            </label>
            <select
              id="userType"
              value={form.userType}
              onChange={(e) => setForm((prev) => ({ ...prev, userType: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              required
            >
              <option value="STUDENT">Student</option>
              <option value="LECTURER">Lecturer</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>
          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-slate-700 mb-1">
              Contact number
            </label>
            <input
              id="contactNumber"
              type="tel"
              value={form.contactNumber}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, contactNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))
              }
              inputMode="numeric"
              maxLength={10}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="universityId" className="block text-sm font-medium text-slate-700 mb-1">
              Student/Lecturer/Staff ID
            </label>
            <input
              id="universityId"
              type="text"
              value={form.universityId}
              onChange={(e) => setForm((prev) => ({ ...prev, universityId: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="academicUnit" className="block text-sm font-medium text-slate-700 mb-1">
              Faculty/Department
            </label>
            <input
              id="academicUnit"
              type="text"
              value={form.academicUnit}
              onChange={(e) => setForm((prev) => ({ ...prev, academicUnit: e.target.value }))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className={`inline-flex py-2 px-4 text-sm ${PRIMARY_BUTTON_CLASS} disabled:opacity-50`}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg py-2 px-4 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="bg-white border border-red-200 rounded-lg shadow-sm p-5 space-y-2">
        <h2 className="text-base font-semibold text-red-700">Danger zone</h2>
        <p className="text-sm text-slate-600">
          Deleting your profile permanently removes your account record and signs you out.
        </p>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="inline-flex bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 px-4 text-sm font-medium disabled:opacity-50"
        >
          {deleting ? 'Deleting…' : 'Delete profile'}
        </button>
      </section>
    </div>
  )
}
