import axios from 'axios'

const API_BASE = import.meta.env.VITE_SERVER_AUTH_URL || 'http://localhost:5001/api/auth'

const authClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: true // 🔥 VERY IMPORTANT
})

// ---------- SESSION AUTH ----------

export async function loginUser(email, password) {
  return authClient.post('/login', { email, password })
}

export async function logoutUser() {
  return authClient.post('/logout')
}

export async function getCurrentUser() {
  return authClient.get('/me')
}

// ---------- REGISTRATION ----------

export async function sendRegisterOtp(email) {
  return authClient.post('/send-register-otp', { email: email.trim() })
}

export async function verifyRegisterOtp(payload) {
  return authClient.post('/verify-register-otp', payload)
}

// ---------- PASSWORD RESET ----------

export async function sendResetOtp(email) {
  return authClient.post('/send-otp', { email: email.trim() })
}

export async function verifyResetOtp(email, otp) {
  return authClient.post('/verify-otp', { email: email.trim(), otp: otp.trim() })
}

export async function resetPassword(email, newPassword, resetToken) {
  return authClient.post('/reset-password', { email, newPassword, resetToken })
}
