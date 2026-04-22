import React, { createContext, useEffect, useMemo, useState } from 'react'
import { loginUser, logoutUser, getCurrentUser } from '../api/authApi'
import { AuthContext } from './auth-context'
import { supabase } from '../lib/supabaseClient'

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
      // 1. Authenticate via backend API (sets httpOnly cookie)
      const response = await loginUser(email, password)
      const { user: userData } = response.data

      // 2. ALSO sign in on the frontend Supabase client so auth.uid() is
      //    available for RLS policies (connections, events, etc.)
      try {
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password
        })
      } catch (sbErr) {
        console.warn('Frontend Supabase sign-in failed (non-critical):', sbErr)
      }

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
    // Also sign out the frontend Supabase client
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.warn('Supabase signOut failed (non-critical):', err)
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
    checkSession
  }), [user, authStatus, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

