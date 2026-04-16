/**
 * Navy gradient page header — same visual language as Resource Booking Hub (MyBookings).
 */
export function PageHeroMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-right backdrop-blur">
      <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-100/85">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

export default function PageHero({ eyebrow, title, description, aside, className = '' }) {
  return (
    <header
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-5 py-6 text-white shadow-[0_18px_40px_-26px_rgba(15,23,42,0.75)] md:px-7 ${className}`}
    >
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/90">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-200/90">{description}</p>
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
    </header>
  )
}
