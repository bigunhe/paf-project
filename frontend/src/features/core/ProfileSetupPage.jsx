import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from './api'
import { useAuth } from './AuthContext'
import { PRIMARY_BUTTON_CLASS } from './ui'

const FACULTIES = ['Computing', 'Business', 'Engineering']

export default function ProfileSetupPage() {
  const { user, refreshSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from

  const [userType, setUserType] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [universityId, setUniversityId] = useState('')
  const [academicUnit, setAcademicUnit] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.profileCompleted === true) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/app', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!userType || !['STUDENT', 'LECTURER', 'STAFF'].includes(userType)) {
      setError('Please select your user type.')
      return
    }
    const digitsOnly = contactNumber.replace(/\D/g, '')
    if (!digitsOnly || !universityId.trim() || !academicUnit.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    if (digitsOnly.length !== 10) {
      setError('Contact number must be exactly 10 digits.')
      return
    }
    setSubmitting(true)
    try {
      await api.patch(`/users/${user.id}/profile`, {
        userType,
        contactNumber: digitsOnly,
        universityId: universityId.trim(),
        academicUnit: academicUnit.trim(),
      })
      const me = await refreshSession()
      const role = me?.role ?? user.role
      if (typeof from === 'string' && from.startsWith('/') && !from.startsWith('/complete-profile')) {
        navigate(from, { replace: true })
      } else {
        navigate(role === 'ADMIN' ? '/admin' : '/app', { replace: true })
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not save profile.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user || user.profileCompleted === true) {
    return <div className="max-w-md mx-auto text-slate-500 text-sm py-8">Redirecting…</div>
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">Complete your profile</h1>
        <p className="text-slate-500 text-sm mb-6">
          We need a few details for campus operations. You can continue to the app after this step.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-slate-700 mb-1">
              I am a
            </label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => {
                setUserType(e.target.value)
                setUniversityId('')
                setAcademicUnit('')
              }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white"
              required
            >
              <option value="">Select…</option>
              <option value="STUDENT">Student</option>
              <option value="LECTURER">Lecturer</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>

          {userType === 'STUDENT' && (
            <>
              <div>
                <label htmlFor="studentNo" className="block text-sm font-medium text-slate-700 mb-1">
                  Student number
                </label>
                <input
                  id="studentNo"
                  type="text"
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                  placeholder="e.g. IT21xxxxxx"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="faculty" className="block text-sm font-medium text-slate-700 mb-1">
                  Faculty
                </label>
                <select
                  id="faculty"
                  value={academicUnit}
                  onChange={(e) => setAcademicUnit(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white"
                  required
                >
                  <option value="">Select faculty…</option>
                  {FACULTIES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {(userType === 'LECTURER' || userType === 'STAFF') && (
            <>
              <div>
                <label htmlFor="staffId" className="block text-sm font-medium text-slate-700 mb-1">
                  {userType === 'LECTURER' ? 'Lecturer ID' : 'Staff ID'}
                </label>
                <input
                  id="staffId"
                  type="text"
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="dept" className="block text-sm font-medium text-slate-700 mb-1">
                  Department
                </label>
                <input
                  id="dept"
                  type="text"
                  value={academicUnit}
                  onChange={(e) => setAcademicUnit(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-slate-700 mb-1">
              Contact number
            </label>
            <input
              id="contact"
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              inputMode="numeric"
              maxLength={10}
              placeholder="07XXXXXXXX"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !userType}
            className={`w-full py-2.5 px-4 text-sm ${PRIMARY_BUTTON_CLASS}`}
          >
            {submitting ? 'Saving…' : 'Save and continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
