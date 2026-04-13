import { useEffect, useMemo, useState } from 'react'

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

const TEMP_RESOURCE_OPTIONS = [
  { id: 'TMP_LECTURE_HALLS', name: 'Lecture Halls', type: 'SPACE' },
  { id: 'TMP_LABS', name: 'Labs', type: 'SPACE' },
  { id: 'TMP_MEETING_ROOMS', name: 'Meeting Rooms', type: 'SPACE' },
  { id: 'TMP_EQUIPMENT', name: 'Equipment (Projectors, Cameras, etc.)', type: 'EQUIPMENT' },
]

export default function BookingFormModal({
  isOpen,
  resources,
  submitting,
  mode = 'create',
  initialValues = null,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    studentId: '',
    studentName: '',
    faculty: '',
    resourceId: '',
    date: getToday(),
    startTime: '',
    endTime: '',
    purpose: '',
    attendeesCount: 1,
  })
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setLocalError('')
    const options = resources.length > 0 ? resources : TEMP_RESOURCE_OPTIONS
    if (initialValues) {
      setForm({
        studentId: initialValues.studentId || '',
        studentName: initialValues.studentName || '',
        faculty: initialValues.faculty || '',
        resourceId: initialValues.resourceId || options[0]?.id || '',
        date: initialValues.date || getToday(),
        startTime: initialValues.startTime || '',
        endTime: initialValues.endTime || '',
        purpose: initialValues.purpose || '',
        attendeesCount: initialValues.attendeesCount || 1,
      })
      return
    }

    setForm({
      studentId: '',
      studentName: '',
      faculty: '',
      resourceId: options[0]?.id || '',
      date: getToday(),
      startTime: '',
      endTime: '',
      purpose: '',
      attendeesCount: 1,
    })
  }, [isOpen, resources, initialValues])

  const resourceOptions = resources.length > 0 ? resources : TEMP_RESOURCE_OPTIONS

  const selectedResource = useMemo(
    () => resourceOptions.find((resource) => resource.id === form.resourceId),
    [resourceOptions, form.resourceId],
  )

  if (!isOpen) {
    return null
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setLocalError('')

    if (!form.resourceId) {
      setLocalError('Please select a resource')
      return
    }

    if (form.startTime >= form.endTime) {
      setLocalError('Start time must be earlier than end time')
      return
    }

    if (!form.studentId.trim() || !form.studentName.trim() || !form.faculty.trim()) {
      setLocalError('Student ID, Student Name, and Faculty are required')
      return
    }

    onSubmit({
      ...form,
      studentId: form.studentId.trim(),
      studentName: form.studentName.trim(),
      faculty: form.faculty.trim(),
      resourceName: selectedResource?.name || 'Unknown resource',
      attendeesCount: Number(form.attendeesCount),
    })
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 px-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-2xl border border-white/50 bg-white/75 p-6 shadow-[0_20px_45px_-18px_rgba(15,23,42,0.5)] backdrop-blur-md"
      >
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Request Booking</h2>
            <p className="text-sm text-slate-600">
              {mode === 'edit' ? 'Update your pending request details.' : 'Fill in your slot request details.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white/70 px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        {localError && (
          <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {localError}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm text-slate-700">
            Student ID
            <input
              type="text"
              required
              value={form.studentId}
              onChange={(event) => setForm((prev) => ({ ...prev, studentId: event.target.value }))}
              placeholder="IT23566552"
              className="rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 focus:border-cyan-500 focus:outline-none"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Student Name
            <input
              type="text"
              required
              value={form.studentName}
              onChange={(event) => setForm((prev) => ({ ...prev, studentName: event.target.value }))}
              placeholder="Shyni Atapattu"
              className="rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 focus:border-cyan-500 focus:outline-none"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700 sm:col-span-2">
            Faculty/Department
            <input
              type="text"
              required
              value={form.faculty}
              onChange={(event) => setForm((prev) => ({ ...prev, faculty: event.target.value }))}
              placeholder="Computing"
              className="rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 focus:border-cyan-500 focus:outline-none"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Resource
            <select
              value={form.resourceId}
              onChange={(event) => setForm((prev) => ({ ...prev, resourceId: event.target.value }))}
              className="rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 focus:border-cyan-500 focus:outline-none"
            >
              {resourceOptions.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} ({resource.type})
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Resource Name
            <input
              type="text"
              readOnly
              value={selectedResource?.name || ''}
              className="rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 text-slate-600"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Date
            <input
              type="date"
              min={getToday()}
              required
              value={form.date}
              onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              className="rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 focus:border-cyan-500 focus:outline-none"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Start Time
            <input
              type="time"
              required
              value={form.startTime}
              onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))}
              className="rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 focus:border-cyan-500 focus:outline-none"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            End Time
            <input
              type="time"
              min={form.startTime || undefined}
              required
              value={form.endTime}
              onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))}
              className="rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 focus:border-cyan-500 focus:outline-none"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700 sm:col-span-2">
            Purpose
            <textarea
              required
              rows={3}
              maxLength={240}
              value={form.purpose}
              onChange={(event) => setForm((prev) => ({ ...prev, purpose: event.target.value }))}
              className="rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 focus:border-cyan-500 focus:outline-none"
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Attendees
            <input
              type="number"
              min={1}
              required
              value={form.attendeesCount}
              onChange={(event) => setForm((prev) => ({ ...prev, attendeesCount: event.target.value }))}
              className="rounded-xl border border-slate-300/80 bg-white/80 px-3 py-2 focus:border-cyan-500 focus:outline-none"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : mode === 'edit' ? 'Update request' : 'Submit request'}
          </button>
        </div>
      </form>
    </div>
  )
}
