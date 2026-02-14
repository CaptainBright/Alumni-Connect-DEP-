import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { ensureProfile, isProfileApproved } from '../lib/authProfile'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const nav = useNavigate()
  const location = useLocation()
  const infoMessage = location.state?.info

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      if (!data?.user) {
        setError('Login failed: user session not created.')
        return
      }

      const { data: profile, error: profileError } = await ensureProfile(data.user, {
        isApproved: false,
        approvalStatus: 'PENDING'
      })
      if (profileError) {
        setError(`Logged in but profile sync failed: ${profileError.message}`)
        return
      }

      if (!isProfileApproved(profile)) {
        await supabase.auth.signOut()
        if (profile?.approval_status === 'REJECTED') {
          const reason = profile?.admin_notes ? ` Reason: ${profile.admin_notes}` : ''
          setError(`Your profile was rejected by admin.${reason}`)
        } else {
          setError('Your profile is pending admin approval. Please try again after approval.')
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-blue-50 px-4">
      <div className="w-full max-w-2xl grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your Alumni Connect account</p>
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent"
                placeholder="you@stanford.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || oauthLoading}
              className="w-full py-2.5 bg-[var(--cardinal)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">or</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || oauthLoading}
            className="w-full py-2.5 border border-gray-300 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
          >
            {oauthLoading ? 'Redirecting to Google...' : 'Continue with Google'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">Don&apos;t have an account? <Link to="/register" className="text-[var(--cardinal)] font-semibold hover:underline">Create one</Link></p>
          </div>
        </div>

        <div className="hidden md:flex flex-col justify-center">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Alumni Connect</h3>
              <p className="text-gray-600 leading-relaxed">Connect with fellow Stanford alumni, discover career opportunities, and stay engaged with the community.</p>
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
