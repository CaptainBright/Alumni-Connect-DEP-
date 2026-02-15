import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [showOtpInput, setShowOtpInput] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const nav = useNavigate()

    // Base URL for backend - adjust if needed, assumes proxy or specific URL
    // Vite proxy might not be set up for this project structure, so let's check. 
    // Standard practice often `http://localhost:5000` or whatever server runs on.
    // Based on package.json, server runs on default logic? Usually 5000.
    // I will assume localhost:5000 for now, or use relative /api if proxy exists.
    // Previous analysis didn't show vite.config proxy.
    const API_URL = 'http://localhost:5001/api/auth'

    const handleSendOtp = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        try {
            const response = await axios.post(`${API_URL}/send-otp`, { email: email.trim() })

            setMessage('OTP sent to your email! Please check your inbox.')
            setShowOtpInput(true)
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const response = await axios.post(`${API_URL}/verify-otp`, {
                email: email.trim(),
                otp: otp.trim()
            })

            // We receive a resetToken from backend
            const { resetToken } = response.data

            if (resetToken) {
                // Pass email and token to reset password page
                nav('/reset-password', { state: { email: email.trim(), resetToken } })
            } else {
                throw new Error('Verification successful but no token received.')
            }

        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Verification failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-blue-50 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
                    <p className="text-gray-600">
                        {showOtpInput
                            ? 'Enter the 6-digit code sent to your email (Nodemailer)'
                            : 'Enter your email to receive a verification code'}
                    </p>
                </div>

                {message && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                {!showOtpInput ? (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent"
                                placeholder="you@stanford.edu"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-[var(--cardinal)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition"
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Verification Code</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent tracking-widest text-center text-xl"
                                placeholder="123456"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                maxLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-[var(--cardinal)] text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition"
                        >
                            {loading ? 'Verifying...' : 'Verify & Proceed'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowOtpInput(false)}
                            className="w-full text-sm text-center text-gray-500 hover:text-gray-700 underline mt-2"
                        >
                            Use a different email
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center pt-4 border-t border-gray-100">
                    <Link to="/login" className="text-gray-600 hover:text-[var(--cardinal)] text-sm font-medium inline-flex items-center gap-1">
                        <span>←</span> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
