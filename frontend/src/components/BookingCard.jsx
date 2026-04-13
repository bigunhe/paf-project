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
    <article className="rounded-2xl border border-white/50 bg-white/60 p-5 shadow-[0_10px_30px_-16px_rgba(15,23,42,0.45)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_-18px_rgba(15,23,42,0.5)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{booking.resourceName}</h3>
          <p className="text-xs text-slate-500">Resource ID: {booking.resourceId}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Date</dt>
          <dd className="font-medium">{displayDate(booking.date)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Time</dt>
          <dd className="font-medium">{booking.startTime} - {booking.endTime}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Purpose</dt>
          <dd className="line-clamp-2">{booking.purpose}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Attendees</dt>
          <dd className="font-medium">{booking.attendeesCount}</dd>
        </div>
      </dl>

      {booking.rejectionReason && (
        <div className="mt-4 rounded-xl border border-rose-200/80 bg-rose-50/80 p-3 text-sm text-rose-700">
          <p className="font-semibold">Rejection reason</p>
          <p>{booking.rejectionReason}</p>
        </div>
      )}

      {(canEdit || canCancel || canRemoveRejected) && (
        <div className="mt-5 flex justify-end gap-2">
          {canEdit && (
            <button
              type="button"
              disabled={editing}
              onClick={() => onEdit(booking)}
              className="rounded-xl border border-slate-300/80 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {editing ? 'Opening...' : 'Edit request'}
            </button>
          )}

          {canCancel && (
            <button
              type="button"
              disabled={cancelling}
              onClick={() => onCancel(booking)}
              className="rounded-xl border border-slate-300/80 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel request'}
            </button>
          )}

          {canRemoveRejected && (
            <button
              type="button"
              disabled={removing}
              onClick={() => onRemoveRejected(booking)}
              className="rounded-xl border border-rose-300/90 bg-rose-50/80 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {removing ? 'Removing...' : 'Remove rejected booking'}
            </button>
          )}
        </div>
      )}
    </article>
  )
}
