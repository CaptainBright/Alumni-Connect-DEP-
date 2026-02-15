import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  ensureProfile,
  isAdminProfile,
  isProfileApproved,
  normalizeUserType
} from '../lib/authProfile'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authStatus, setAuthStatus] = useState('guest')
  const [loading, setLoading] = useState(true)

  /* ---------------- PROFILE STATUS SETTER ---------------- */

  const setAuthFromProfile = (profileData) => {
    setProfile(profileData)

    if (!isProfileApproved(profileData)) {
      setAuthStatus('pending')
    } else if (isAdminProfile(profileData)) {
      setAuthStatus('admin')
    } else {
      setAuthStatus('approved')
    }
  }

  /* ---------------- USER EVALUATION ---------------- */

  const evaluateUser = async (currentSession) => {
    if (!currentSession?.user) {
      setProfile(null)
      setAuthStatus('guest')
      return
    }

    const authUser = currentSession.user

    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      if (error) {
        console.error('Profile fetch error:', error.message)
      }

      if (profileData) {
        setAuthFromProfile(profileData)
        return
      }

      /* If no profile found → create one */
      const normalizedType = normalizeUserType(
        authUser.user_metadata?.user_type ||
        authUser.user_metadata?.userType
      )

      const isAdmin = normalizedType === 'Admin'

      const { data: ensuredProfile, error: ensureError } =
        await ensureProfile(authUser, {
          userType: normalizedType,
          email: authUser.email || null,
          isApproved: isAdmin,
          approvalStatus: isAdmin ? 'APPROVED' : 'PENDING'
        })

      if (ensureError) {
        console.error('Error ensuring profile:', ensureError.message)
        setAuthStatus('pending')
        return
      }

      if (ensuredProfile) {
        setAuthFromProfile(ensuredProfile)
      }

    } catch (err) {
      console.error('Unexpected evaluateUser error:', err.message)
      setAuthStatus('pending')
    }
  }

  /* ---------------- INITIAL SESSION LOAD ---------------- */

  useEffect(() => {
  let mounted = true
  const activeUserRef = { current: null }

  const initialize = async () => {
    const { data } = await supabase.auth.getSession()
    const currentSession = data?.session || null

    if (!mounted) return

    setSession(currentSession)
    setUser(currentSession?.user || null)

    activeUserRef.current = currentSession?.user?.id || null

    if (currentSession?.user) {
      await evaluateUser(currentSession)
    } else {
      setProfile(null)
      setAuthStatus('guest')
    }

    setLoading(false)
  }

  initialize()

  const { data: listener } = supabase.auth.onAuthStateChange(
    async (event, nextSession) => {
      if (!mounted) return

      const nextUserId = nextSession?.user?.id || null

      // 🚫 Ignore INITIAL_SESSION (already handled in initialize)
      if (event === 'INITIAL_SESSION') return

      // 🚫 Ignore duplicate SIGNED_IN only if profile already loaded
      if (
        event === 'SIGNED_IN' &&
        activeUserRef.current === nextUserId &&
        profile !== null
      ) {
        return
      }

      activeUserRef.current = nextUserId

      setSession(nextSession || null)
      setUser(nextSession?.user || null)

      if (nextSession?.user) {
        await evaluateUser(nextSession)
      } else {
        setProfile(null)
        setAuthStatus('guest')
      }
    }
  )

  return () => {
    mounted = false
    listener?.subscription?.unsubscribe()
  }
}, [])




  /* ---------------- SIGN OUT ---------------- */

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setProfile(null)
    setAuthStatus('guest')
  }

  const value = useMemo(() => ({
    session,
    user,
    profile,
    authStatus,
    loading,
    signOut
  }), [session, user, profile, authStatus, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
