import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AdminDashboard() {
  const [pendingProfiles, setPendingProfiles] = useState([])
  const [approvedProfiles, setApprovedProfiles] = useState([])
  const [rejectedProfiles, setRejectedProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [adminNotes, setAdminNotes] = useState({})
  const nav = useNavigate()

  const fetchProfiles = useCallback(async () => {
    try {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user

      if (!user?.id) {
        nav('/admin-login')
        return
      }

      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()

      if (adminProfile?.user_type !== 'Admin') {
        nav('/login')
        return
      }

      const baseQuery = supabase.from('profiles').select('*').in('user_type', ['Student', 'Alumni'])

      const { data: pending } = await baseQuery
        .eq('approval_status', 'PENDING')
        .order('created_at', { ascending: false })

      const { data: approved } = await supabase
        .from('profiles')
        .select('*')
        .in('user_type', ['Student', 'Alumni'])
        .eq('approval_status', 'APPROVED')
        .order('created_at', { ascending: false })

      const { data: rejected } = await supabase
        .from('profiles')
        .select('*')
        .in('user_type', ['Student', 'Alumni'])
        .eq('approval_status', 'REJECTED')
        .order('created_at', { ascending: false })

      setPendingProfiles(pending || [])
      setApprovedProfiles(approved || [])
      setRejectedProfiles(rejected || [])
      setLoading(false)
    } catch (err) {
      console.error('Error fetching profiles:', err)
      setLoading(false)
    }
  }, [nav])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const handleApprove = async (profileId) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        approval_status: 'APPROVED',
        is_approved: true,
        admin_notes: null
      })
      .eq('id', profileId)

    if (error) {
      alert('Failed to approve profile.')
      return
    }

    fetchProfiles()
  }

  const handleReject = async (profileId, notes = '') => {
    const { error } = await supabase
      .from('profiles')
      .update({
        approval_status: 'REJECTED',
        is_approved: false,
        admin_notes: notes || 'Rejected by admin'
      })
      .eq('id', profileId)

    if (error) {
      alert('Failed to reject profile.')
      return
    }

    setAdminNotes((prev) => {
      const newState = { ...prev }
      delete newState[profileId]
      return newState
    })
    fetchProfiles()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    nav('/admin-login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading admin dashboard...</p>
      </div>
    )
  }

  const list =
    activeTab === 'pending'
      ? pendingProfiles
      : activeTab === 'approved'
        ? approvedProfiles
        : rejectedProfiles

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase text-[var(--cardinal)] tracking-wide font-semibold">Admin Console</p>
            <h1 className="text-2xl font-bold text-slate-900">Approval Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-[var(--cardinal)] text-white rounded-lg hover:opacity-90 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Pending" value={pendingProfiles.length} color="text-amber-600" />
          <StatCard label="Approved" value={approvedProfiles.length} color="text-emerald-600" />
          <StatCard label="Rejected" value={rejectedProfiles.length} color="text-rose-600" />
          <StatCard label="Total Reviewed" value={approvedProfiles.length + rejectedProfiles.length} color="text-indigo-600" />
        </section>

        <section className="mt-6 bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 border-b border-slate-200 p-3">
            {['pending', 'approved', 'rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg capitalize font-medium transition ${
                  activeTab === tab
                    ? 'bg-[var(--cardinal)] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {list.length === 0 ? (
              <div className="col-span-2 text-center py-10 text-slate-500">No profiles in this section.</div>
            ) : (
              list.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  isPending={activeTab === 'pending'}
                  noteValue={adminNotes[profile.id] || ''}
                  onNoteChange={(value) =>
                    setAdminNotes((prev) => ({ ...prev, [profile.id]: value }))
                  }
                  onApprove={() => handleApprove(profile.id)}
                  onReject={() => handleReject(profile.id, adminNotes[profile.id] || '')}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  )
}

function ProfileCard({ profile, isPending, noteValue, onNoteChange, onApprove, onReject }) {
  return (
    <article className="rounded-xl border border-slate-200 p-5 bg-white hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{profile.full_name || 'Unnamed'}</h3>
          <p className="text-sm text-slate-600">{profile.email || 'No email'}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
          profile.approval_status === 'APPROVED'
            ? 'bg-emerald-100 text-emerald-700'
            : profile.approval_status === 'REJECTED'
              ? 'bg-rose-100 text-rose-700'
              : 'bg-amber-100 text-amber-700'
        }`}>
          {profile.approval_status}
        </span>
      </div>

      <div className="mt-3 text-sm text-slate-700 space-y-1">
        <p><strong>Type:</strong> {profile.user_type}</p>
        {profile.graduation_year && <p><strong>Graduation:</strong> {profile.graduation_year}</p>}
        {profile.branch && <p><strong>Branch:</strong> {profile.branch}</p>}
        {profile.company && <p><strong>Company:</strong> {profile.company}</p>}
        {profile.role && <p><strong>Role:</strong> {profile.role}</p>}
        {profile.admin_notes && <p><strong>Admin Note:</strong> {profile.admin_notes}</p>}
      </div>

      {isPending && (
        <div className="mt-4 border-t border-slate-200 pt-4 space-y-3">
          <button
            onClick={onApprove}
            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Approve
          </button>
          <div className="flex gap-2">
            <input
              type="text"
              value={noteValue}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <button
              onClick={onReject}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
