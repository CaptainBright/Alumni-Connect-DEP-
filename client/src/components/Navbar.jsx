import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { authStatus, user, logout } = useAuth()
  const navigate = useNavigate()
  const [featureMenuOpen, setFeatureMenuOpen] = React.useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false)
  const featureMenuRef = React.useRef(null)
  const profileMenuRef = React.useRef(null)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isMember = authStatus === 'approved' || authStatus === 'admin'
  const isGuest = authStatus === 'guest'
  const isLoggedIn = authStatus !== 'guest' && authStatus !== 'loading'
  const showLoggedInLayout = isLoggedIn
  const avatarUrl = user?.avatar_url || user?.profile_image || user?.photo_url || ''
  const avatarInitial = (user?.full_name || user?.name || user?.email || 'U').charAt(0).toUpperCase()

  React.useEffect(() => {
    const onClickOutside = (event) => {
      if (featureMenuRef.current && !featureMenuRef.current.contains(event.target)) {
        setFeatureMenuOpen(false)
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <header className="site-nav sticky top-0 z-50 border-b border-white/10">
      <div className="grid md:grid-cols-[280px_1fr] min-h-[86px]">
        {showLoggedInLayout ? (
          <div ref={featureMenuRef} className="relative flex items-center px-5 py-3 border-r border-white/10">
            <button
              type="button"
              onClick={() => setFeatureMenuOpen((v) => !v)}
              className="inline-flex items-center gap-3 text-white hover:text-white/90 transition"
            >
              <span className="inline-flex flex-col gap-1">
                <span className="block w-5 h-0.5 bg-white rounded" />
                <span className="block w-5 h-0.5 bg-white rounded" />
                <span className="block w-5 h-0.5 bg-white rounded" />
              </span>
              <span className="text-sm font-semibold tracking-wide">Features</span>
            </button>

            {featureMenuOpen && (
              <div className="absolute left-5 top-[72px] w-56 rounded-xl border border-white/15 bg-slate-900/95 backdrop-blur-xl p-2 shadow-2xl">
                <Link to="/resources" className="block px-3 py-2 rounded-lg text-sm text-white/90 hover:bg-white/10">Resources</Link>
                <Link to="/career-playbooks" className="block px-3 py-2 rounded-lg text-sm text-white/90 hover:bg-white/10">Career Playbooks</Link>
                <Link to="/jobs" className="block px-3 py-2 rounded-lg text-sm text-white/90 hover:bg-white/10">Jobs and Referrals</Link>
                <Link to="/directory" className="block px-3 py-2 rounded-lg text-sm text-white/90 hover:bg-white/10">Alumni Directory</Link>
              </div>
            )}
          </div>
        ) : (
          <div className="nav-brand flex items-center px-6 py-4">
            <Link to="/" className="flex items-center gap-3">
              <img src="/1.png" alt="IIT Ropar Alumni" className="w-9 h-9 rounded-full object-cover border border-white/25" />
              <div className="text-white leading-tight">
                <p className="text-xl font-semibold tracking-tight">IIT Ropar Alumni</p>
                <p className="text-xs text-white/80">Connect Portal</p>
              </div>
            </Link>
          </div>
        )}

        <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <nav className="hidden lg:flex items-center gap-8 text-white font-semibold">
            {!showLoggedInLayout && (
              <Link to="/" className="nav-hover">Events</Link>
            )}
            <Link to="/about" className="nav-hover">About</Link>
            <Link to="/resources" className="nav-hover">Reading and Resources</Link>
            <Link to="/directory" className="nav-hover">Programs and Perks</Link>
            <Link to="/jobs" className="nav-hover">Communities</Link>
            <Link to="/donation" className="nav-hover">Volunteer</Link>
          </nav>

          <div className="hidden md:flex items-center gap-5 text-sm text-white/90 ml-auto">
            <Link to="/directory" className="nav-hover">Alumni Directory</Link>
            <a href="mailto:alumni@iitrpr.ac.in" className="nav-hover">Email</a>
            {authStatus === 'pending' && <Link to="/pending-approval" className="text-amber-300">Approval Pending</Link>}
            {isMember && <Link to="/dashboard" className="nav-hover">Dashboard</Link>}
            <button className="px-4 py-1.5 rounded-full border border-white/45 hover:bg-white/10 transition">Search</button>

            {isGuest && (
              <>
                <Link to="/login" className="px-4 py-1.5 rounded-full border border-white/35 text-white hover:bg-white/10 transition">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-1.5 rounded-full bg-white text-slate-900 font-semibold hover:bg-slate-100 transition">
                  Register
                </Link>
              </>
            )}

            {isLoggedIn && (
              <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-white/30 pl-1 pr-2 py-1 hover:bg-white/10 transition"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-white/25" />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-white/15 text-white text-sm font-bold flex items-center justify-center">{avatarInitial}</span>
                  )}
                  <svg className="w-4 h-4 text-white/85" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-[46px] w-44 rounded-xl border border-white/15 bg-slate-900/95 backdrop-blur-xl p-2 shadow-2xl z-50">
                    <Link to="/dashboard" className="block px-3 py-2 rounded-lg text-sm text-white/90 hover:bg-white/10">Profile</Link>
                    <Link to="/edit-profile" className="block px-3 py-2 rounded-lg text-sm text-white/90 hover:bg-white/10">Settings</Link>
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-200 hover:bg-red-900/30">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex md:hidden items-center gap-2 ml-auto">
            {isGuest ? (
              <>
                <Link to="/login" className="px-3 py-1.5 rounded-full border border-white/25 text-white">Login</Link>
                <Link to="/register" className="px-3 py-1.5 rounded-full bg-white text-slate-900 font-semibold">Register</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/30 bg-white/10">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="text-white text-sm font-bold">{avatarInitial}</span>
                  )}
                </Link>
                <button onClick={handleLogout} className="px-3 py-1.5 rounded-full border border-white/35 text-white">Logout</button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
