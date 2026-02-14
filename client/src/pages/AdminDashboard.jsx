// client/src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

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
      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser()
      console.log("🔑 Logged in Admin UUID:", user?.id)


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

      // Fetch all profiles by status
      const { data: pending } = await supabase
        .from('profiles')
        .select('*')
        .eq('approval_status', 'PENDING')
        .order('created_at', { ascending: false })

      const { data: approved } = await supabase
        .from('profiles')
        .select('*')
        .eq('approval_status', 'APPROVED')
        .order('created_at', { ascending: false })

      const { data: rejected } = await supabase
        .from('profiles')
        .select('*')
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
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          approval_status: 'APPROVED',
          is_approved: true
        })
        .eq('id', profileId)

      if (error) throw error

      alert('✅ Profile approved!')
      fetchProfiles()
    } catch (err) {
      console.error('Error approving profile:', err)
      alert('❌ Failed to approve profile')
    }
  }

  const handleReject = async (profileId, notes = '') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          approval_status: 'REJECTED',
          is_approved: false,
          admin_notes: notes || 'Rejected by admin'
        })
        .eq('id', profileId)

      if (error) throw error

      alert('✅ Profile rejected!')
      setAdminNotes(prev => {
        const newNotes = { ...prev }
        delete newNotes[profileId]
        return newNotes
      })
      fetchProfiles()
    } catch (err) {
      console.error('Error rejecting profile:', err)
      alert('❌ Failed to reject profile')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    nav('/admin-login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    )
  }

  const ProfileCard = ({ profile, showActions = false, isPending = false }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{profile.full_name}</h3>
          <p className="text-sm text-gray-600">{profile.email}</p>
          <p className="text-xs text-gray-500 mt-1">
            ID: {profile.id.substring(0, 8)}...
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          profile.approval_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
          profile.approval_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {profile.approval_status}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-700 mb-4">
        <p><strong>Type:</strong> {profile.user_type}</p>
        {profile.graduation_year && <p><strong>Grad:</strong> {profile.graduation_year}</p>}
        {profile.branch && <p><strong>Branch:</strong> {profile.branch}</p>}
        {profile.company && <p><strong>Company:</strong> {profile.company}</p>}
        {profile.role && <p><strong>Role:</strong> {profile.role}</p>}
        {profile.admin_notes && <p><strong>Notes:</strong> {profile.admin_notes}</p>}
      </div>

      {showActions && isPending && (
        <div className="space-y-3 border-t border-gray-200 pt-4">
          <button
            onClick={() => handleApprove(profile.id)}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
          >
            ✅ Approve
          </button>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Reason for rejection (optional)"
              value={adminNotes[profile.id] || ''}
              onChange={(e) => setAdminNotes(prev => ({
                ...prev,
                [profile.id]: e.target.value
              }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              onClick={() => handleReject(profile.id, adminNotes[profile.id])}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
            >
              ❌ Reject
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Manage user approvals</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-semibold">Pending</p>
            <p className="text-4xl font-bold text-yellow-600 mt-2">{pendingProfiles.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-semibold">Approved</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{approvedProfiles.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-semibold">Rejected</p>
            <p className="text-4xl font-bold text-red-600 mt-2">{rejectedProfiles.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-semibold">Total Users</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">
              {pendingProfiles.length + approvedProfiles.length + rejectedProfiles.length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {['pending', 'approved', 'rejected'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold border-b-2 transition capitalize ${
                activeTab === tab
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab} ({tab === 'pending' ? pendingProfiles.length : tab === 'approved' ? approvedProfiles.length : rejectedProfiles.length})
            </button>
          ))}
        </div>

        {/* Profile List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeTab === 'pending' && pendingProfiles.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-600 text-lg">✅ No pending approvals!</p>
            </div>
          )}
          {activeTab === 'pending' && pendingProfiles.map(profile => (
            <ProfileCard key={profile.id} profile={profile} showActions={true} isPending={true} />
          ))}

          {activeTab === 'approved' && approvedProfiles.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-600 text-lg">No approved users yet</p>
            </div>
          )}
          {activeTab === 'approved' && approvedProfiles.map(profile => (
            <ProfileCard key={profile.id} profile={profile} showActions={false} />
          ))}

          {activeTab === 'rejected' && rejectedProfiles.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <p className="text-gray-600 text-lg">No rejected users</p>
            </div>
          )}
          {activeTab === 'rejected' && rejectedProfiles.map(profile => (
            <ProfileCard key={profile.id} profile={profile} showActions={false} />
          ))}
        </div>
      </div>
    </div>
  )
}
