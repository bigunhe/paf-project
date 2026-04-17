import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../core/AuthContext'
import { OAUTH_GOOGLE_URL } from '../core/constants'
import PageHero from '../core/PageHero'
import { PRIMARY_BUTTON_CLASS } from '../core/ui'
import api from '../core/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, loading, completeLoginWithToken } = useAuth()
  const [devLoading, setDevLoading] = useState(false)

  const handleDevLogin = async (role) => {
    try {
      setDevLoading(true)
      const res = await api.get(`/auth/dev-login?as=${role}`)
      if (res.data && res.data.accessToken) {
        await completeLoginWithToken(res.data.accessToken)
      }
    } catch (err) {
      console.error(err)
      alert("Dev login failed. Is the local backend running? " + err.message)
    } finally {
      setDevLoading(false)
    }
  }

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
    <div className="space-y-6">
      <PageHero
        eyebrow="Authentication"
        title="Sign in"
        description="Use your campus Google account. After OAuth completes, we load your profile from the database and send you to the student or staff dashboard based on your role."
      />
      <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-lg shadow-sm p-8">
      <p className="text-slate-500 text-sm mb-6">
        Continue below to open the Google sign-in window for your organization.
      </p>
      {/* 
      <a
        href={OAUTH_GOOGLE_URL}
        className={`flex w-full justify-center py-2 px-4 text-sm ${PRIMARY_BUTTON_CLASS}`}
      >
        Continue with Google
      </a>
      */}

      <div className="mt-8 pt-6 border-t border-slate-200">
        <p className="text-slate-500 text-sm mb-4">
          Local Development Sign-in:
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => handleDevLogin('user')}
            disabled={devLoading}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded font-medium text-sm transition-colors disabled:opacity-50"
          >
            Student Login
          </button>
          <button
            onClick={() => handleDevLogin('admin')}
            disabled={devLoading}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded font-medium text-sm transition-colors disabled:opacity-50"
          >
            Admin Login
          </button>
        </div>
      </div>

      <Link to="/" className="mt-6 inline-flex text-sm text-blue-600 hover:underline">
        Back to home
      </Link>
      </div>
    </div>
  )
}
