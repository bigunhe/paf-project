const STYLES = {
  PENDING: 'bg-amber-100/90 text-amber-800 border-amber-300/70',
  APPROVED: 'bg-emerald-100/90 text-emerald-800 border-emerald-300/70',
  REJECTED: 'bg-rose-100/90 text-rose-800 border-rose-300/70',
  CANCELLED: 'bg-slate-200/90 text-slate-700 border-slate-300/70',
}

export default function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.CANCELLED

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide ${style}`}
    >
      {status}
    </span>
  )
}
