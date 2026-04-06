import { Link } from 'react-router-dom'

/** Student account area — Member 4 can add profile and notification preferences. */
export default function UserAccountPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Account</h1>
        <p className="text-slate-500 text-sm">
          Use <strong className="text-slate-700">Alerts</strong> in the header for notifications. OAuth sign-in is on
          the login page.
        </p>
      </div>
      <Link
        to="/login"
        className="inline-flex bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 text-sm font-medium"
      >
        Go to login
      </Link>
    </div>
  )
}
