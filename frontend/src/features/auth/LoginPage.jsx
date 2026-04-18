import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../core/AuthContext'
import PageHero from '../core/PageHero'
import { PRIMARY_BUTTON_CLASS } from '../core/ui'
import api from '../core/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, loading, completeLoginWithToken } = useAuth()
  
  const [roleMode, setRoleMode] = useState(null) // 'USER' or 'ADMIN'
  const [devLoading, setDevLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleDevLogin = async () => {
    try {
      setDevLoading(true)
      setError('')
      const as = roleMode === 'ADMIN' ? 'admin' : 'user'
      const res = await api.get(`/auth/dev-login?as=${as}&expectedRole=${roleMode}`)
      if (res.data && res.data.accessToken) {
        await completeLoginWithToken(res.data.accessToken)
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || err.message)
    } finally {
      setDevLoading(false)
    }
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    try {
      setDevLoading(true)
      setError('')
      const res = await api.post('/auth/login', {
        email,
        password,
        role: roleMode
      })
      if (res.data && res.data.accessToken) {
        await completeLoginWithToken(res.data.accessToken)
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || err.message)
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
        description="Select your campus role and authenticate securely. Access to features is strictly validated against your role."
      />
      
      <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-lg shadow-sm p-8">
        
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-r shadow-sm text-sm font-medium">
            {error}
          </div>
        )}

        {!roleMode ? (
          <>
            <p className="text-slate-500 text-sm mb-6 text-center">
              Please choose your role to continue testing the unified authentication system.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setRoleMode('USER')}
                className={`w-full py-3 px-4 text-sm font-medium ${PRIMARY_BUTTON_CLASS} shadow-sm`}
              >
                Continue as Student
              </button>

              <button
                onClick={() => setRoleMode('ADMIN')}
                className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 py-3 px-4 rounded-lg font-medium text-sm transition-all shadow-sm"
              >
                Continue as Staff / Admin
              </button>
            </div>
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-800">
                {roleMode === 'USER' ? 'Student Login' : 'Staff / Admin Login'}
              </h3>
              <button 
                onClick={() => { setRoleMode(null); setError(''); setEmail(''); setPassword(''); }}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                Change Role
              </button>
            </div>

            <button
              onClick={handleDevLogin}
              disabled={devLoading}
              className={`flex w-full justify-center items-center gap-3 py-2.5 px-4 text-sm font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg transition-all shadow-sm disabled:opacity-50`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                 <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                 <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                 <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                 <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              Continue with Google (Mock)
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500 font-medium tracking-wide">Or use Email</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={roleMode === 'USER' ? 'student@my.sliit.lk' : 'dev-admin@smartcampus.local'}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password..."
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <p className="text-xs text-slate-400 pt-1">Mock Password: {roleMode === 'USER' ? 'student123' : 'admin123'}</p>
              </div>
              <button
                type="submit"
                disabled={devLoading}
                className={`w-full py-2.5 px-4 text-sm font-medium ${PRIMARY_BUTTON_CLASS} shadow-sm disabled:opacity-50 mt-2`}
              >
                Sign In Securely
              </button>
            </form>
          </div>
        )}

        <Link to="/" className="mt-6 flex justify-center text-sm text-slate-500 hover:text-slate-800 transition-colors">
          &larr; Back to home
        </Link>
      </div>
    </div>
  )
}
