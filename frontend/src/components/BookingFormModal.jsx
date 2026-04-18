import { useEffect, useMemo, useState } from 'react'

/** Calendar day YYYY-MM-DD in the user's local timezone (matches &lt;input type="date"&gt;). */
function getTodayLocal() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isValidTimeRange(startTime, endTime) {
  if (!startTime || !endTime) return false
  return startTime < endTime
}

function isPastDate(dateValue) {
  if (!dateValue) return true
  return dateValue < getTodayLocal()
}

function isSameLocalCalendarDay(dateStr) {
  return Boolean(dateStr && dateStr === getTodayLocal())
}

/** True if combining date + time yields a moment strictly after now (local parsing). */
function isDateTimeInFuture(dateStr, timeStr) {
  const dt = toDateTime(dateStr, timeStr)
  return Boolean(dt && dt.getTime() > Date.now())
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

function toDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) return null
  const date = new Date(`${dateValue}T${timeValue}`)
  if (Number.isNaN(date.getTime())) return null
  return date
}

function isOverlapping(startA, endA, startB, endB) {
  return startA < endB && startB < endA
}

export default function BookingFormModal({
  isOpen,
  resources,
  existingBookings = [],
  editingBookingId = null,
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
    date: getTodayLocal(),
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
        date: initialValues.date || getTodayLocal(),
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
      date: getTodayLocal(),
      startTime: '',
      endTime: '',
      purpose: '',
      attendeesCount: 1,
    })
  }, [isOpen, initialValues])

  useEffect(() => {
    if (!isOpen || resources.length === 0) return

    const exists = resources.some((resource) => resource.id === form.resourceId)
    if (form.resourceId && !exists) {
      setForm((prev) => ({ ...prev, resourceId: '' }))
    }
  }, [isOpen, resources, form.resourceId])

  useEffect(() => {
    if (!form.startTime || !form.endTime) return
    if (form.endTime <= form.startTime) {
      setForm((prev) => ({ ...prev, endTime: '' }))
    }
  }, [form.startTime, form.endTime])

  /** Clear times that are no longer valid (e.g. today + slot already passed). */
  useEffect(() => {
    if (!form.date) return
    if (form.startTime && !isDateTimeInFuture(form.date, form.startTime)) {
      setForm((prev) => ({ ...prev, startTime: '', endTime: '' }))
      return
    }
    if (form.endTime && !isDateTimeInFuture(form.date, form.endTime)) {
      setForm((prev) => ({ ...prev, endTime: '' }))
    }
  }, [form.date, form.startTime, form.endTime])

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === form.resourceId),
    [resources, form.resourceId],
  )

  const startTimeOptions = useMemo(() => {
    let options = buildTimeOptions(30)
    if (form.date && isSameLocalCalendarDay(form.date)) {
      const now = Date.now()
      options = options.filter((option) => {
        const t = toDateTime(form.date, option.value)
        return t && t.getTime() > now
      })
    }
    if (
      form.startTime &&
      !options.some((option) => option.value === form.startTime) &&
      isDateTimeInFuture(form.date, form.startTime)
    ) {
      options.unshift({ value: form.startTime, label: formatTimeLabel(form.startTime) })
    }
    return options
  }, [form.date, form.startTime])

  const endTimeOptions = useMemo(() => {
    const now = Date.now()
    let options = buildTimeOptions(30).filter((option) => !form.startTime || option.value > form.startTime)
    if (form.date && isSameLocalCalendarDay(form.date)) {
      options = options.filter((option) => {
        const t = toDateTime(form.date, option.value)
        return t && t.getTime() > now
      })
    }
    if (
      form.endTime &&
      !options.some((option) => option.value === form.endTime) &&
      isDateTimeInFuture(form.date, form.endTime) &&
      (!form.startTime || form.endTime > form.startTime)
    ) {
      options.unshift({ value: form.endTime, label: formatTimeLabel(form.endTime) })
    }
    return options
  }, [form.date, form.startTime, form.endTime])

  const conflictMessage = useMemo(() => {
    if (!form.resourceId || !form.date || !form.startTime || !form.endTime) return ''

    const requestedStart = toDateTime(form.date, form.startTime)
    const requestedEnd = toDateTime(form.date, form.endTime)
    if (!requestedStart || !requestedEnd || requestedStart >= requestedEnd) return ''

    const conflictingBooking = existingBookings.find((booking) => {
      if (!booking || booking.id === editingBookingId) return false
      if (booking.resourceId !== form.resourceId) return false
      if (booking.status === 'REJECTED' || booking.status === 'CANCELLED') return false

      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)
      if (Number.isNaN(bookingStart.getTime()) || Number.isNaN(bookingEnd.getTime())) return false

      return isOverlapping(requestedStart, requestedEnd, bookingStart, bookingEnd)
    })

    if (!conflictingBooking) return ''

    const conflictDate = new Date(conflictingBooking.startTime).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    const conflictStart = new Date(conflictingBooking.startTime).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    const conflictEnd = new Date(conflictingBooking.endTime).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    return `Scheduling conflict: this resource is already booked on ${conflictDate} from ${conflictStart} to ${conflictEnd}.`
  }, [form.resourceId, form.date, form.startTime, form.endTime, existingBookings, editingBookingId])

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

    const slotStart = toDateTime(form.date, form.startTime)
    const slotEnd = toDateTime(form.date, form.endTime)
    if (!slotStart || slotStart.getTime() <= Date.now()) {
      setLocalError('Start time must be in the future.')
      return
    }
    if (!slotEnd || slotEnd.getTime() <= Date.now()) {
      setLocalError('End time must be in the future.')
      return
    }

    if (conflictMessage) {
      setLocalError(conflictMessage)
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[radial-gradient(circle_at_20%_20%,rgba(125,211,252,0.22),rgba(2,6,23,0.78))] px-4 py-6 backdrop-blur-md">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-3xl rounded-[1.75rem] border border-white/30 bg-white/18 p-6 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.75)] backdrop-blur-xl"
      >
        <div className="mb-6 rounded-2xl border border-cyan-200/30 bg-[linear-gradient(120deg,rgba(15,23,42,0.84),rgba(30,58,138,0.58))] px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/90">Institutional Logistics</p>
            <h2 className="text-4xl font-bold tracking-tight text-white">Booking Request</h2>
            <p className="mt-1 text-sm text-slate-200/90">
              {mode === 'edit' ? 'Update your pending request details.' : 'Fill in your slot request details.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/35 bg-white/10 px-3 py-1 text-sm text-white transition hover:bg-white/20"
          >
            Close
          </button>
          </div>
        </div>

        {localError && (
          <div className="mb-4 rounded-xl border border-rose-300/70 bg-rose-100/85 px-3 py-2 text-sm text-rose-800 shadow-sm backdrop-blur">
            {localError}
          </div>
        )}

        <div className="space-y-5">
          <section className="space-y-3 rounded-2xl border border-white/35 bg-white/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur">
            <h3 className="text-sm font-semibold text-slate-900">Student Identification</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Student ID
                <input
                  type="text"
                  required
                  minLength={5}
                  maxLength={20}
                  value={form.studentId}
                  readOnly
                  aria-readonly="true"
                  placeholder="IT23566552"
                  className="rounded-xl border border-slate-300/80 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none"
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
                  readOnly
                  aria-readonly="true"
                  placeholder="Shyni Atapattu"
                  className="rounded-xl border border-slate-300/80 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none"
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
                readOnly
                aria-readonly="true"
                placeholder="Computing"
                className="rounded-xl border border-slate-300/80 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none"
              />
            </label>
          </section>

          <section className="space-y-3 rounded-2xl border border-white/35 bg-white/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur">
            <h3 className="text-sm font-semibold text-slate-900">Resource Selection</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Resource
                <select
                  value={form.resourceId}
                  onChange={(event) => setForm((prev) => ({ ...prev, resourceId: event.target.value }))}
                  disabled={resourcesLoading || Boolean(resourcesError) || resources.length === 0}
                  className="rounded-xl border border-slate-300/80 bg-white/75 px-3 py-2 text-sm font-medium text-slate-700 focus:border-cyan-500 focus:outline-none"
                >
                  {resourcesLoading && <option value="">Loading resources...</option>}
                  {!resourcesLoading && resourcesError && <option value="">Failed to load resources</option>}
                  {!resourcesLoading && !resourcesError && resources.length === 0 && <option value="">No resources available</option>}
                  {!resourcesLoading && !resourcesError && resources.length > 0 && (
                    <>
                      <option value="">Select resource</option>
                      {resources.map((resource) => (
                        <option key={resource.id} value={resource.id}>
                          {resource.name}
                        </option>
                      ))}
                    </>
                  )}
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
                  value={selectedResource?.name || 'Select a resource'}
                  className="w-full rounded-xl border border-slate-300/80 bg-white/55 px-3 py-2.5 text-sm font-medium text-slate-600"
                />
              </label>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-white/35 bg-white/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur">
            <h3 className="text-sm font-semibold text-slate-900">Scheduling Details</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date
                <input
                  type="date"
                  min={getTodayLocal()}
                  required
                  value={form.date}
                  onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                  className="rounded-xl border border-slate-300/80 bg-white/75 px-3 py-2 text-sm font-medium text-slate-700 focus:border-cyan-500 focus:outline-none"
                />
              </label>

              <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Preferred Start Time
                <select
                  required
                  value={form.startTime}
                  onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))}
                  className="rounded-xl border border-slate-300/80 bg-white/75 px-3 py-2 text-sm font-medium text-slate-700 focus:border-cyan-500 focus:outline-none"
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
                  className="rounded-xl border border-slate-300/80 bg-white/75 px-3 py-2 text-sm font-medium text-slate-700 focus:border-cyan-500 focus:outline-none"
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
            {conflictMessage && (
              <div className="rounded-xl border border-rose-300/70 bg-rose-100/85 px-3 py-2 text-xs normal-case text-rose-800 shadow-sm">
                {conflictMessage}
              </div>
            )}
          </section>

          <section className="space-y-3 rounded-2xl border border-white/35 bg-white/45 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] backdrop-blur">
            <h3 className="text-sm font-semibold text-slate-900">Purpose & Attendees</h3>
            <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Research Purpose / Description
              <textarea
                required
                rows={3}
                maxLength={240}
                minLength={10}
                value={form.purpose}
                onChange={(event) => setForm((prev) => ({ ...prev, purpose: event.target.value }))}
                className="rounded-xl border border-slate-300/80 bg-white/75 px-3 py-2 text-sm font-medium text-slate-700 focus:border-cyan-500 focus:outline-none"
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
                className="rounded-xl border border-slate-300/80 bg-white/75 px-3 py-2 text-sm font-medium text-slate-700 focus:border-cyan-500 focus:outline-none"
              />
            </label>
          </section>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/35 bg-white/40 px-3 py-2 text-xs text-slate-600 backdrop-blur">
            <span>Responses are typically processed within 24 business hours.</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300/80 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || Boolean(conflictMessage)}
            className="rounded-xl bg-[linear-gradient(120deg,#0f172a,#1d4ed8)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_-18px_rgba(15,23,42,0.9)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : mode === 'edit' ? 'Update request' : 'Submit request'}
          </button>
        </div>
      </form>
    </div>
  )
}
