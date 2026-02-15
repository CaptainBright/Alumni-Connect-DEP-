import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { ensureProfile, isAdminProfile, isProfileApproved, normalizeUserType } from '../lib/authProfile'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const nav = useNavigate()
  const location = useLocation()
  const infoMessage = location.state?.info
  const { authStatus, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ece9ef]">
        <div className="bg-white border border-slate-200 rounded-xl px-6 py-4 text-slate-600">Checking session...</div>
      </div>
    )
  }

  const goToCurrentSession = () => {
    if (authStatus === 'admin') nav('/admin')
    else if (authStatus === 'approved') nav('/dashboard')
    else if (authStatus === 'pending') nav('/pending-approval')
  }

  const switchAccount = async () => {
    await supabase.auth.signOut()
  }

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const signInPromise = supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Login timeout. Check connection and try again.')), 15000)
      )
      const { data, error: signInError } = await Promise.race([signInPromise, timeoutPromise])

      if (signInError) {
        setError(signInError.message)
        return
      }

      if (!data?.user) {
        setError('Login failed: user session not created.')
        return
      }

      const normalizedType = normalizeUserType(
        data.user?.user_metadata?.user_type || data.user?.user_metadata?.userType
      )
      const isAdminLogin = normalizedType === 'Admin'

      const { data: profile, error: profileError } = await ensureProfile(data.user, {
        userType: normalizedType,
        email: email.trim(),
        isApproved: isAdminLogin,
        approvalStatus: isAdminLogin ? 'APPROVED' : 'PENDING'
      })
      if (profileError) {
        setError(`Logged in but profile sync failed: ${profileError.message}`)
        return
      }

      if (isAdminProfile(profile)) {
        if (!isProfileApproved(profile)) {
          await supabase.auth.signOut()
          setError('Admin account is pending approval.')
          return
        }

        nav('/admin')
        return
      }

      if (!isProfileApproved(profile)) {
        if (profile?.approval_status === 'REJECTED') {
          await supabase.auth.signOut()
          const reason = profile?.admin_notes ? ` Reason: ${profile.admin_notes}` : ''
          setError(`Your profile was rejected by admin.${reason}`)
        } else {
          nav('/pending-approval')
        }
        return
      }

      nav('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setOauthLoading(true)

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard&flow=login`
        }
      })

      if (oauthError) {
        setError(oauthError.message)
        setOauthLoading(false)
      }
    } catch (err) {
      setError(err.message || 'Google sign-in failed')
      setOauthLoading(false)
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

          {authStatus !== 'guest' && (
            <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 text-sm">
              <p className="font-semibold">You are already logged in.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={goToCurrentSession} className="px-3 py-1 rounded border border-indigo-300 hover:bg-indigo-100">
                  Continue
                </button>
                <button onClick={switchAccount} className="px-3 py-1 rounded border border-indigo-300 hover:bg-indigo-100">
                  Switch account
                </button>
              </div>
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
              disabled={loading || oauthLoading}
              className="w-full py-2.5 bg-[var(--cardinal)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition shadow-sm"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">or</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || oauthLoading}
            className="w-full py-2.5 border border-slate-300 bg-white text-slate-800 font-semibold rounded-lg hover:bg-slate-50 disabled:opacity-50 transition"
          >
            {oauthLoading ? 'Redirecting to Google...' : 'Continue with Google'}
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
