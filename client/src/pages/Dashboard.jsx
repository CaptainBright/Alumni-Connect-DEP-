import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const { user } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      if (!user?.id) return

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, user_type, approval_status')
        .eq('id', user.id)
        .maybeSingle()

      if (!mounted) return

      if (error) {
        setProfile(null)
      } else {
        setProfile(data || null)
      }

      setLoadingProfile(false)
    }

    loadProfile()
    return () => {
      mounted = false
    }
  }, [user?.id])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    nav('/login')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">You are signed in with Supabase Auth.</p>

        <div className="mt-8 grid sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-lg border bg-gray-50">
            <p className="text-gray-500">Name</p>
            <p className="font-semibold text-gray-900">
              {loadingProfile ? 'Loading...' : (profile?.full_name || user?.user_metadata?.full_name || 'Not set')}
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-gray-50">
            <p className="text-gray-500">Email</p>
            <p className="font-semibold text-gray-900">{user?.email || profile?.email || 'Not set'}</p>
          </div>

          <div className="p-4 rounded-lg border bg-gray-50">
            <p className="text-gray-500">User Type</p>
            <p className="font-semibold text-gray-900">
              {loadingProfile ? 'Loading...' : (profile?.user_type || 'Alumni')}
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-gray-50">
            <p className="text-gray-500">Approval Status</p>
            <p className="font-semibold text-gray-900">
              {loadingProfile ? 'Loading...' : (profile?.approval_status || 'APPROVED')}
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => nav('/directory')}
            className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Open Directory
          </button>
          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded-lg bg-[var(--cardinal)] text-white hover:opacity-90"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
