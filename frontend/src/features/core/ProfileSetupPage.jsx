import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from './api'
import { useAuth } from './AuthContext'
import ProfileInlineError, { profileFieldRingClass } from './ProfileInlineError'
import PageHero from './PageHero'
import {
  DEPARTMENT_FACULTIES,
  FACULTY_TO_PREFIX,
  composeLecturerId,
  composeStaffId,
  composeStudentId,
  liveContactTenDigitsError,
  liveDepartmentError,
  liveEmpSixDigitsError,
  liveStudentEightDigitsError,
  normalizeUniversityId,
  sanitizeDigitSegment,
  validateProfileFields,
} from './profileFieldRules'
import { PRIMARY_BUTTON_CLASS } from './ui'

const baseField =
  'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-white text-slate-900'

export default function ProfileSetupPage() {
  const { user, refreshSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from

  const [userType, setUserType] = useState('')
  const [academicUnit, setAcademicUnit] = useState('')
  const [studentEight, setStudentEight] = useState('')
  const [empSix, setEmpSix] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [touch, setTouch] = useState({})
  const [showAllErrors, setShowAllErrors] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const mark = (key) => setTouch((t) => ({ ...t, [key]: true }))

  useEffect(() => {
    if (user?.profileCompleted === true) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/app', { replace: true })
    }
  }, [user, navigate])

  const reveal = showAllErrors
  const deptVis = touch.dept || touch.deptBlur || reveal
  const contactDigits = contactNumber.replace(/\D/g, '')
  const contactVis = touch.contact || reveal
  const contactBlurVis = touch.contactBlur || reveal

  const studentEightVis = touch.studentEight || reveal
  const studentEightBlurVis = touch.studentEightBlur || reveal

  const empSixVis = touch.empSix || reveal
  const empSixBlurVis = touch.empSixBlur || reveal

  const deptErr = liveDepartmentError(academicUnit, deptVis)
  const contactErr = liveContactTenDigitsError(contactDigits, contactVis, contactBlurVis)

  const studentDigitsErr =
    userType === 'STUDENT'
      ? liveStudentEightDigitsError(studentEight, academicUnit, studentEightVis, studentEightBlurVis)
      : null

  const empSixErr =
    userType === 'LECTURER' || userType === 'STAFF'
      ? liveEmpSixDigitsError(empSix, empSixVis, empSixBlurVis)
      : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setShowAllErrors(true)
    const r = true
    const deptVisSubmit = touch.dept || touch.deptBlur || r
    const contactVisSubmit = touch.contact || r
    const contactBlurSubmit = touch.contactBlur || r
    const sVisSubmit = touch.studentEight || r
    const sBlurSubmit = touch.studentEightBlur || r
    const eVisSubmit = touch.empSix || r
    const eBlurSubmit = touch.empSixBlur || r

    const dErrSubmit = liveDepartmentError(academicUnit, deptVisSubmit)
    const cErrSubmit = liveContactTenDigitsError(contactDigits, contactVisSubmit, contactBlurSubmit)
    let sErrSubmit = null
    let emErrSubmit = null
    if (userType === 'STUDENT') {
      sErrSubmit = liveStudentEightDigitsError(studentEight, academicUnit, sVisSubmit, sBlurSubmit)
    }
    if (userType === 'LECTURER' || userType === 'STAFF') {
      emErrSubmit = liveEmpSixDigitsError(empSix, eVisSubmit, eBlurSubmit)
    }

    if (!userType || !['STUDENT', 'LECTURER', 'STAFF'].includes(userType)) {
      setError('Select how you use the campus.')
      return
    }
    if (dErrSubmit || cErrSubmit || sErrSubmit || emErrSubmit) return

    let universityId = ''
    if (userType === 'STUDENT') {
      universityId = composeStudentId(academicUnit, studentEight)
    } else if (userType === 'LECTURER') {
      universityId = composeLecturerId(empSix)
    } else {
      universityId = composeStaffId(empSix)
    }

    const fieldError = validateProfileFields(userType, academicUnit, universityId)
    if (fieldError) {
      setError(fieldError)
      return
    }

    setSubmitting(true)
    try {
      await api.patch(`/users/${user.id}/profile`, {
        userType,
        contactNumber: contactDigits,
        universityId: normalizeUniversityId(universityId),
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

  const prefix = academicUnit ? FACULTY_TO_PREFIX[academicUnit] : ''

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Onboarding"
        title="Complete your profile"
        description="We need a few details for campus operations. You can continue to the app after this step."
      />
      <div className="max-w-lg mx-auto">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
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
                  const v = e.target.value
                  setUserType(v)
                  setAcademicUnit('')
                  setStudentEight('')
                  setEmpSix('')
                  setTouch({})
                  setShowAllErrors(false)
                }}
                className={`${baseField} ${profileFieldRingClass(false)}`}
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
                  <label htmlFor="faculty" className="block text-sm font-medium text-slate-700 mb-1">
                    Faculty
                  </label>
                  <select
                    id="faculty"
                    value={academicUnit}
                    onChange={(e) => {
                      mark('dept')
                      setAcademicUnit(e.target.value)
                      setStudentEight('')
                    }}
                    onBlur={() => mark('deptBlur')}
                    className={`${baseField} ${profileFieldRingClass(!!deptErr && deptVis)}`}
                    required
                  >
                    <option value="">Select…</option>
                    {DEPARTMENT_FACULTIES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <ProfileInlineError message={deptVis ? deptErr : null} />
                </div>

                <div>
                  <span className="block text-sm font-medium text-slate-700 mb-1">Student number</span>
                  <div className="flex gap-2 items-stretch">
                    <div
                      className={`flex items-center justify-center px-3 rounded-lg border bg-slate-50 text-slate-700 font-mono text-sm min-w-[3.25rem] ${profileFieldRingClass(!!studentDigitsErr && (studentEightVis || studentEightBlurVis))}`}
                      aria-hidden
                    >
                      {prefix || '—'}
                    </div>
                    <input
                      id="studentEight"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={studentEight}
                      onChange={(e) => {
                        mark('studentEight')
                        setStudentEight(sanitizeDigitSegment(e.target.value, 8))
                      }}
                      onBlur={() => mark('studentEightBlur')}
                      placeholder="00000000"
                      maxLength={8}
                      className={`flex-1 min-w-0 font-mono text-sm ${baseField} ${profileFieldRingClass(!!studentDigitsErr && (studentEightVis || studentEightBlurVis))}`}
                      aria-label="Student number digits"
                      required
                    />
                  </div>
                  <ProfileInlineError
                    message={
                      studentEightVis || studentEightBlurVis ? studentDigitsErr : null
                    }
                  />
                </div>
              </>
            )}

            {(userType === 'LECTURER' || userType === 'STAFF') && (
              <>
                <div>
                  <label htmlFor="deptLec" className="block text-sm font-medium text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    id="deptLec"
                    value={academicUnit}
                    onChange={(e) => {
                      mark('dept')
                      setAcademicUnit(e.target.value)
                    }}
                    onBlur={() => mark('deptBlur')}
                    className={`${baseField} ${profileFieldRingClass(!!deptErr && deptVis)}`}
                    required
                  >
                    <option value="">Select…</option>
                    {DEPARTMENT_FACULTIES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <ProfileInlineError message={deptVis ? deptErr : null} />
                </div>

                <div>
                  <span className="block text-sm font-medium text-slate-700 mb-1">
                    {userType === 'LECTURER' ? 'Lecturer ID' : 'Staff ID'}
                  </span>
                  <div className="flex gap-2 items-stretch">
                    <div
                      className={`flex items-center justify-center px-3 rounded-lg border bg-slate-50 text-slate-700 font-mono text-sm min-w-[3.25rem] ${profileFieldRingClass(!!empSixErr && (empSixVis || empSixBlurVis))}`}
                      aria-hidden
                    >
                      {userType === 'LECTURER' ? 'LEC' : 'STF'}
                    </div>
                    <input
                      id="empSix"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={empSix}
                      onChange={(e) => {
                        mark('empSix')
                        setEmpSix(sanitizeDigitSegment(e.target.value, 6))
                      }}
                      onBlur={() => mark('empSixBlur')}
                      placeholder="000000"
                      maxLength={6}
                      className={`flex-1 min-w-0 font-mono text-sm ${baseField} ${profileFieldRingClass(!!empSixErr && (empSixVis || empSixBlurVis))}`}
                      aria-label={userType === 'LECTURER' ? 'Lecturer ID digits' : 'Staff ID digits'}
                      required
                    />
                  </div>
                  <ProfileInlineError message={empSixVis || empSixBlurVis ? empSixErr : null} />
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
                onChange={(e) => {
                  mark('contact')
                  setContactNumber(e.target.value.replace(/\D/g, '').slice(0, 10))
                }}
                onBlur={() => mark('contactBlur')}
                inputMode="numeric"
                maxLength={10}
                placeholder="07XXXXXXXX"
                className={`${baseField} ${profileFieldRingClass(!!contactErr && (contactVis || contactBlurVis))}`}
                required
              />
              <ProfileInlineError message={contactVis || contactBlurVis ? contactErr : null} />
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
    </div>
  )
}
