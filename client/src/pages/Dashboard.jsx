import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import UnifiedProfileCard from '../components/UnifiedProfileCard'
import RecommendedAlumniSection from '../components/RecommendedAlumniSection'
import ConnectionRequests from '../components/network/ConnectionRequests'
import { fetchExperiences } from '../api/experienceApi'
import {
  Briefcase,
  Users,
  Calendar,
  Bell,
  Sparkles,
  Paperclip,
  Megaphone
} from 'lucide-react'
import { broadcastApi } from '../api/broadcastApi'

// Removed hardcoded activityFeed

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

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  
  return `${Math.floor(months / 12)}y ago`;
}

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [recentPosts, setRecentPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [broadcasts, setBroadcasts] = useState([])
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
      setLoadingProfile(false)
    }

    loadProfile()
    return () => { mounted = false }
  }, [user?.id])

  // Fetch targeted broadcasts
  useEffect(() => {
    if (!user?.id) return
    let mounted = true
    broadcastApi.fetchUserBroadcastsWithReadState(user.id).then(data => {
      if (mounted) setBroadcasts(data)
    }).catch(err => console.error("Error fetching broadcasts:", err))
    
    return () => { mounted = false }
  }, [user?.id])

  useEffect(() => {
    let mounted = true
    setLoadingPosts(true)
    fetchExperiences('all')
      .then((posts) => {
        if (!mounted) return
        setRecentPosts((posts || []).slice(0, 3))
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

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome back, {loadingProfile ? 'Member' : (profile?.full_name?.split(' ')[0] || 'Member')}!
          </h1>
          <p className="text-slate-500 mt-1.5 font-medium">Here's what's currently happening in your alumni network.</p>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* 🔥 LEFT SIDEBAR (Sticky) - lg:col-span-3 */}
          <div className="lg:col-span-3 lg:sticky lg:top-8 space-y-6">
            <UnifiedProfileCard profile={profile} loadingProfile={loadingProfile} />
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
            <RecommendedAlumniSection currentProfile={profile} />

          </div>

          {/* 🔥 RIGHT SMART PANEL (Dynamic Feed) - lg:col-span-3 */}
          <div className="lg:col-span-3 lg:sticky lg:top-8 space-y-6">
            <ConnectionRequests />

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
                {broadcasts.filter(b => !b.isRead).length > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 bg-[var(--cardinal)] text-white text-xs font-bold rounded-full animate-pulse shadow-sm shadow-red-200">
                    {broadcasts.filter(b => !b.isRead).length}
                  </span>
                )}
              </div>

              {/* Scrollable independent column */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 feed-scrollbar bg-slate-50/30">
                {broadcasts.length === 0 ? (
                  <div className="text-center py-10 flex flex-col items-center justify-center h-full">
                    <Bell className="w-10 h-10 text-slate-200 mb-3" />
                    <p className="text-sm font-medium text-slate-500">You're all caught up</p>
                    <p className="text-xs text-slate-400 mt-1">No announcements available.</p>
                  </div>
                ) : (
                  broadcasts.map((item) => (
                    <Link
                      to={`/announcements/${item.id}`}
                      key={item.id}
                      className={`block p-4 rounded-xl border-l-[3px] border-t border-r border-b border-slate-200 ${item.isRead ? 'bg-white border-l-slate-300' : 'bg-blue-50/50 border-l-[var(--cardinal)]'} shadow-sm hover:shadow-md transition-all relative overflow-hidden group cursor-pointer`}
                    >
                      <div className="flex gap-3.5">
                        <div className={`mt-0.5 w-8 h-8 rounded-full ${item.isRead ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-[var(--cardinal)]'} flex items-center justify-center shrink-0`}>
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1 gap-2">
                            <h3 className={`text-sm ${item.isRead ? 'font-semibold text-slate-700' : 'font-bold text-slate-900'}`}>{item.title}</h3>
                            <span className={`text-[10px] font-bold whitespace-nowrap ${item.isRead ? 'text-slate-400' : 'text-slate-500'}`}>{timeAgo(item.created_at)}</span>
                          </div>
                          <p className={`text-xs leading-relaxed ${item.isRead ? 'text-slate-500 font-medium' : 'text-slate-600 font-semibold'} line-clamp-2`}>{item.content}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}

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
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
