import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const nav = useNavigate()
  const location = useLocation()
  const infoMessage = location.state?.info
  const { authStatus, loading: globalAuthLoading, login } = useAuth()

  // Redirect if already logged in
  React.useEffect(() => {
    if (!globalAuthLoading && authStatus !== 'guest' && authStatus !== 'loading') {
      if (authStatus === 'admin') nav('/admin')
      else if (authStatus === 'approved') nav('/dashboard')
      else if (authStatus === 'pending') nav('/pending-approval')
    }
  }, [authStatus, globalAuthLoading, nav])

  if (globalAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ece9ef]">
        <div className="bg-white border border-slate-200 rounded-xl px-6 py-4 text-slate-600">Checking session...</div>
      </div>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setFormLoading(true)

    try {
      const result = await login(email, password)

      if (!result.success) {
        setError(result.error)
        setFormLoading(false)
        return
      }

      // Success handled by useEffect redirect
    } catch (err) {
      setError('An unexpected error occurred')
      setFormLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ece9ef] px-4 py-10">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8">
        <div className="bg-white/95 p-8 rounded-2xl shadow-lg border border-slate-200">
          <div className="mb-8">
            <h2 className="text-5xl font-bold text-slate-900 hero-title mb-2">Welcome Back</h2>
            <p className="text-slate-600 text-lg">Sign in to your Alumni Connect account</p>
          </div>

          {infoMessage && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              {infoMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent"
                placeholder="you@iitrpr.ac.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-sm text-[var(--cardinal)] hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-2.5 bg-[var(--cardinal)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition shadow-sm"
            >
              {formLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">or</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <button
            type="button"
            onClick={async () => {
              // This triggers standard Supabase OAuth redirect.
              // We don't need to change this, just ensure the redirect URL points to AuthCallback
              // which we just updated.
              const { error } = await import('../lib/supabaseClient').then(m => m.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
                }
              }))
              if (error) console.error(error)
            }}
            className="w-full py-2.5 border border-slate-300 bg-white text-slate-800 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 transition"
          >
            Continue with Google
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">Don&apos;t have an account? <Link to="/register" className="text-[var(--cardinal)] font-semibold hover:underline">Create one</Link></p>
            <p className="text-gray-600 text-sm mt-2">
              Admin? <Link to="/admin-login" className="text-[var(--cardinal)] font-semibold hover:underline">Use admin login</Link>
            </p>
          </div>
        </div>

        <div className="hidden md:flex flex-col justify-center bg-white/70 border border-slate-200 rounded-2xl p-8 float-soft">
          <div className="space-y-6">
            <div>
              <h3 className="text-4xl font-bold hero-title text-slate-900 mb-2">Alumni Connect</h3>
              <p className="text-slate-700 leading-relaxed text-lg">
                Connect with fellow IIT Ropar alumni, discover career opportunities, and stay engaged with the community.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div>
                  <p className="font-semibold text-gray-900">Network globally</p>
                  <p className="text-sm text-gray-600">Connect with alumni worldwide</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div>
                  <p className="font-semibold text-gray-900">Career growth</p>
                  <p className="text-sm text-gray-600">Access jobs and mentorship</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div>
                  <p className="font-semibold text-gray-900">Learn and share</p>
                  <p className="text-sm text-gray-600">Participate in events and knowledge sharing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
