// client/src/context/AuthContext.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { isAdminProfile, isProfileApproved } from '../lib/authProfile'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authStatus, setAuthStatus] = useState("guest") 
  const [loading, setLoading] = useState(true)

  // 🔥 Fetch profile and decide role
  const evaluateUser = async (session) => {
    if (!session?.user) {
      setAuthStatus("guest")
      setProfile(null)
      return
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("user_type, approval_status, is_approved")
      .eq("id", session.user.id)
      .single()

    if (error || !data) {
      setAuthStatus("guest")
      return
    }

    setProfile(data)

    if (!isProfileApproved(data)) {
      setAuthStatus("pending")
    } else if (isAdminProfile(data)) {
      setAuthStatus("admin")
    } else {
      setAuthStatus("approved")
    }
  }

  useEffect(() => {
    let mounted = true

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return

      const currentSession = data.session || null
      setSession(currentSession)
      setUser(currentSession?.user || null)

      await evaluateUser(currentSession)
      setLoading(false)
    }

    loadSession()

    const { data } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession || null)
      setUser(nextSession?.user || null)
      await evaluateUser(nextSession)
    })

    return () => {
      mounted = false
      data.subscription?.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setAuthStatus("guest")
    setProfile(null)
  }

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      authStatus,   // ⭐ main thing your app will use
      loading,
      signOut
    }),
    [session, user, profile, authStatus, loading]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
