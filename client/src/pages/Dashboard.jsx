import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { uploadAvatar } from '../lib/upload'
import { fetchExperiences } from '../api/experienceApi'
import {
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Calendar,
  Bell,
  Sparkles,
  Edit,
  Camera,
  Loader2
} from 'lucide-react'

const activityFeed = [
  { id: 1, type: 'status', title: 'Application Update', desc: 'Your application to TechCorp is under review.', time: '2h ago', icon: Briefcase, color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200', borderLeft: 'border-l-slate-400' },
  { id: 2, type: 'job', title: 'New Job Match', desc: 'SDE at Google aligns with your profile.', time: '5h ago', icon: Sparkles, color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200', borderLeft: 'border-l-slate-400' },
  { id: 3, type: 'invite', title: 'Mentorship Invite', desc: 'Priya Sharma sent you a connection request.', time: '1d ago', icon: Users, color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200', borderLeft: 'border-l-slate-400' },
  { id: 4, type: 'event', title: 'Event Reminder', desc: 'Annual Alumni Meet requires RSVP.', time: '1d ago', icon: Calendar, color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200', borderLeft: 'border-l-slate-400' }
]

const recommendedAlumni = [
  { id: 1, name: 'Priya Sharma', role: 'Senior Product Manager, Microsoft', batch: 'CSE 2018', avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=8C1515&color=fff' },
  { id: 2, name: 'Arjun Verma', role: 'Software Engineer, Google', batch: 'EE 2019', avatar: 'https://ui-avatars.com/api/?name=Arjun+Verma&background=1F2A44&color=fff' },
  { id: 3, name: 'Neha Gupta', role: 'Research Scientist, NVIDIA', batch: 'ME 2017', avatar: 'https://ui-avatars.com/api/?name=Neha+Gupta&background=334155&color=fff' },
]

const eventSchedule = [
  { id: 1, title: 'Alumni Mentorship Webinar', date: 'Mar 20, 2026', time: '7:00 PM IST' },
  { id: 2, title: 'Startup Networking Circle', date: 'Mar 25, 2026', time: '6:30 PM IST' },
  { id: 3, title: 'Annual Alumni Meet Planning', date: 'Apr 2, 2026', time: '5:00 PM IST' },
]

function formatPostDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function readingTime(text) {
  const words = (text || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
  const mins = Math.max(1, Math.ceil(words / 200))
  return `${mins} min read`
}

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [recentPosts, setRecentPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const fileInputRef = useRef(null)
  const { user } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    let mounted = true
    const loadProfile = async () => {
      if (!user?.id) return
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, user_type, approval_status, branch, graduation_year, company, bio, skills, interests, linkedin, avatar_url')
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

  useEffect(() => {
    let mounted = true
    setLoadingPosts(true)
    fetchExperiences('all')
      .then((posts) => {
        if (!mounted) return
        setRecentPosts((posts || []).slice(0, 6))
      })
      .catch(() => {
        if (!mounted) return
        setRecentPosts([])
      })
      .finally(() => {
        if (!mounted) return
        setLoadingPosts(false)
      })

    return () => { mounted = false }
  }, [])

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
            Welcome back, {loadingProfile ? 'Member' : (profile?.full_name?.split(' ')[0] || 'Member')}!
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

            {/* Custom Details & Edit Profile */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col gap-5">
              <div className="space-y-4">
                {/* Department & Year (Always display, use placeholder if missing) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</h3>
                    <p className="text-sm text-slate-800 font-semibold">{profile?.branch || 'Not provided'}</p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Graduation</h3>
                    <p className="text-sm text-slate-800 font-semibold">{profile?.graduation_year ? `'${profile.graduation_year.toString().slice(-2)}` : 'Not provided'}</p>
                  </div>
                </div>

                {/* Company & Role */}
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Company</h3>
                  <p className="text-sm text-slate-800 font-semibold">{profile?.company || 'Not added yet'}</p>
                </div>

                {/* Bio / About */}
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">About Me</h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {profile?.bio || 'No bio added yet. Tell the community about yourself.'}
                  </p>
                </div>

                {/* Career Goals */}
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Career Goals</h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {profile?.career_goals || 'Not added yet'}
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Core Skills</h3>
                  {profile?.skills ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {profile.skills.split(',').map((skill, idx) => (
                        <span key={idx} className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold shadow-sm">{skill.trim()}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No skills listed</p>
                  )}
                </div>

                {/* Interests */}
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Interests</h3>
                  <p className="text-sm text-slate-700 font-medium">
                    {profile?.interests || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={() => nav('/edit-profile')}
                  className="w-full py-2.5 bg-white text-slate-700 text-sm font-bold rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-[var(--cardinal)] hover:border-slate-300 transition-all flex items-center justify-center gap-2 group"
                >
                  <Edit className="w-4 h-4 text-slate-400 group-hover:text-[var(--cardinal)] transition-colors" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* 🔥 CENTER CONTENT - lg:col-span-6 */}
          <div className="lg:col-span-6 space-y-6">

            {/* Recent Posts */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Recent Posts</h2>
              <p className="text-sm text-slate-500 mt-1 mb-5">Latest insights and career guidance from alumni.</p>

              {loadingPosts ? (
                <div className="py-12 text-center">
                  <div className="inline-block w-7 h-7 border-4 border-slate-300 border-t-[var(--cardinal)] rounded-full animate-spin" />
                </div>
              ) : recentPosts.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-sm">No recent posts available.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {recentPosts.map((post) => {
                    const textOnlyBody = (post.body || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
                    const shortDescription = post.subtitle || textOnlyBody.slice(0, 120)

                    return (
                      <article
                        key={post.id}
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition duration-200"
                      >
                        <img
                          src={post.cover_image || '/careerplaybooks.png'}
                          alt={post.title}
                          className="w-full h-[150px] object-cover rounded-[10px] mb-3"
                        />
                        <h3 className="text-base font-bold text-slate-900 leading-snug">{post.title}</h3>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {shortDescription}
                        </p>
                        <div className="mt-3 text-xs text-slate-500">
                          <p>Author: {post.author_name || 'Alumni Member'}</p>
                          <p>{formatPostDate(post.created_at)} - {readingTime(post.body)}</p>
                        </div>
                        <Link to={`/career-playbooks/${post.id}--${slugify(post.title)}`} className="inline-block mt-3 text-sm font-semibold text-[var(--cardinal)] hover:text-[var(--cardinal-hover)]">
                          Read More <span aria-hidden="true">→</span>
                        </Link>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Recommended Alumni */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Recommended Alumni</h2>
              <p className="text-sm text-slate-500 mt-1 mb-4">People you may want to connect with in your domain.</p>
              <div className="space-y-4">
                {recommendedAlumni.map((alum) => (
                  <article key={alum.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <img src={alum.avatar} alt={alum.name} className="w-11 h-11 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{alum.name}</p>
                        <p className="text-xs text-slate-500">{alum.role}</p>
                        <p className="text-xs text-slate-400">{alum.batch}</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:border-[var(--cardinal)] hover:text-[var(--cardinal)] transition">
                      Connect
                    </button>
                  </article>
                ))}
              </div>
            </div>

          </div>

          {/* 🔥 RIGHT SMART PANEL (Dynamic Feed) - lg:col-span-3 */}
          <div className="lg:col-span-3 lg:sticky lg:top-8 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Event Schedule</h2>
              <p className="text-sm text-slate-500 mt-1 mb-4">Upcoming community activities.</p>
              <div className="space-y-3">
                {eventSchedule.map((event) => (
                  <article key={event.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50/70">
                    <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{event.date} - {event.time}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-28rem)] min-h-[420px]">

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
