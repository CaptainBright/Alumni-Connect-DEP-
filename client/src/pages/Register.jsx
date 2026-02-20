import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { normalizeUserType } from '../lib/authProfile'
import { sendRegisterOtp, verifyRegisterOtp } from '../api/authApi'

const roleCards = [
  {
    value: 'student',
    title: 'Student',
    description: 'Current IIT Ropar student account'
  },
  {
    value: 'alumni',
    title: 'Alumni',
    description: 'Graduated alumni account'
  },
  {
    value: 'admin',
    title: 'Admin',
    description: 'Portal management account'
  }
]

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

  // OTP States
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

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
    if (!formData.email.trim()) return 'Email is required'
    if (userType !== 'admin' && !formData.graduationYear.trim()) return 'Graduation year is required'
    if (userType !== 'admin' && !formData.branch.trim()) return 'Branch is required'
    if (!formData.agreedToTerms) return 'You must agree to terms and conditions'
    return null
  }

  // Step 1: Send OTP
  const handleRegister = async (e) => {
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
      // Call backend to send OTP
      await sendRegisterOtp(formData.email)

      setOtpSent(true)
      // Optional: show success message?
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP and Create Account
  const handleVerify = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const normalizedType = normalizeUserType(userType)

      const payload = {
        email: formData.email.trim(),
        otp: otp.trim(),
        password: formData.password,
        userData: {
          fullName: formData.fullName.trim(),
          graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : null,
          branch: formData.branch?.trim(),
          company: formData.company?.trim(),
          linkedIn: formData.linkedIn?.trim(),
          role: formData.role?.trim(),
          userType: normalizedType
        }
      }

      await verifyRegisterOtp(payload)

      // Success
      if (normalizedType === 'Admin') {
        nav('/admin-login', {
          state: {
            info: 'Admin account created successfully. Please login.'
          }
        })
      } else {
        nav('/login', {
          state: {
            info: 'Account created successfully. Your profile is pending admin approval.'
          }
        })
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Verification failed')
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

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {!otpSent ? (
            /* REGISTRATION FORM */
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Type *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {roleCards.map((role) => (
                    <button
                      type="button"
                      key={role.value}
                      onClick={() => setUserType(role.value)}
                      className={`text-left rounded-lg border p-3 transition ${
                        userType === role.value
                          ? 'border-[var(--cardinal)] bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img src="/hero.jpg" alt={role.title} className="w-full h-16 rounded-md object-cover mb-2" />
                      <p className="font-semibold text-gray-900">{role.title}</p>
                      <p className="text-xs text-gray-600">{role.description}</p>
                    </button>
                  ))}
                </div>
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

              {userType !== 'admin' && (
                <>
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
                </>
              )}

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
                disabled={loading}
                className="w-full py-2.5 bg-[var(--cardinal)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition"
              >
                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
              </button>
            </form>
          ) : (
            /* OTP VERIFICATION FORM */
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="text-center mb-6">
                <p className="text-gray-600">
                  We sent a a verification code to <strong>{formData.email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code</label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] tracking-widest text-center text-xl"
                  placeholder="123456"
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[var(--cardinal)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition"
              >
                {loading ? 'Creating Account...' : 'Verify & Create Account'}
              </button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Back to details
              </button>
            </form>
          )}

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
