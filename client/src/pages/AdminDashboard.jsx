import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchProfiles, approveProfile, rejectProfile, exportUsersExcel } from '../api/adminApi'

export default function AdminDashboard() {
  const [pendingProfiles, setPendingProfiles] = useState([])
  const [approvedProfiles, setApprovedProfiles] = useState([])
  const [rejectedProfiles, setRejectedProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [adminNotes, setAdminNotes] = useState({})

  // Export filter state
  const [exportUserType, setExportUserType] = useState('')
  const [exportYear, setExportYear] = useState('')
  const [exportBranch, setExportBranch] = useState('')
  const [exporting, setExporting] = useState(false)

  const nav = useNavigate()
  const { user, authStatus, loading: authLoading, logout } = useAuth()

  const loadProfiles = useCallback(async () => {
    try {
      const data = await fetchProfiles()

      setPendingProfiles(data.profiles.filter(p => p.approval_status === 'PENDING'))
      setApprovedProfiles(data.profiles.filter(p => p.approval_status === 'APPROVED'))
      setRejectedProfiles(data.profiles.filter(p => p.approval_status === 'REJECTED'))

      setLoading(false)
    } catch (err) {
      console.error('Error fetching profiles:', err)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) {
      if (authStatus !== 'admin') {
        nav('/login')
        return
      }
      loadProfiles()
    }
  }, [authStatus, authLoading, nav, loadProfiles])

  // Compute unique years and branches from approved profiles for filter dropdowns
  const uniqueYears = useMemo(() => {
    const years = approvedProfiles
      .map(p => p.graduation_year)
      .filter(Boolean)
    return [...new Set(years)].sort((a, b) => b - a)
  }, [approvedProfiles])

  const uniqueBranches = useMemo(() => {
    const branches = approvedProfiles
      .map(p => p.branch)
      .filter(Boolean)
    return [...new Set(branches)].sort()
  }, [approvedProfiles])

  const handleApprove = async (profileId) => {
    try {
      await approveProfile(profileId)
      loadProfiles()
    } catch (err) {
      alert(err)
    }
  }

  const handleReject = async (profileId, notes = '') => {
    try {
      await rejectProfile(profileId, notes)
      setAdminNotes((prev) => {
        const newState = { ...prev }
        delete newState[profileId]
        return newState
      })
      loadProfiles()
    } catch (err) {
      alert(err)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const filters = {}
      if (exportUserType) filters.user_type = exportUserType
      if (exportYear) filters.graduation_year = exportYear
      if (exportBranch) filters.branch = exportBranch
      await exportUsersExcel(filters)
    } catch (err) {
      alert(err)
    } finally {
      setExporting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    nav('/login')
  }

  if (loading || authLoading) {
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

        {/* ──── Export Section ──── */}
        <section className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Export User Data</h2>
          <p className="text-sm text-slate-500 mb-4">
            Download approved user profiles as an Excel spreadsheet. Use the filters below to narrow down the data.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            {/* User Type Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">User Type</label>
              <select
                id="export-user-type"
                value={exportUserType}
                onChange={(e) => setExportUserType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)]"
              >
                <option value="">All Users</option>
                <option value="Alumni">Alumni</option>
                <option value="Student">Student</option>
              </select>
            </div>

            {/* Graduation Year Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Graduation Year</label>
              <select
                id="export-graduation-year"
                value={exportYear}
                onChange={(e) => setExportYear(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)]"
              >
                <option value="">All Years</option>
                {uniqueYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Branch Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Branch</label>
              <select
                id="export-branch"
                value={exportBranch}
                onChange={(e) => setExportBranch(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)]"
              >
                <option value="">All Branches</option>
                {uniqueBranches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Download Button */}
            <div>
              <button
                id="export-download-btn"
                onClick={handleExport}
                disabled={exporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {exporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Exporting…
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ──── Profiles Table ──── */}
        <section className="mt-6 bg-white rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 border-b border-slate-200 p-3">
            {['pending', 'approved', 'rejected'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg capitalize font-medium transition ${activeTab === tab
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
        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${profile.approval_status === 'APPROVED'
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
