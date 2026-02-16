import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'

const quickActions = [
  { title: 'Browse Directory', path: '/directory', desc: 'Find alumni by branch and batch.' },
  { title: 'Open Job Board', path: '/jobs', desc: 'Apply to internships and full-time roles.' },
  { title: 'Access Resources', path: '/resources', desc: 'Use career and learning resources.' },
  { title: 'Volunteer and Donate', path: '/donation', desc: 'Support IIT Ropar initiatives.' }
]

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const { user, authStatus } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      if (!user?.id) return

      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, user_type, approval_status, branch, graduation_year, company')
        .eq('id', user.id)
        .maybeSingle()

      if (!mounted) return
      setProfile(data || null)
      setLoadingProfile(false)
    }

    loadProfile()
    return () => {
      mounted = false
    }
  }, [user?.id])



  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
      <section className="bg-white rounded-2xl border border-slate-200 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <p className="text-sm uppercase tracking-wide text-[var(--cardinal)] font-semibold">Member Dashboard</p>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              Welcome, {loadingProfile ? 'Member' : (profile?.full_name || 'Member')}
            </h1>
            <p className="mt-2 text-slate-600">
              Access opportunities, resources, and your alumni network.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Email</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{profile?.email || user?.email || '-'}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Role</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{profile?.user_type || authStatus}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Approval</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{profile?.approval_status || '-'}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500">Branch</p>
          <p className="text-sm font-semibold text-slate-900 mt-1">{profile?.branch || '-'}</p>
        </div>
      </section>

      <section className="mt-6 bg-white rounded-2xl border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900">Quick Actions</h2>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              onClick={() => nav(action.path)}
              className="text-left border border-slate-200 rounded-xl p-4 hover:border-[var(--cardinal)] hover:bg-red-50 transition-all"
            >
              <p className="font-semibold text-slate-900">{action.title}</p>
              <p className="text-sm text-slate-600 mt-1">{action.desc}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
