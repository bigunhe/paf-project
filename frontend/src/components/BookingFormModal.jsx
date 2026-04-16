import { useEffect, useMemo, useState } from 'react'

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function isValidTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return false
  return startTime < endTime
}

function isPastDate(dateValue) {
  if (!dateValue) return true
  return dateValue < getToday()
}

function formatTimeLabel(timeValue) {
  if (!timeValue) return ''

  const [hourValue, minuteValue] = timeValue.split(':').map(Number)
  if (Number.isNaN(hourValue) || Number.isNaN(minuteValue)) {
    return timeValue
  }

  const period = hourValue >= 12 ? 'PM' : 'AM'
  const displayHour = hourValue % 12 || 12
  const paddedMinutes = String(minuteValue).padStart(2, '0')
  return `${displayHour}:${paddedMinutes} ${period}`
}

function buildTimeOptions(intervalMinutes = 30, startHour = 7, endHour = 22) {
  const options = []

  for (let hour = startHour; hour <= endHour; hour += 1) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      if (hour === endHour && minute > 0) {
        break
      }

      const timeValue = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      options.push({ value: timeValue, label: formatTimeLabel(timeValue) })
    }
  }

  return options
}

export default function BookingFormModal({
  isOpen,
  resources,
  resourcesLoading = false,
  resourcesError = '',
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

    if (initialValues) {
      setForm({
        studentId: initialValues.studentId || '',
        studentName: initialValues.studentName || '',
        faculty: initialValues.faculty || '',
        resourceId: initialValues.resourceId || '',
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
      resourceId: '',
      date: getToday(),
      startTime: '',
      endTime: '',
      purpose: '',
      attendeesCount: 1,
    })
  }, [isOpen, initialValues])

  useEffect(() => {
    if (!isOpen || resources.length === 0) return

    const exists = resources.some((resource) => resource.id === form.resourceId)
    if (!form.resourceId || !exists) {
      setForm((prev) => ({ ...prev, resourceId: resources[0].id }))
    }
  }, [isOpen, resources, form.resourceId])

  useEffect(() => {
    if (!form.startTime || !form.endTime) return
    if (form.endTime <= form.startTime) {
      setForm((prev) => ({ ...prev, endTime: '' }))
    }
  }, [form.startTime, form.endTime])

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === form.resourceId),
    [resources, form.resourceId],
  )

  const startTimeOptions = useMemo(() => {
    const options = buildTimeOptions(30)
    if (form.startTime && !options.some((option) => option.value === form.startTime)) {
      options.unshift({ value: form.startTime, label: formatTimeLabel(form.startTime) })
    }
    return options
  }, [form.startTime])

  const endTimeOptions = useMemo(() => {
    const options = buildTimeOptions(30).filter((option) => !form.startTime || option.value > form.startTime)
    if (form.endTime && !options.some((option) => option.value === form.endTime)) {
      options.unshift({ value: form.endTime, label: formatTimeLabel(form.endTime) })
    }
    return options
  }, [form.startTime, form.endTime])

  if (!isOpen) {
    return null
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setLocalError('')

    const studentId = form.studentId.trim()
    const studentName = form.studentName.trim()
    const faculty = form.faculty.trim()
    const purpose = form.purpose.trim()
    const attendeesCount = Number(form.attendeesCount)

    if (resourcesLoading) {
      setLocalError('Please wait until resources finish loading')
      return
    }

    if (resourcesError) {
      setLocalError('Resources could not be loaded. Please try again.')
      return
    }

    if (!form.resourceId) {
      setLocalError('Please select a resource')
      return
    }

    if (!selectedResource) {
      setLocalError('Selected resource is not available')
      return
    }

    if (!studentId) {
      setLocalError('Student ID is required')
      return
    }

    if (studentId.length < 5) {
      setLocalError('Student ID must be at least 5 characters')
      return
    }

    if (!studentName) {
      setLocalError('Student Name is required')
      return
    }

    if (studentName.length < 3) {
      setLocalError('Student Name must be at least 3 characters')
      return
    }

    if (!faculty) {
      setLocalError('Faculty / Department is required')
      return
    }

    if (isPastDate(form.date)) {
      setLocalError('Booking date cannot be in the past')
      return
    }

    if (!isValidTimeRange(form.startTime, form.endTime)) {
      setLocalError('Start time must be earlier than end time')
      return
    }

    if (!purpose) {
      setLocalError('Purpose / description is required')
      return
    }

    if (purpose.length < 10) {
      setLocalError('Purpose should be at least 10 characters')
      return
    }

    if (!Number.isInteger(attendeesCount) || attendeesCount < 1) {
      setLocalError('Number of attendees must be at least 1')
      return
    }

    if (attendeesCount > 1000) {
      setLocalError('Number of attendees looks too large')
      return
    }

    onSubmit({
      ...form,
      studentId,
      studentName,
      faculty,
      purpose,
      resourceName: selectedResource?.name || 'Unknown resource',
      attendeesCount,
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 px-4 py-6 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_46px_-24px_rgba(15,23,42,0.5)]"
      >
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Institutional Logistics</p>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">Booking Request</h2>
            <p className="mt-1 text-sm text-slate-500">
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

        <div className="space-y-5">
          <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <h3 className="text-sm font-semibold text-slate-800">Student Identification</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Student ID
                <input
                  type="text"
                  required
                  minLength={5}
                  maxLength={20}
                  value={form.studentId}
                  onChange={(event) => setForm((prev) => ({ ...prev, studentId: event.target.value }))}
                  placeholder="IT23566552"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-cyan-500 focus:outline-none"
                />
              </label>

              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Student Name
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={80}
                  value={form.studentName}
                  onChange={(event) => setForm((prev) => ({ ...prev, studentName: event.target.value }))}
                  placeholder="Shyni Atapattu"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-cyan-500 focus:outline-none"
                />
              </label>
            </div>

            <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Faculty / Department
              <input
                type="text"
                required
                minLength={2}
                maxLength={80}
                value={form.faculty}
                onChange={(event) => setForm((prev) => ({ ...prev, faculty: event.target.value }))}
                placeholder="Computing"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-cyan-500 focus:outline-none"
              />
            </label>
          </section>

          <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <h3 className="text-sm font-semibold text-slate-800">Resource Selection</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Resource
                <select
                  value={form.resourceId}
                  onChange={(event) => setForm((prev) => ({ ...prev, resourceId: event.target.value }))}
                  disabled={resourcesLoading || Boolean(resourcesError) || resources.length === 0}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-cyan-500 focus:outline-none"
                >
                  {resourcesLoading && <option value="">Loading resources...</option>}
                  {!resourcesLoading && resourcesError && <option value="">Failed to load resources</option>}
                  {!resourcesLoading && !resourcesError && resources.length === 0 && <option value="">No resources available</option>}
                  {!resourcesLoading && !resourcesError && resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name}
                    </option>
                  ))}
                </select>
                {!resourcesLoading && resourcesError && (
                  <span className="text-[11px] normal-case text-rose-600">{resourcesError}</span>
                )}
              </label>

              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Resource Name
                <input
                  type="text"
                  readOnly
                  value={selectedResource?.name || ''}
                  className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-600"
                />
              </label>
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <h3 className="text-sm font-semibold text-slate-800">Scheduling Details</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
                <input
                  type="date"
                  min={getToday()}
                  required
                  value={form.date}
                  onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-cyan-500 focus:outline-none"
                />
              </label>

              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Preferred Start Time
                <select
                  required
                  value={form.startTime}
                  onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">Choose a start time</option>
                  {startTimeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] normal-case text-slate-400">30-minute slots from 7:00 AM onward</span>
              </label>

              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Preferred End Time
                <select
                  required
                  value={form.endTime}
                  onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">Choose an end time</option>
                  {endTimeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] normal-case text-slate-400">Must be later than start time</span>
              </label>
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <h3 className="text-sm font-semibold text-slate-800">Purpose & Attendees</h3>
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Research Purpose / Description
              <textarea
                required
                rows={3}
                maxLength={240}
                minLength={10}
                value={form.purpose}
                onChange={(event) => setForm((prev) => ({ ...prev, purpose: event.target.value }))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-cyan-500 focus:outline-none"
              />
            </label>

            <label className="grid max-w-xs gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Number Of Attendees
              <input
                type="number"
                min={1}
                step={1}
                required
                value={form.attendeesCount}
                onChange={(event) => setForm((prev) => ({ ...prev, attendeesCount: event.target.value }))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-cyan-500 focus:outline-none"
              />
            </label>
          </section>

          <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
            <span>Responses are typically processed within 24 business hours.</span>
          </div>
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
