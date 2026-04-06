import { Link } from 'react-router-dom'

export default function UserDashboardPage() {
  const cards = [
    {
      to: '/app/resources',
      title: 'Browse spaces & equipment',
      desc: 'See rooms, labs, and gear you can book.',
    },
    {
      to: '/app/bookings',
      title: 'My bookings',
      desc: 'Request a time slot and track your requests.',
    },
    {
      to: '/app/report',
      title: 'Report a problem',
      desc: 'Something broken or unsafe? Tell facilities.',
    },
    {
      to: '/app/account',
      title: 'Account & alerts',
      desc: 'Sign in and check your notifications.',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">Campus (student)</h1>
      <p className="text-slate-500 mb-8">Book spaces, track requests, and report issues.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 hover:border-blue-200 transition-colors"
          >
            <h2 className="text-lg font-medium text-slate-900 mb-1">{c.title}</h2>
            <p className="text-slate-500 text-sm">{c.desc}</p>
          </Link>
        ))}
      </div>
      <p className="text-slate-400 text-xs mt-8">
        Staff: use the <strong className="text-slate-500 font-medium">Staff portal</strong> checkbox in the header
        to open <code className="text-[11px] bg-slate-100 px-1 rounded">/admin</code>.
      </p>
    </div>
  )
}
