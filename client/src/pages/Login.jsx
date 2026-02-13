import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      const { user, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (signInError) {
        setError(signInError.message)
        return
      }
      
      if (user) {
        nav('/dashboard')
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-blue-50 px-4">
      <div className="w-full max-w-2xl grid md:grid-cols-2 gap-8">
        {/* Form Side */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your Alumni Connect account</p>
          </div>
          
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          
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
            
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-gray-700">Remember me</span>
              </label>
              <a href="/forgot" className="text-[var(--cardinal)] hover:underline font-medium">Forgot password?</a>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 bg-[var(--cardinal)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">Don't have an account? <Link to="/register" className="text-[var(--cardinal)] font-semibold hover:underline">Create one</Link></p>
          </div>
        </div>
        
        {/* Info Side */}
        <div className="hidden md:flex flex-col justify-center">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Alumni Connect</h3>
              <p className="text-gray-600 leading-relaxed">Connect with fellow Stanford alumni, discover career opportunities, and stay engaged with the vibrant community.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-2xl">🤝</span>
                <div>
                  <p className="font-semibold text-gray-900">Network Globally</p>
                  <p className="text-sm text-gray-600">Connect with thousands of alumni worldwide</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <span className="text-2xl">💼</span>
                <div>
                  <p className="font-semibold text-gray-900">Career Growth</p>
                  <p className="text-sm text-gray-600">Access exclusive job opportunities and mentorship</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <span className="text-2xl">📚</span>
                <div>
                  <p className="font-semibold text-gray-900">Learn & Share</p>
                  <p className="text-sm text-gray-600">Participate in events and share knowledge</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
