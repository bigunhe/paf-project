/** Inline validation message — only render when `message` is set. */
export default function ProfileInlineError({ message }) {
  if (!message) return null
  return (
    <p className="mt-1.5 text-sm leading-snug text-red-600" role="alert">
      {message}
    </p>
  )
}

export function profileFieldRingClass(invalid) {
  return invalid
    ? 'border-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-600/20'
    : 'border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10'
}
