import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../core/AuthContext'
import { OAUTH_GOOGLE_URL } from '../core/constants'
import { PRIMARY_BUTTON_CLASS } from '../core/ui'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      if (user.profileCompleted !== true) {
        navigate('/complete-profile', { replace: true })
      } else {
        navigate(user.role === 'ADMIN' ? '/admin' : '/app', { replace: true })
      }
    }
  }, [user, loading, navigate])

  if (!loading && user) {
    return null
  }

  return (
    <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-lg shadow-sm p-8">
      <h1 className="text-xl font-semibold text-slate-900 mb-2">Sign in</h1>
      <p className="text-slate-500 text-sm mb-6">
        Use your campus Google account. After OAuth completes, we load your profile from the database and send you to the
        student or staff dashboard based on your role.
      </p>
      <a
        href={OAUTH_GOOGLE_URL}
        className={`flex w-full justify-center py-2 px-4 text-sm ${PRIMARY_BUTTON_CLASS}`}
      >
        Continue with Google
      </a>

      <Link to="/" className="mt-6 inline-flex text-sm text-blue-600 hover:underline">
        Back to home
      </Link>
    </div>
  )
}
