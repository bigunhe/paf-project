import { Link } from 'react-router-dom'

export default function AdminDashboardPage() {
  const cards = [
    {
      to: '/admin/resources',
      title: 'Resource catalogue',
      desc: 'Member 1: manage halls, labs, and equipment.',
    },
    {
      to: '/admin/bookings',
      title: 'Booking approvals',
      desc: 'Member 2: review and approve or reject requests.',
    },
    {
      to: '/admin/incidents',
      title: 'Incidents & maintenance',
      desc: 'Member 3: triage reports, assign technicians, update status.',
    },
    {
      to: '/admin/users',
      title: 'Users & access',
      desc: 'Member 4: profiles, roles, and notification tooling (MVP stub).',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">Operations (staff)</h1>
      <p className="text-slate-500 mb-8">Manage catalogue, bookings, incidents, and accounts.</p>
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
