import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { uploadAvatar } from '../lib/upload'
import {
  Briefcase,
  Users,
  BookOpen,
  HeartHandshake,
  CheckCircle2,
  Clock,
  Calendar,
  Bell,
  Sparkles,
  MapPin,
  ChevronRight,
  TrendingUp,
  Award,
  Camera,
  Loader2
} from 'lucide-react'

// Mock Data
const quickActions = [
  { title: 'Browse Directory', path: '/directory', desc: 'Find alumni by branch and batch.', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Open Job Board', path: '/jobs', desc: 'Apply to internships and full-time roles.', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
  { title: 'Access Resources', path: '/resources', desc: 'Use career and learning resources.', icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50' },
  { title: 'Volunteer and Donate', path: '/donation', desc: 'Support IIT Ropar initiatives.', icon: HeartHandshake, color: 'text-green-600', bg: 'bg-green-50' }
]

const upcomingEvents = [
  { id: 1, title: 'Annual Alumni Meet 2026', date: 'March 15, 2026', location: 'New Delhi', type: 'Networking' },
  { id: 2, title: 'Tech Career Fair', date: 'April 2, 2026', location: 'Virtual', type: 'Careers' }
]

const recommendedConnections = [
  { id: 1, name: 'Priya Sharma', role: 'SDE-2 at Google', branch: 'CSE', year: '2020', image: 'https://i.pravatar.cc/150?img=47' },
  { id: 2, name: 'Rahul Verma', role: 'Product Manager at Microsoft', branch: 'EE', year: '2019', image: 'https://i.pravatar.cc/150?img=11' },
]

const featuredJobs = [
  { id: 1, title: 'Frontend Engineer', company: 'TechCorp', type: 'Full-time', location: 'Bangalore' },
  { id: 2, title: 'Data Science Intern', company: 'Analytics Inc', type: 'Internship', location: 'Remote' }
]

const activityFeed = [
  { id: 1, type: 'status', title: 'Application Update', desc: 'Your application to TechCorp is under review.', time: '2h ago', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', borderLeft: 'border-l-blue-500' },
  { id: 2, type: 'job', title: 'New Job Match', desc: 'SDE at Google aligns with your profile.', time: '5h ago', icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', borderLeft: 'border-l-emerald-500' },
  { id: 3, type: 'invite', title: 'Mentorship Invite', desc: 'Priya Sharma sent you a connection request.', time: '1d ago', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', borderLeft: 'border-l-purple-500' },
  { id: 4, type: 'event', title: 'Event Reminder', desc: 'Annual Alumni Meet requires RSVP.', time: '1d ago', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', borderLeft: 'border-l-orange-500' }
]

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const { user, authStatus } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    let mounted = true
    const loadProfile = async () => {
      if (!user?.id) return
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, user_type, approval_status, branch, graduation_year, company, avatar_url')
        .eq('id', user.id)
        .maybeSingle()

      if (!mounted) return
      setProfile(data || null)
      if (data?.avatar_url) setAvatarUrl(data.avatar_url)
      setLoadingProfile(false)
    }

    loadProfile()
    return () => { mounted = false }
  }, [user?.id])

  const isApproved = profile?.approval_status === 'APPROVED'

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    // Validate file type and size (max 2MB)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, WebP, or GIF).')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be smaller than 2 MB.')
      return
    }

    try {
      setUploading(true)
      const publicUrl = await uploadAvatar(file, user.id)
      // Append a cache-buster so the browser fetches the new image
      setAvatarUrl(publicUrl + '?t=' + Date.now())
    } catch (err) {
      console.error('Avatar upload failed:', err)
      alert('Failed to upload avatar. Please try again.')
    } finally {
      setUploading(false)
      // Reset input so re-selecting the same file triggers onChange
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {loadingProfile ? 'Member' : (profile?.full_name?.split(' ')[0] || 'Member')}! 👋
          </h1>
          <p className="text-slate-500 mt-1.5 font-medium">Here's what's currently happening in your alumni network.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* 🔥 LEFT SIDEBAR (Sticky) - lg:col-span-3 */}
          <div className="lg:col-span-3 lg:sticky lg:top-8 space-y-6">

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Cover Banner */}
              <div className="h-24 bg-gradient-to-r from-[var(--cardinal)] to-red-800"></div>

              <div className="px-6 pb-6 relative">
                {/* Profile Photo — click to upload */}
                <div className="flex justify-center -mt-12 mb-4">
                  <div
                    className="relative h-24 w-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-md cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                    title="Click to change profile picture"
                  >
                    <img
                      src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || 'User'}&backgroundColor=e2e8f0&textColor=475569`}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      {uploading
                        ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                        : <Camera className="w-6 h-6 text-white" />
                      }
                    </div>
                    {/* Uploading overlay (always visible while uploading) */}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </div>

                {/* Name & Details */}
                <div className="text-center">
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    {loadingProfile ? 'Loading...' : (profile?.full_name || 'Member')}
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    {profile?.branch || 'Branch'} • Class of {profile?.graduation_year || 'YYYY'}
                  </p>

                  {/* Status Badge */}
                  <div className="mt-3.5 flex justify-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${isApproved
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                      {isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {isApproved ? 'Approved Member' : 'Pending Approval'}
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-5 border-t border-slate-100 space-y-3.5">
                  <div className="flex items-center justify-between text-sm hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer -mx-1.5">
                    <span className="text-slate-500 font-medium px-1.5">Applications submitted</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">3</span>
                  </div>
                  <div className="flex items-center justify-between text-sm hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer -mx-1.5">
                    <span className="text-slate-500 font-medium px-1.5">Alumni connections</span>
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">12</span>
                  </div>
                  <div className="flex items-center justify-between text-sm hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer -mx-1.5">
                    <span className="text-slate-500 font-medium px-1.5">Job matches</span>
                    <span className="font-bold text-[var(--cardinal)] bg-red-100 px-2 py-0.5 rounded-md">5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Strength / Optional Extra */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-2xl border border-indigo-100/60 p-5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Profile Strength</h3>
              </div>
              <div className="w-full bg-indigo-200/50 rounded-full h-1.5 mb-2">
                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '60%' }}></div>
              </div>
              <p className="text-xs text-indigo-700/80 font-medium mb-4">Intermediate (60%)</p>
              <button className="w-full py-2 bg-white text-indigo-600 text-xs font-bold rounded-xl shadow-sm border border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all">
                Complete Profile
              </button>
            </div>
          </div>

          {/* 🔥 CENTER CONTENT - lg:col-span-6 */}
          <div className="lg:col-span-6 space-y-6">

            {/* Quick Actions Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--cardinal)]" />
                Quick Actions
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.title}
                    onClick={() => nav(action.path)}
                    className="flex items-start gap-3.5 p-4 border border-slate-100 rounded-xl hover:border-[var(--cardinal)] hover:shadow-md transition-all text-left bg-slate-50/50 hover:bg-white group"
                  >
                    <div className={`p-2.5 rounded-xl ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{action.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 font-medium leading-snug">{action.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended Alumni */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--cardinal)]" />
                  Recommended Alumni
                </h2>
                <button className="text-sm font-semibold text-[var(--cardinal)] hover:text-red-700 flex items-center gap-0.5">
                  See all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid gap-3">
                {recommendedConnections.map((alumni) => (
                  <div key={alumni.id} className="flex items-center justify-between p-3.5 border border-slate-100 bg-slate-50/50 rounded-xl hover:border-[var(--cardinal)] hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <img src={alumni.image} alt={alumni.name} className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-200" />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{alumni.name}</h3>
                        <p className="text-sm text-slate-600 font-medium">{alumni.role}</p>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">{alumni.branch} • '{alumni.year}</p>
                      </div>
                    </div>
                    <button className="p-2.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-full transition-colors hidden sm:block">
                      <HeartHandshake className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Upcoming Events */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[var(--cardinal)]" />
                    Upcoming Events
                  </h2>
                </div>
                <div className="space-y-4 flex-1">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="group relative pl-4 border-l-2 border-slate-200 hover:border-[var(--cardinal)] transition-colors cursor-pointer">
                      <p className="text-xs font-bold text-[var(--cardinal)] mb-1 uppercase tracking-wider">{event.date}</p>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{event.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full py-2 bg-slate-50 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100 transition-colors">
                  View full calendar
                </button>
              </div>

              {/* Featured Opportunities */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[var(--cardinal)]" />
                    Opportunities
                  </h2>
                </div>
                <div className="space-y-3 flex-1">
                  {featuredJobs.map((job) => (
                    <div key={job.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 hover:border-[var(--cardinal)] hover:bg-white transition-all cursor-pointer">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{job.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 font-medium">{job.company}</p>
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className="px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded bg-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          {job.type}
                        </span>
                        <span className="px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded bg-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          {job.location}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full py-2 bg-slate-50 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100 transition-colors">
                  Browse Job Board
                </button>
              </div>
            </div>

          </div>

          {/* 🔥 RIGHT SMART PANEL (Dynamic Feed) - lg:col-span-3 */}
          <div className="lg:col-span-3 lg:sticky lg:top-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-8rem)]">

              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white rounded-t-2xl z-10">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-slate-800" />
                  <h2 className="text-lg font-bold text-slate-900">Activity Feed</h2>
                </div>
                {/* Real-time badge count */}
                <span className="flex items-center justify-center w-5 h-5 bg-[var(--cardinal)] text-white text-xs font-bold rounded-full animate-pulse shadow-sm shadow-red-200">
                  {activityFeed.length}
                </span>
              </div>

              {/* Scrollable independent column */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 feed-scrollbar bg-slate-50/30">
                {activityFeed.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border-l-[3px] border-t border-r border-b ${item.border} ${item.borderLeft} bg-white shadow-sm hover:shadow-md transition-all relative overflow-hidden group cursor-pointer`}
                  >
                    <div className="flex gap-3.5">
                      <div className={`mt-0.5 w-8 h-8 rounded-full ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1 gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                          <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{item.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Embedded style for scrollbar */}
                <style dangerouslySetInnerHTML={{
                  __html: `
                  .feed-scrollbar::-webkit-scrollbar {
                    width: 6px;
                  }
                  .feed-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                  }
                  .feed-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                  }
                  .feed-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8;
                  }
                `}} />
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 shrink-0 bg-white rounded-b-2xl">
                <button className="w-full text-center text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                  Mark all as read
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
