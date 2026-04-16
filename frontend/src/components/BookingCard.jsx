import StatusBadge from './StatusBadge'

function displayDate(isoDate) {
  if (!isoDate) return '-'
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString()
}

export default function BookingCard({ booking, onEdit, editing, onCancel, cancelling, onRemoveRejected, removing }) {
  const canEdit = booking.status === 'PENDING'
  const canCancel = booking.status === 'PENDING' || booking.status === 'APPROVED'
  const canRemoveRejected = booking.status === 'REJECTED'

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)] transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_22px_44px_-28px_rgba(15,23,42,0.55)] odd:bg-slate-50/70">
      <div className="grid gap-0 md:grid-cols-[2.2fr_1fr_1fr_1.1fr] md:items-stretch">
        <div className="relative overflow-hidden p-4 md:border-r md:border-slate-200">
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-cyan-400" />
          <div className="flex items-start gap-3 pl-2">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-sm">
              {booking.resourceName?.slice(0, 1)?.toUpperCase() || 'B'}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-lg font-semibold tracking-tight text-slate-950">{booking.resourceName}</h3>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
                  Resource
                </span>
              </div>
              <p className="text-xs text-slate-500">Resource ID: {booking.resourceId}</p>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{booking.purpose}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 pl-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Student Name</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{booking.studentName || '-'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Student ID</p>
              <p className="mt-1 text-sm text-slate-700">{booking.studentId || '-'}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-slate-200 p-4 md:border-l md:border-t-0 md:border-r md:border-slate-200">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Scheduled Time</p>
            <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
              <p className="text-sm font-semibold text-slate-900">{displayDate(booking.date)}</p>
              <p className="text-sm text-slate-600">{booking.startTime} - {booking.endTime}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-[0_10px_18px_-20px_rgba(15,23,42,0.45)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Attendees</p>
            <p className="mt-1 text-2xl font-black tracking-tight text-slate-950">{booking.attendeesCount}</p>
          </div>
        </div>

        <div className="flex items-center border-t border-slate-200 p-4 md:border-t-0 md:border-r md:border-slate-200 md:justify-center">
          <StatusBadge status={booking.status} />
        </div>

        <div className="flex flex-col justify-between gap-3 p-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Operations</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {canEdit && (
                <button
                  type="button"
                  disabled={editing}
                  onClick={() => onEdit(booking)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editing ? 'Opening...' : 'Edit request'}
                </button>
              )}

              {canCancel && (
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => onCancel(booking)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel request'}
                </button>
              )}

              {canRemoveRejected && (
                <button
                  type="button"
                  disabled={removing}
                  onClick={() => onRemoveRejected(booking)}
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {removing ? 'Removing...' : 'Remove rejected booking'}
                </button>
              )}
            </div>
          </div>

          {booking.rejectionReason && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-500">Rejection reason</p>
              <p className="mt-1 leading-6">{booking.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
