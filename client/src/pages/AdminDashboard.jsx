import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchProfiles, approveProfile, rejectProfile, exportUsersExcel } from '../api/adminApi'
import AdminBroadcastPanel from '../components/admin/AdminBroadcastPanel'
import {
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  ClipboardList,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  Megaphone,
  RefreshCw,
  LogOut,
  Building,
  GraduationCap,
  Briefcase,
  AlertTriangle
} from 'lucide-react'

export default function AdminDashboard() {
  const [pendingProfiles, setPendingProfiles] = useState([])
  const [approvedProfiles, setApprovedProfiles] = useState([])
  const [rejectedProfiles, setRejectedProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [mainTab, setMainTab] = useState('approvals')
  const [activeTab, setActiveTab] = useState('pending')
  const [adminNotes, setAdminNotes] = useState({})

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
      setError(err.toString())
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

  const uniqueYears = useMemo(() => {
    const years = approvedProfiles.map(p => p.graduation_year).filter(Boolean)
    return [...new Set(years)].sort((a, b) => b - a)
  }, [approvedProfiles])

  const uniqueBranches = useMemo(() => {
    const branches = approvedProfiles.map(p => p.branch).filter(Boolean)
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--cardinal)]" />
          <p className="text-sm font-medium text-slate-500">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-lg text-center shadow-sm">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Failed to load data</h2>
          <p className="text-sm text-slate-600 mb-2">{error}</p>
          <p className="text-xs text-slate-400 mb-6">Make sure your backend API is accessible and VITE_SERVER_URL is configured correctly.</p>
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 mx-auto px-5 py-2 bg-[var(--cardinal)] text-white rounded-xl hover:bg-red-800 transition font-semibold">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    )
  }

  const list =
    activeTab === 'pending'
      ? pendingProfiles
      : activeTab === 'approved'
        ? approvedProfiles
        : rejectedProfiles

  const tabConfig = [
    { key: 'pending', label: 'Pending', count: pendingProfiles.length, icon: ClipboardList, color: 'text-amber-600' },
    { key: 'approved', label: 'Approved', count: approvedProfiles.length, icon: UserCheck, color: 'text-emerald-600' },
    { key: 'rejected', label: 'Rejected', count: rejectedProfiles.length, icon: UserX, color: 'text-rose-600' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--cardinal)] to-red-800 flex items-center justify-center shadow-lg shadow-red-200/40">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--cardinal)] tracking-widest font-bold">Admin Console</p>
              <h1 className="text-xl font-bold text-slate-900">Approval Dashboard</h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-semibold text-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Main Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8">
          <button 
            onClick={() => setMainTab('approvals')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              mainTab === 'approvals' 
                ? 'bg-[var(--cardinal)] text-white shadow-md shadow-red-200/40' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" /> User Approvals
          </button>
          <button 
            onClick={() => setMainTab('broadcasts')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              mainTab === 'broadcasts' 
                ? 'bg-[var(--cardinal)] text-white shadow-md shadow-red-200/40' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Megaphone className="w-4 h-4" /> Broadcast Messaging
          </button>
        </div>

        {mainTab === 'approvals' ? (
          <>
            {/* Stat Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Pending" value={pendingProfiles.length} icon={ClipboardList} color="text-amber-600" bg="bg-amber-50" />
              <StatCard label="Approved" value={approvedProfiles.length} icon={UserCheck} color="text-emerald-600" bg="bg-emerald-50" />
              <StatCard label="Rejected" value={rejectedProfiles.length} icon={UserX} color="text-rose-600" bg="bg-rose-50" />
              <StatCard label="Total Reviewed" value={approvedProfiles.length + rejectedProfiles.length} icon={Users} color="text-indigo-600" bg="bg-indigo-50" />
            </section>

            {/* Export Section */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Download className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">Export User Data</h2>
              </div>
              <p className="text-sm text-slate-500 mb-5">
                Download approved user profiles as an Excel spreadsheet. Use the filters to narrow results.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">User Type</label>
                  <select
                    id="export-user-type"
                    value={exportUserType}
                    onChange={(e) => setExportUserType(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)]"
                  >
                    <option value="">All Users</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Student">Student</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Graduation Year</label>
                  <select
                    id="export-graduation-year"
                    value={exportYear}
                    onChange={(e) => setExportYear(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)]"
                  >
                    <option value="">All Years</option>
                    {uniqueYears.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Branch</label>
                  <select
                    id="export-branch"
                    value={exportBranch}
                    onChange={(e) => setExportBranch(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)]"
                  >
                    <option value="">All Branches</option>
                    {uniqueBranches.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <button
                    id="export-download-btn"
                    onClick={handleExport}
                    disabled={exporting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
                  >
                    {exporting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Exporting...</>
                    ) : (
                      <><Download className="w-4 h-4" /> Download Excel</>
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* Profiles Table */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 p-4 border-b border-slate-200 bg-slate-50/50">
                {tabConfig.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg capitalize font-semibold text-sm transition-all ${
                        activeTab === tab.key
                          ? 'bg-[var(--cardinal)] text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                        activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.length === 0 ? (
                  <div className="col-span-2 text-center py-12">
                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No profiles in this section.</p>
                  </div>
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
          </>
        ) : (
          <AdminBroadcastPanel uniqueYears={uniqueYears} uniqueBranches={uniqueBranches} />
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${color}`} />
        </div>
      </div>
      <p className={`text-3xl font-black mt-2 ${color}`}>{value}</p>
    </div>
  )
}

function ProfileCard({ profile, isPending, noteValue, onNoteChange, onApprove, onReject }) {
  return (
    <article className="rounded-2xl border border-slate-200 p-5 bg-white hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
            {(profile.full_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{profile.full_name || 'Unnamed'}</h3>
            <p className="text-xs text-slate-500">{profile.email || 'No email'}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider rounded-full font-bold ${
          profile.approval_status === 'APPROVED'
            ? 'bg-emerald-100 text-emerald-700'
            : profile.approval_status === 'REJECTED'
              ? 'bg-rose-100 text-rose-700'
              : 'bg-amber-100 text-amber-700'
        }`}>
          {profile.approval_status}
        </span>
      </div>

      <div className="mt-4 space-y-1.5 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span><strong>Type:</strong> {profile.user_type}</span>
        </div>
        {profile.graduation_year && (
          <div className="flex items-center gap-2">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            <span><strong>Graduation:</strong> {profile.graduation_year}</span>
          </div>
        )}
        {profile.branch && (
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span><strong>Branch:</strong> {profile.branch}</span>
          </div>
        )}
        {profile.company && (
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span><strong>Company:</strong> {profile.company}</span>
          </div>
        )}
        {profile.role && (
          <p><strong>Role:</strong> {profile.role}</p>
        )}
        {profile.admin_notes && (
          <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-lg mt-2">
            <strong>Admin Note:</strong> {profile.admin_notes}
          </p>
        )}
      </div>

      {isPending && (
        <div className="mt-4 border-t border-slate-100 pt-4 space-y-3">
          <button
            onClick={onApprove}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-semibold text-sm shadow-sm"
          >
            <CheckCircle className="w-4 h-4" /> Approve
          </button>
          <div className="flex gap-2">
            <input
              type="text"
              value={noteValue}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="flex-1 px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            <button
              onClick={onReject}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition font-semibold text-sm shadow-sm"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
