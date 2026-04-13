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
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.6)] transition hover:border-slate-300 hover:shadow-[0_16px_30px_-24px_rgba(15,23,42,0.65)]">
      <div className="grid gap-4 md:grid-cols-[2fr_1.3fr_1fr_1.3fr] md:items-start">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Resource Details</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-sky-100 text-sky-700 ring-1 ring-sky-200">▣</div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 leading-tight">{booking.resourceName}</h3>
              <p className="text-xs text-slate-500">Resource ID: {booking.resourceId}</p>
            </div>
          </div>
          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Purpose</p>
            <p className="text-sm text-slate-700 line-clamp-2">{booking.purpose}</p>
          </div>
          <div className="mt-3 grid gap-2 rounded-xl border border-slate-200 px-3 py-2 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Student Name</p>
              <p className="text-sm font-semibold text-slate-800">{booking.studentName || '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Student ID</p>
              <p className="text-sm text-slate-700">{booking.studentId || '-'}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Scheduled Time</p>
          <div className="mt-2 rounded-xl border border-slate-200 px-3 py-2">
            <p className="text-base font-semibold text-slate-800">{displayDate(booking.date)}</p>
            <p className="text-sm text-slate-600">{booking.startTime} - {booking.endTime}</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p>
          <div className="mt-2">
            <StatusBadge status={booking.status} />
          </div>
          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Attendees</p>
            <p className="text-lg font-semibold text-slate-800">{booking.attendeesCount}</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Operations</p>
          <div className="mt-2 flex flex-wrap gap-2 md:justify-end">
            {canEdit && (
              <button
                type="button"
                disabled={editing}
                onClick={() => onEdit(booking)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editing ? 'Opening...' : 'Edit request'}
              </button>
            )}

            {canCancel && (
              <button
                type="button"
                disabled={cancelling}
                onClick={() => onCancel(booking)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel request'}
              </button>
            )}

            {canRemoveRejected && (
              <button
                type="button"
                disabled={removing}
                onClick={() => onRemoveRejected(booking)}
                className="rounded-xl border border-rose-300/90 bg-rose-50/80 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {removing ? 'Removing...' : 'Remove rejected booking'}
              </button>
            )}
          </div>
        </div>
      </div>

      {booking.rejectionReason && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <p className="font-semibold">Rejection reason</p>
          <p>{booking.rejectionReason}</p>
        </div>
      )}
    </article>
  )
}
