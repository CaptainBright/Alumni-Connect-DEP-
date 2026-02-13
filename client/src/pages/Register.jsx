// client/src/pages/Register.jsx
import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [userType, setUserType] = useState('') // Student, Alumni, Admin
  const [step, setStep] = useState(1) // Step 1: Role selection, Step 2: Form
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    graduationYear: '',
    branch: '',
    company: '',
    linkedIn: '',
    role: '',
    agreedToTerms: false
  })
  const nav = useNavigate()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    if (!formData.fullName.trim()) {
      setError('Full name is required')
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    
    if (!formData.agreedToTerms) {
      setError('You must agree to terms and conditions')
      return
    }
    
    setLoading(true)

    try {
      console.log('Starting registration for:', formData.email)
      
      // 1) Create user via Supabase Auth
      const { user, error: signUpError } = await supabase.auth.signUp({
        email: formData.email, 
        password: formData.password
      })

      if (signUpError) {
        console.error('SignUp error details:', signUpError)
        // Check for rate limiting
        if (signUpError.message?.includes('429') || signUpError.message?.includes('Too Many')) {
          setError('Too many signup attempts. Please wait 60 seconds and try again with a different email.')
        } else {
          setError(`Sign up failed: ${signUpError.message}`)
        }
        setLoading(false)
        return
      }

      if (!user?.id) {
        setError('Failed to create user account - no ID returned')
        setLoading(false)
        return
      }

      const userId = user.id
      console.log('User created successfully with ID:', userId)

      // 2) Wait for session to be properly established
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 3) Sign in immediately to establish session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (signInError) {
        console.warn('Sign in after signup warning:', signInError)
        // Continue - profile insert might still work
      } else {
        console.log('User auto-signed in after registration')
      }

      // 4) Verify session exists before inserting profile
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session available:', !!session?.user)

      // 5) Insert profile data (with authenticated session)
      const profileData = {
        id: userId,
        full_name: formData.fullName.trim(),
        graduation_year: formData.graduationYear ? parseInt(formData.graduationYear) : null,
        branch: formData.branch?.trim() || null,
        company: formData.company?.trim() || null,
        linkedin: formData.linkedIn?.trim() || null,
        role: formData.role?.trim() || null,
        created_at: new Date().toISOString()
      }

      console.log('Inserting profile with data:', profileData)

      const { data: profileResponse, error: insertError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()

      if (insertError) {
        console.error('Profile insert error:', insertError)
        setError(`Failed to create profile: ${insertError.message}. Check Supabase RLS policies.`)
        setLoading(false)
        return
      }

      console.log('Profile inserted successfully:', profileResponse)

      // Success - redirect
      alert('✅ Registration successful! Check Supabase dashboard to verify your profile was created.')
      nav('/login')
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-blue-50 px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Join the Community</h2>
            <p className="text-gray-600">Create your account to connect with alumni worldwide</p>
          </div>
          
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
          
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
              <input 
                type="text"
                name="fullName"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent" 
                placeholder="First and last name" 
                value={formData.fullName} 
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
              <input 
                type="email"
                name="email"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent" 
                placeholder="you@example.com" 
                value={formData.email} 
                onChange={handleChange}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Graduation Year (Optional)</label>
                <select 
                  name="graduationYear"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent"
                  value={formData.graduationYear}
                  onChange={handleChange}
                >
                  <option value="">Select year...</option>
                  {Array.from({ length: 60 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Branch / Field (Optional)</label>
                <input 
                  type="text"
                  name="branch"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent" 
                  placeholder="e.g., Engineering, MBA, Arts" 
                  value={formData.branch} 
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company (Optional)</label>
                <input 
                  type="text"
                  name="company"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent" 
                  placeholder="Your company" 
                  value={formData.company} 
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role / Position (Optional)</label>
                <input 
                  type="text"
                  name="role"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent" 
                  placeholder="e.g., Product Manager" 
                  value={formData.role} 
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn Profile (Optional)</label>
              <input 
                type="url"
                name="linkedIn"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent" 
                placeholder="https://linkedin.com/in/yourprofile" 
                value={formData.linkedIn} 
                onChange={handleChange}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                <input 
                  type="password"
                  name="password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent" 
                  placeholder="Min 8 characters" 
                  value={formData.password} 
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                <input 
                  type="password"
                  name="confirmPassword"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent" 
                  placeholder="Re-enter password" 
                  value={formData.confirmPassword} 
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <label className="flex items-start gap-2">
              <input 
                type="checkbox" 
                name="agreedToTerms"
                required
                className="w-4 h-4 rounded mt-1" 
                checked={formData.agreedToTerms}
                onChange={handleChange}
              />
              <span className="text-sm text-gray-700">I agree to the Terms of Service and Privacy Policy</span>
            </label>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 bg-[var(--cardinal)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">Already have an account? <Link to="/login" className="text-[var(--cardinal)] font-semibold hover:underline">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
