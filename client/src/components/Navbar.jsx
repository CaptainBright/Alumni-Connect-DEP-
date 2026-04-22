import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Home, Menu, MessageCircle, Search, User, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { messagingApi } from '../api/messagingApi'
import { broadcastApi } from '../api/broadcastApi'
import { supabase } from '../lib/supabaseClient'

const publicMenus = [
  {
    label: 'Home',
    to: 'http://localhost:5173/',
    icon: Home,
  },
  {
    label: 'Network',
    items: [
      { label: 'Alumni Directory', to: '/network' },
      { label: 'Connections', to: '/network' },
      { label: 'Recommended Alumni', to: '/network' },
    ],
  },
  {
    label: 'Jobs',
    items: [
      { label: 'Job Board', to: '/jobs' },
      { label: 'Internships', to: '/jobs' },
      { label: 'Startup Hiring', to: '/jobs' },
    ],
  },
  {
    label: 'Events',
    items: [
      { label: 'Upcoming Events', to: '/events' },
      { label: 'Webinars', to: '/events' },
      { label: 'Alumni Meetups', to: '/events' },
    ],
  },
  {
    label: 'Mentorship',
    items: [
      { label: 'Find Mentor', to: '/mentorship' },
      { label: 'Mentorship Requests', to: '/mentorship' },
      { label: 'My Mentors', to: '/mentorship' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { label: 'Career Resources', to: '/resources' },
      { label: 'Learning Materials', to: '/resources' },
      { label: 'Interview Prep', to: '/career-playbooks' },
    ],
  },
  {
    label: 'About',
    to: '/about',
  },
]

const loggedMenus = [
  {
    label: 'Home',
    to: 'http://localhost:5173/',
    icon: Home,
  },
  ...publicMenus.slice(1),
]

function DesktopMenu({ item }) {
  const Icon = item.icon
  if (item.to) {
    const isExternal = item.to.startsWith('http')
    if (isExternal) {
      return (
        <a href={item.to} className="nav-link inline-flex items-center gap-2">
          {Icon && <Icon size={20} />}
          <span>{item.label}</span>
        </a>
      )
    }
    return (
      <Link to={item.to} className="nav-link inline-flex items-center gap-2">
        {Icon && <Icon size={20} />}
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="relative group">
      <button type="button" className="nav-link inline-flex items-center gap-2">
        <span>{item.label}</span>
        <ChevronDown size={16} />
      </button>
      <div className="dropdown-panel absolute left-0 top-full pt-[6px] w-64 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150">
        <div className="rounded-xl border border-slate-600 bg-[#1f2a44] p-2">
          {item.items.map((sub) => (
            <Link key={sub.label} to={sub.to} className="block rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10">
              {sub.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Navbar() {
  const { authStatus, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [isScrolled, setIsScrolled] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [mobileAccordion, setMobileAccordion] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0)
  const profileRef = useRef(null)

  const isLoggedIn = authStatus !== 'guest' && authStatus !== 'loading'
  const isHomePublic = !isLoggedIn && location.pathname === '/'
  const showScrolledStyle = isScrolled || !isHomePublic
  const menus = isLoggedIn ? loggedMenus : publicMenus
  const displayName = user?.full_name || user?.name || user?.email || 'Alumni User'
  const avatarUrl =
    user?.avatar_url ||
    user?.profile_image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8C1515&color=fff`

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  // Fetch unread messages count on load and on custom read events
  useEffect(() => {
    const fetchUnread = () => {
      if (isLoggedIn && user?.id) {
        messagingApi.getUnreadMessageCount(user.id).then(count => setUnreadMessages(count));
        broadcastApi.getUnreadCount(user.id).then(count => setUnreadAnnouncements(count));
      }
    };
    
    fetchUnread();
    
    window.addEventListener('messagesRead', fetchUnread);

    let channel = null;
    if (isLoggedIn && user?.id) {
      channel = supabase
        .channel('navbar_unread')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => {
          fetchUnread();
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener('messagesRead', fetchUnread);
      if (channel) supabase.removeChannel(channel);
    };
  }, [isLoggedIn, user?.id, location.pathname]);

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className={`navbar ${isHomePublic ? 'fixed' : 'sticky'} top-0 left-0 right-0 z-[1000] ${showScrolledStyle ? 'navbar-scrolled' : ''} ${isHomePublic ? 'navbar-home' : ''}`}>
      <div className="navbar-shell">
        <div className="navbar-logo-section">
          <a href="http://localhost:5173/" className="flex items-center gap-3">
            <img src="/1.png" alt="IIT Ropar Alumni" className="w-[42px] h-[42px] rounded-full object-cover border border-white/25" />
            <div className="text-white leading-tight">
              <p className="text-[16px] font-semibold">IIT Ropar Alumni</p>
              <p className="text-xs text-white/85">Connect Portal</p>
            </div>
          </a>
        </div>

        <div className={`navbar-menu-section ${showScrolledStyle ? 'navbar-menu-scrolled' : ''}`}>
          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex items-center gap-6 text-[15px] font-medium">
              {menus.map((item) => (
                <DesktopMenu key={item.label} item={item} />
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-3">
              <div className="search-wrap">
                <Search size={18} className="text-white/80" />
                <input type="text" placeholder="Search alumni, jobs, mentors..." className="search-input" />
              </div>

              {!isLoggedIn && (
                <>
                  <Link to="/login" className="px-4 py-2 rounded-lg border border-white/30 text-white hover:bg-[#2E3B5B] transition">
                    Login
                  </Link>
                  <Link to="/register" className="px-4 py-2 rounded-lg bg-white text-slate-900 font-medium hover:bg-slate-100 transition">
                    Register
                  </Link>
                </>
              )}

              {isLoggedIn && (
                <>
                  <button type="button" onClick={() => navigate('/dashboard')} className="icon-btn relative" aria-label="Notifications">
                    <Bell size={20} />
                    {unreadAnnouncements > 0 && (
                      <span className="notif-badge">{unreadAnnouncements > 99 ? '99+' : unreadAnnouncements}</span>
                    )}
                  </button>
                  <Link to="/messages" className="icon-btn relative" aria-label="Messages">
                    <MessageCircle size={20} />
                    {unreadMessages > 0 && (
                      <span className="notif-badge">{unreadMessages > 99 ? '99+' : unreadMessages}</span>
                    )}
                  </Link>

                  <div ref={profileRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setProfileOpen((v) => !v)}
                      className="flex items-center gap-2 px-1.5 py-1 rounded-full border border-white/30 hover:bg-[#2E3B5B] transition"
                    >
                      <img src={avatarUrl} alt="Profile" className="w-9 h-9 rounded-full object-cover" />
                      <User size={18} className="text-white" />
                    </button>
                    {profileOpen && (
                      <div className="dropdown-panel absolute right-0 top-[46px] w-52 rounded-xl border border-slate-600 bg-[#1F2A44] p-2 z-50">
                        {authStatus === 'admin' && (
                          <Link to="/admin" className="block rounded-lg px-3 py-2 text-sm text-red-400 font-bold hover:bg-[#2E3B5B]">Admin Dashboard</Link>
                        )}
                        <Link to="/dashboard" className="block rounded-lg px-3 py-2 text-sm text-white hover:bg-[#2E3B5B]">My Profile</Link>
                        <Link to="/edit-profile" className="block rounded-lg px-3 py-2 text-sm text-white hover:bg-[#2E3B5B]">Edit Profile</Link>
                        <Link to="/jobs" className="block rounded-lg px-3 py-2 text-sm text-white hover:bg-[#2E3B5B]">Applications</Link>
                        <Link to="/jobs" className="block rounded-lg px-3 py-2 text-sm text-white hover:bg-[#2E3B5B]">Saved Jobs</Link>
                        <Link to="/edit-profile" className="block rounded-lg px-3 py-2 text-sm text-white hover:bg-[#2E3B5B]">Settings</Link>
                        <button onClick={handleLogout} className="w-full text-left rounded-lg px-3 py-2 text-sm text-red-200 hover:bg-red-900/30">Logout</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="lg:hidden flex items-center justify-between w-full">
            <button type="button" onClick={() => setMobileOpen((v) => !v)} className="icon-btn" aria-label="Menu">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <button type="button" className="icon-btn" aria-label="Search">
              <Search size={20} />
            </button>
          </div>

          {mobileOpen && (
            <div className="lg:hidden mt-3 rounded-xl border border-slate-600 bg-[#1F2A44] p-3">
              <div className="search-wrap mb-3">
                <Search size={18} className="text-white/80" />
                <input type="text" placeholder="Search alumni, jobs, mentors..." className="search-input" />
              </div>
              {menus.map((item) => {
                if (item.to) {
                  const isExternal = item.to.startsWith('http')
                  if (isExternal) {
                    return (
                      <a key={item.label} href={item.to} className="block px-3 py-2 text-white rounded-lg hover:bg-[#2E3B5B]">
                        {item.label}
                      </a>
                    )
                  }
                  return (
                    <Link key={item.label} to={item.to} className="block px-3 py-2 text-white rounded-lg hover:bg-[#2E3B5B]">
                      {item.label}
                    </Link>
                  )
                }
                const isOpen = mobileAccordion === item.label
                return (
                  <div key={item.label}>
                    <button
                      type="button"
                      onClick={() => setMobileAccordion((prev) => (prev === item.label ? null : item.label))}
                      className="w-full flex items-center justify-between px-3 py-2 text-white rounded-lg hover:bg-[#2E3B5B]"
                    >
                      <span>{item.label}</span>
                      <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="pl-3">
                        {item.items.map((sub) => (
                          <Link key={sub.label} to={sub.to} className="block px-3 py-2 text-sm text-white/90 rounded-lg hover:bg-[#2E3B5B]">
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
