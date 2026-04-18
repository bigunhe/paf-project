import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  digitsFromLecturerId,
  digitsFromStaffId,
  inferFacultyFromStudentId,
  isLecturerIdFormat,
  isStaffIdFormat,
  liveContactTenDigitsError,
  liveDepartmentError,
  liveEmpSixDigitsError,
  liveNameError,
  liveStudentEightDigitsError,
  normalizeUniversityId,
  sanitizeDigitSegment,
  studentDigitsFromSavedId,
  validateProfileFields,
} from './profileFieldRules'
import { PRIMARY_BUTTON_CLASS } from './ui'

const baseField =
  'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-white text-slate-900'

function hydrateFormFromUser(u) {
  let academicUnit = ''
  if (u.userType === 'STUDENT') {
    academicUnit = DEPARTMENT_FACULTIES.includes(u.academicUnit)
      ? u.academicUnit
      : inferFacultyFromStudentId(u.universityId ?? '')
  } else if (u.userType === 'LECTURER' || u.userType === 'STAFF') {
    academicUnit = DEPARTMENT_FACULTIES.includes(u.academicUnit) ? u.academicUnit : ''
  }
  const studentEight =
    u.userType === 'STUDENT' ? studentDigitsFromSavedId(u.universityId ?? '', academicUnit) : ''
  const empSix =
    u.userType === 'LECTURER'
      ? digitsFromLecturerId(u.universityId ?? '')
      : u.userType === 'STAFF'
        ? digitsFromStaffId(u.universityId ?? '')
        : ''
  return {
    name: u.name ?? '',
    contactNumber: u.contactNumber ?? '',
    academicUnit,
    studentEight,
    empSix,
  }
}

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
    contactNumber: '',
    academicUnit: '',
    studentEight: '',
    empSix: '',
  })
  const [touch, setTouch] = useState({})
  const [showAllErrors, setShowAllErrors] = useState(false)

  const mark = (key) => setTouch((t) => ({ ...t, [key]: true }))

  useEffect(() => {
    if (!user) return
    setForm(hydrateFormFromUser(user))
  }, [user])

  useEffect(() => {
    if (editing) {
      setTouch({})
      setShowAllErrors(false)
    }
  }, [editing])

  const cancelEdit = useCallback(() => {
    if (user) setForm(hydrateFormFromUser(user))
    setTouch({})
    setShowAllErrors(false)
    setEditing(false)
  }, [user])

  if (!user) {
    return null
  }

  const effectiveUserType = user.userType && user.userType !== 'UNASSIGNED' ? user.userType : null
  const reveal = showAllErrors
  const contactDigits = form.contactNumber.replace(/\D/g, '')

  const deptVis = touch.dept || touch.deptBlur || reveal
  const nameBlurVis = touch.nameBlur || reveal
  const contactVis = touch.contact || reveal
  const contactBlurVis = touch.contactBlur || reveal
  const studentEightVis = touch.studentEight || reveal
  const studentEightBlurVis = touch.studentEightBlur || reveal
  const empSixVis = touch.empSix || reveal
  const empSixBlurVis = touch.empSixBlur || reveal

  const deptErr = liveDepartmentError(form.academicUnit, deptVis)
  const nameErr = liveNameError(form.name, nameBlurVis)
  const contactErr = liveContactTenDigitsError(contactDigits, contactVis, contactBlurVis)
  const studentDigitsErr =
    effectiveUserType === 'STUDENT'
      ? liveStudentEightDigitsError(form.studentEight, form.academicUnit, studentEightVis, studentEightBlurVis)
      : null
  const empSixErr =
    effectiveUserType === 'LECTURER' || effectiveUserType === 'STAFF'
      ? liveEmpSixDigitsError(form.empSix, empSixVis, empSixBlurVis)
      : null

  const prefix = form.academicUnit ? FACULTY_TO_PREFIX[form.academicUnit] : ''

  const onSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setShowAllErrors(true)
    const r = true

    const deptVisSubmit = touch.dept || touch.deptBlur || r
    const nameBlurSubmit = touch.nameBlur || r
    const contactVisSubmit = touch.contact || r
    const contactBlurSubmit = touch.contactBlur || r
    const sVisSubmit = touch.studentEight || r
    const sBlurSubmit = touch.studentEightBlur || r
    const eVisSubmit = touch.empSix || r
    const eBlurSubmit = touch.empSixBlur || r

    const dErr = liveDepartmentError(form.academicUnit, deptVisSubmit)
    const nErr = liveNameError(form.name, nameBlurSubmit)
    const cErr = liveContactTenDigitsError(contactDigits, contactVisSubmit, contactBlurSubmit)
    let sErr = null
    let emErr = null
    if (effectiveUserType === 'STUDENT') {
      sErr = liveStudentEightDigitsError(form.studentEight, form.academicUnit, sVisSubmit, sBlurSubmit)
    }
    if (effectiveUserType === 'LECTURER' || effectiveUserType === 'STAFF') {
      emErr = liveEmpSixDigitsError(form.empSix, eVisSubmit, eBlurSubmit)
    }

    if (nErr || cErr || dErr || sErr || emErr) return

    let universityId = ''
    if (effectiveUserType === 'STUDENT') {
      universityId = composeStudentId(form.academicUnit, form.studentEight)
    } else if (effectiveUserType === 'LECTURER') {
      universityId = composeLecturerId(form.empSix)
    } else if (effectiveUserType === 'STAFF') {
      universityId = composeStaffId(form.empSix)
    }

    const fieldError = validateProfileFields(effectiveUserType, form.academicUnit, universityId)
    if (fieldError) {
      setError(fieldError)
      return
    }

    setSaving(true)
    try {
      await api.patch(`/users/${user.id}`, {
        name: form.name.trim(),
        contactNumber: contactDigits,
        universityId: normalizeUniversityId(universityId),
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
    <div className="space-y-6">
      <PageHero
        eyebrow="Enterprise Workspace"
        title="My Account"
        description="Manage your profile details and account lifecycle."
      />
      <div className="max-w-2xl space-y-6">
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
            <div className="flex justify-between gap-4 items-start">
              <dt className="text-slate-500 shrink-0">ID / number</dt>
              <dd className="text-slate-600 text-right min-w-0">
                {effectiveUserType === 'LECTURER' && (
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-2 items-center justify-end">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 font-mono text-xs text-slate-700">
                        LEC
                      </span>
                      <span className="inline-flex min-w-[6.5rem] justify-end font-mono text-xs tabular-nums tracking-wide">
                        {isLecturerIdFormat(user.universityId) ? user.universityId.slice(3) : '—'}
                      </span>
                    </div>
                    {!isLecturerIdFormat(user.universityId) && user.universityId && (
                      <p className="text-xs text-slate-500 max-w-[16rem] leading-snug">
                        Stored value <span className="font-mono text-slate-700">{user.universityId}</span> is not a
                        lecturer ID. Enter your LEC number in Edit profile to replace it.
                      </p>
                    )}
                  </div>
                )}
                {effectiveUserType === 'STAFF' && (
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-2 items-center justify-end">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 font-mono text-xs text-slate-700">
                        STF
                      </span>
                      <span className="inline-flex min-w-[6.5rem] justify-end font-mono text-xs tabular-nums tracking-wide">
                        {isStaffIdFormat(user.universityId) ? user.universityId.slice(3) : '—'}
                      </span>
                    </div>
                    {!isStaffIdFormat(user.universityId) && user.universityId && (
                      <p className="text-xs text-slate-500 max-w-[16rem] leading-snug">
                        Stored value <span className="font-mono text-slate-700">{user.universityId}</span> is not a
                        staff ID. Enter your STF number in Edit profile to replace it.
                      </p>
                    )}
                  </div>
                )}
                {effectiveUserType === 'STUDENT' && (
                  <span className="font-mono text-xs text-slate-600">{user.universityId || '—'}</span>
                )}
                {effectiveUserType !== 'STUDENT' &&
                  effectiveUserType !== 'LECTURER' &&
                  effectiveUserType !== 'STAFF' && (
                    <span className="font-mono text-xs text-slate-600">{user.universityId || '—'}</span>
                  )}
              </dd>
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
            <p className="text-xs text-slate-500">
              User type <span className="font-medium text-slate-700">{effectiveUserType ?? '—'}</span> is fixed from
              your first sign-in.
            </p>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                onBlur={() => mark('nameBlur')}
                className={`${baseField} ${profileFieldRingClass(!!nameErr && nameBlurVis)}`}
                required
              />
              <ProfileInlineError message={nameBlurVis ? nameErr : null} />
            </div>

            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-slate-700 mb-1">
                Contact number
              </label>
              <input
                id="contactNumber"
                type="tel"
                value={form.contactNumber}
                onChange={(e) => {
                  mark('contact')
                  setForm((prev) => ({
                    ...prev,
                    contactNumber: e.target.value.replace(/\D/g, '').slice(0, 10),
                  }))
                }}
                onBlur={() => mark('contactBlur')}
                inputMode="numeric"
                maxLength={10}
                className={`${baseField} ${profileFieldRingClass(!!contactErr && (contactVis || contactBlurVis))}`}
                required
              />
              <ProfileInlineError message={contactVis || contactBlurVis ? contactErr : null} />
            </div>

            {effectiveUserType === 'STUDENT' && (
              <>
                <div>
                  <label htmlFor="academicUnit" className="block text-sm font-medium text-slate-700 mb-1">
                    Faculty
                  </label>
                  <select
                    id="academicUnit"
                    value={DEPARTMENT_FACULTIES.includes(form.academicUnit) ? form.academicUnit : ''}
                    onChange={(e) => {
                      mark('dept')
                      setForm((prev) => ({
                        ...prev,
                        academicUnit: e.target.value,
                        studentEight: '',
                      }))
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
                      value={form.studentEight}
                      onChange={(e) => {
                        mark('studentEight')
                        setForm((prev) => ({
                          ...prev,
                          studentEight: sanitizeDigitSegment(e.target.value, 8),
                        }))
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
                    message={studentEightVis || studentEightBlurVis ? studentDigitsErr : null}
                  />
                </div>
              </>
            )}

            {(effectiveUserType === 'LECTURER' || effectiveUserType === 'STAFF') && (
              <>
                <div>
                  <label htmlFor="deptEdit" className="block text-sm font-medium text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    id="deptEdit"
                    value={DEPARTMENT_FACULTIES.includes(form.academicUnit) ? form.academicUnit : ''}
                    onChange={(e) => {
                      mark('dept')
                      setForm((prev) => ({ ...prev, academicUnit: e.target.value }))
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
                    {effectiveUserType === 'LECTURER' ? 'Lecturer ID' : 'Staff ID'}
                  </span>
                  <div className="flex gap-2 items-stretch">
                    <div
                      className={`flex items-center justify-center px-3 rounded-lg border bg-slate-50 text-slate-700 font-mono text-sm min-w-[3.25rem] ${profileFieldRingClass(!!empSixErr && (empSixVis || empSixBlurVis))}`}
                      aria-hidden
                    >
                      {effectiveUserType === 'LECTURER' ? 'LEC' : 'STF'}
                    </div>
                    <input
                      id="empSixEdit"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={form.empSix}
                      onChange={(e) => {
                        mark('empSix')
                        setForm((prev) => ({
                          ...prev,
                          empSix: sanitizeDigitSegment(e.target.value, 6),
                        }))
                      }}
                      onBlur={() => mark('empSixBlur')}
                      placeholder="000000"
                      maxLength={6}
                      className={`flex-1 min-w-0 font-mono text-sm ${baseField} ${profileFieldRingClass(!!empSixErr && (empSixVis || empSixBlurVis))}`}
                      aria-label={effectiveUserType === 'LECTURER' ? 'Lecturer ID digits' : 'Staff ID digits'}
                      required
                    />
                  </div>
                  <ProfileInlineError message={empSixVis || empSixBlurVis ? empSixErr : null} />
                </div>
              </>
            )}

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
                onClick={cancelEdit}
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
    </div>
  )
}
