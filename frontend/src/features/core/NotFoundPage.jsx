import { Link } from 'react-router-dom'
import { PRIMARY_BUTTON_CLASS } from './ui'

export default function NotFoundPage() {
  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="text-slate-500 text-sm">
        That URL is not part of the Smart Campus Hub. Check the address or go back to the student or staff home.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          to="/app"
          className={`inline-flex py-2 px-4 text-sm ${PRIMARY_BUTTON_CLASS}`}
        >
          Student home
        </Link>
        <Link
          to="/admin"
          className="inline-flex bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg py-2 px-4 text-sm font-medium"
        >
          Staff home
        </Link>
      </div>
    </div>
  )
}
