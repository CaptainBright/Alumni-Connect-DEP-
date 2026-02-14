import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import { normalizeUserType } from '../lib/authProfile'


export default function Register() {
  const [userType, setUserType] = useState('')
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
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const nav = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validateCommonFields = () => {
    if (!formData.fullName.trim()) return 'Full name is required'
    if (!userType) return 'Please select account type'
    if (!formData.graduationYear.trim()) return 'Graduation year is required'
    if (!formData.branch.trim()) return 'Branch is required'
    if (!formData.agreedToTerms) return 'You must agree to terms and conditions'
    return null
  }

  const onSubmit = async (e) => {
  e.preventDefault()
  setError(null)

  if (formData.password !== formData.confirmPassword) {
    setError('Passwords do not match')
    return
  }

  if (formData.password.length < 8) {
    setError('Password must be at least 8 characters')
    return
  }

  const validationError = validateCommonFields()
  if (validationError) {
    setError(validationError)
    return
  }

  setLoading(true)

  try {
    const normalizedType = normalizeUserType(userType)

    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        data: {
          full_name: formData.fullName.trim(),
          graduation_year: formData.graduationYear
          ? parseInt(formData.graduationYear)
          : null,

          branch: formData.branch?.trim() || null,
          company: formData.company?.trim() || null,
          linkedin: formData.linkedIn?.trim() || null,
          role: formData.role?.trim() || null,
          user_type: normalizedType
        }
      }
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    nav('/login', {
      state: {
        info: 'Registration submitted. Verify your email, then wait for admin approval.'
      }
    })

  } catch (err) {
    setError(err.message || 'Registration failed')
  } finally {
    setLoading(false)
  }
}

  const handleGoogleSignUp = async () => {
    const validationError = validateCommonFields()
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setOauthLoading(true)

    try {
      const pendingDraft = {
        fullName: formData.fullName.trim(),
        graduationYear: formData.graduationYear,
        branch: formData.branch?.trim(),
        company: formData.company?.trim(),
        linkedIn: formData.linkedIn?.trim(),
        role: formData.role?.trim(),
        userType: normalizeUserType(userType)
      }

      window.localStorage.setItem('pending_user_type', pendingDraft.userType)
      window.localStorage.setItem('pending_profile_draft', JSON.stringify(pendingDraft))

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard&flow=register`
        }
      })

      if (oauthError) {
        window.localStorage.removeItem('pending_user_type')
        window.localStorage.removeItem('pending_profile_draft')
        setError(oauthError.message)
        setOauthLoading(false)
      }
    } catch (err) {
      window.localStorage.removeItem('pending_user_type')
      window.localStorage.removeItem('pending_profile_draft')
      setError(err.message || 'Google sign-up failed')
      setOauthLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-blue-50 px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Join the Community</h2>
            <p className="text-gray-600">Create your account to connect with alumni worldwide</p>
            <p className="text-sm text-amber-700 mt-1">After registration, your profile goes to admin for approval.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Type *
              </label>
              <select
                required
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)]"
              >
                <option value="">Select account type</option>
                <option value="student">Student</option>
                <option value="alumni">Alumni</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)]"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="graduationYear"
                placeholder="Graduation year"
                value={formData.graduationYear}
                onChange={handleChange}
                className="px-4 py-2 border rounded-lg"
              />

              <input
                type="text"
                name="branch"
                placeholder="Branch"
                value={formData.branch}
                onChange={handleChange}
                className="px-4 py-2 border rounded-lg"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="company"
                placeholder="Company"
                value={formData.company}
                onChange={handleChange}
                className="px-4 py-2 border rounded-lg"
              />

              <input
                type="text"
                name="role"
                placeholder="Role"
                value={formData.role}
                onChange={handleChange}
                className="px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <input
                type="url"
                name="linkedIn"
                placeholder="LinkedIn URL"
                value={formData.linkedIn}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={handleChange}
                className="px-4 py-2 border rounded-lg"
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="px-4 py-2 border rounded-lg"
              />
            </div>

            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleChange}
              />
              <span className="text-sm text-gray-700">
                I agree to the Terms and Privacy Policy
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || oauthLoading}
              className="w-full py-2.5 bg-[var(--cardinal)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-500 uppercase tracking-wide">or</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading || oauthLoading}
            className="w-full py-2.5 border border-gray-300 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
          >
            {oauthLoading ? 'Redirecting to Google...' : 'Sign up with Google'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--cardinal)] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
