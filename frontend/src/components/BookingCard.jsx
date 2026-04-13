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
    <article className="rounded-xl border border-slate-100 bg-white px-4 py-4 transition hover:bg-slate-50/70">
      <div className="grid gap-4 md:grid-cols-[2fr_1.3fr_1fr_1.3fr] md:items-start">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Resource Details</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-700">▣</div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{booking.resourceName}</h3>
              <p className="text-xs text-slate-500">Resource ID: {booking.resourceId}</p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Purpose</p>
            <p className="text-sm text-slate-700 line-clamp-2">{booking.purpose}</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Scheduled Time</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{displayDate(booking.date)}</p>
          <p className="text-sm text-slate-700">{booking.startTime} - {booking.endTime}</p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p>
          <div className="mt-2">
            <StatusBadge status={booking.status} />
          </div>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Attendees</p>
          <p className="text-sm font-semibold text-slate-800">{booking.attendeesCount}</p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Operations</p>
          <div className="mt-2 flex flex-wrap gap-2 md:justify-end">
            {canEdit && (
              <button
                type="button"
                disabled={editing}
                onClick={() => onEdit(booking)}
                className="rounded-xl border border-slate-300/80 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editing ? 'Opening...' : 'Edit request'}
              </button>
            )}

            {canCancel && (
              <button
                type="button"
                disabled={cancelling}
                onClick={() => onCancel(booking)}
                className="rounded-xl border border-slate-300/80 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="mt-4 rounded-xl border border-rose-200/80 bg-rose-50/80 p-3 text-sm text-rose-700">
          <p className="font-semibold">Rejection reason</p>
          <p>{booking.rejectionReason}</p>
        </div>
      )}
    </article>
  )
}
