import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { completeLoginWithToken } = useAuth()
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setError('Missing token. Try signing in again.')
      return
    }
    completeLoginWithToken(token)
      .then((me) => {
        if (me.profileCompleted !== true) {
          navigate('/complete-profile', { replace: true })
        } else {
          navigate(me.role === 'ADMIN' ? '/admin' : '/app', { replace: true })
        }
      })
      .catch(() => setError('Could not start your session. Try again.'))
  }, [searchParams, completeLoginWithToken, navigate])

  if (error) {
    return (
      <div className="max-w-md space-y-4">
        <p className="text-red-600 text-sm">{error}</p>
        <Link to="/login" className="text-blue-600 text-sm hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return <p className="text-slate-500 text-sm">Signing you in…</p>
}
