import React, { createContext, useEffect, useMemo, useState } from 'react'
import { loginUser, logoutUser, getCurrentUser } from '../api/authApi'
import { AuthContext } from './auth-context' // Ensure this exports the context object if it's separate, or we can export it here if it was defined here. 
// Assuming AuthContext is defined in 'auth-context.js' as per import.
// If 'auth-context.js' only creates the context, we use it.

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authStatus, setAuthStatus] = useState('loading') // 'loading', 'guest', 'pending', 'approved', 'admin'
  const [loading, setLoading] = useState(true)

  /* ---------------- HELPER: SET STATE FROM USER DATA ---------------- */
  const setSessionFromUser = (userData) => {
    if (!userData) {
      setUser(null)
      setAuthStatus('guest')
      return
    }

    setUser(userData)

    // Determine status based on role/profile
    // Server returns: { id, email, role }
    // We map this to our app's status
    const role = (userData.role || '').toLowerCase()
    const approvalStatus = (userData.approval_status || '').toUpperCase()

    if (role === 'admin') {
      setAuthStatus('admin')
    } else if (approvalStatus === 'PENDING') {
      setAuthStatus('pending')
    } else {
      setAuthStatus('approved')
    }
  }

  /* ---------------- ACTIONS ---------------- */

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await loginUser(email, password)
      const { user: userData } = response.data
      setSessionFromUser(userData)
      return { success: true, data: userData }
    } catch (error) {
      setSessionFromUser(null)
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      }
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = async (accessToken, refreshToken) => {
    setLoading(true)
    try {
      // 1. Send token to server
      // 2. Server sets cookie
      // 3. Server returns user data
      const response = await import('../api/authApi').then(mod => mod.loginWithSupabaseToken(accessToken, refreshToken))
      const { user: userData } = response.data
      setSessionFromUser(userData)
      return { success: true, data: userData }
    } catch (error) {
      console.error('Google Login error:', error)
      setSessionFromUser(null)
      return {
        success: false,
        error: error.response?.data?.message || 'Google Login failed'
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Logout error:', error)
    }
    setSessionFromUser(null)
  }

  const checkSession = async () => {
    setLoading(true)
    try {
      const response = await getCurrentUser()
      const { user: userData } = response.data
      setSessionFromUser(userData)
    } catch (error) {
      // 401 or 403 means not logged in
      setSessionFromUser(null)
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- INITIAL LOAD ---------------- */

  useEffect(() => {
    checkSession()
  }, [])

  const value = useMemo(() => ({
    user,
    authStatus,
    loading,
    login,
    googleLogin,
    logout,
    checkSession // Exposed for manual refresh if needed
  }), [user, authStatus, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

