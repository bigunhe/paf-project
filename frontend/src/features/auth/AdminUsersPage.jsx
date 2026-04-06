/**
 * Member 4 placeholder — wire to GET /api/v1/users, roles, and future OAuth admin tools.
 * Collections: users (see docs/01-BUSINESS_AND_DATA_MODEL.md).
 */
export default function AdminUsersPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Users & access</h1>
      <p className="text-slate-500 text-sm">
        MVP stub. Extend here with user tables, role changes, and audit. Backend:{' '}
        <code className="text-slate-700 bg-slate-100 px-1 rounded">GET /api/v1/users</code> and related
        endpoints per <code className="text-slate-700 bg-slate-100 px-1 rounded">docs/03-BACKEND_API_RULES.md</code>.
      </p>
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 text-slate-500 text-sm">
        Owner: <strong className="text-slate-700">Member 4</strong> — replace this panel with real admin UI.
      </div>
    </div>
  )
}
