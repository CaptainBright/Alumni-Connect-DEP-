// client/src/pages/AdminLogin.jsx
import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Sign in
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        setError(`Login failed: ${signInError.message}`)
        setLoading(false)
        return
      }

      if (!user?.id) {
        setError('Login failed - no user returned')
        setLoading(false)
        return
      }

      // Check if user is Admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type, approval_status')
        .eq('id', user.id)
        .single()

      if (profileError) {
        setError('Failed to fetch profile')
        setLoading(false)
        return
      }

      if (profile.user_type !== 'Admin') {
        setError('❌ Admin access denied. This account is not registered as an admin.')
        
        // Sign out non-admin user
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      if (profile.approval_status !== 'APPROVED') {
        setError('❌ Admin account pending approval. Contact super admin.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      // Success - go to admin dashboard
      alert('✅ Logged in as Admin!')
      nav('/admin')
    } catch (err) {
      console.error('Admin login error:', err)
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-blue-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-600 mt-2">Access the Management Dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
            >
              {loading ? 'Logging in...' : 'Admin Login'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>Not an admin? <Link to="/login" className="text-red-600 font-semibold hover:underline">User Login</Link></p>
            <p className="mt-3">New account? <Link to="/register" className="text-red-600 font-semibold hover:underline">Register here</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
