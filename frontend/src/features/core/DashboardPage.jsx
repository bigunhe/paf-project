import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const cards = [
    { to: '/resources', title: 'Facilities', desc: 'Browse and manage campus resources.' },
    { to: '/bookings', title: 'Bookings', desc: 'Request slots and approve as admin.' },
    { to: '/tickets', title: 'Maintenance', desc: 'Report and track incidents.' },
    { to: '/login', title: 'Account', desc: 'Sign in (OAuth coming soon).' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">Dashboard</h1>
      <p className="text-slate-500 mb-8">Overview of Smart Campus Operations Hub.</p>
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
    </div>
  )
}
