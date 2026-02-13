// client/src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = supabase.auth.session()
    setUser(session?.user ?? null)
    setLoading(false)

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener?.unsubscribe()
    }
  }, [])

  const signIn = (opts) => supabase.auth.signIn(opts)
  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
