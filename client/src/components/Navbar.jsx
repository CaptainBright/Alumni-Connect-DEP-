import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { authStatus, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const isMember = authStatus === 'approved' || authStatus === 'admin'
  const isGuest = authStatus === 'guest'

  return (
    <header className="site-nav sticky top-0 z-50 border-b border-white/10">
      <div className="grid md:grid-cols-[300px_1fr] min-h-[92px]">
        <div className="nav-brand flex items-center px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src="/image.png" alt="IIT Ropar Alumni" className="w-9 h-9 rounded-full object-cover border border-white/25" />
            <div className="text-white leading-tight">
              <p className="text-xl font-semibold tracking-tight">IIT Ropar Alumni</p>
              <p className="text-xs text-white/80">Connect Portal</p>
            </div>
          </Link>
        </div>

        <div className="px-4 md:px-8 py-3 flex flex-col justify-between">
          <div className="hidden md:flex items-center justify-end gap-6 text-sm text-white/90">
            <Link to="/directory" className="hover:text-white transition">Alumni Directory</Link>
            <a href="mailto:alumni@iitrpr.ac.in" className="hover:text-white transition">Email</a>
            {isGuest && <Link to="/login" className="hover:text-white transition">Log in</Link>}
            {authStatus === 'pending' && <Link to="/pending-approval" className="text-amber-300">Approval Pending</Link>}
            {isMember && <Link to="/dashboard" className="hover:text-white transition">Dashboard</Link>}
            {authStatus === 'admin' && <Link to="/admin" className="text-emerald-300 hover:text-emerald-200 transition">Admin Panel</Link>}
            <button className="px-4 py-1.5 rounded-full border border-white/50 hover:bg-white/10 transition">Search</button>
          </div>

          <div className="flex items-center justify-between">
            <nav className="hidden lg:flex items-center gap-8 text-white font-semibold">
              <Link to="/" className="hover:text-white/80 transition">Events</Link>
              <Link to="/resources" className="hover:text-white/80 transition">Reading and Resources</Link>
              <Link to="/directory" className="hover:text-white/80 transition">Programs and Perks</Link>
              <Link to="/jobs" className="hover:text-white/80 transition">Communities</Link>
              <Link to="/donation" className="hover:text-white/80 transition">Volunteer</Link>
            </nav>

            <div className="flex md:hidden items-center gap-2 ml-auto">
              <Link to="/login" className="px-3 py-1.5 rounded-full border border-white/25 text-white">Login</Link>
              <Link to="/register" className="px-3 py-1.5 rounded-full bg-white text-slate-900 font-semibold">Register</Link>
            </div>

            <div className="hidden md:flex items-center gap-2">
              {isGuest && (
                <>
                  <Link to="/login" className="px-4 py-1.5 rounded-full border border-white/35 text-white hover:bg-white/10 transition">
                    Login
                  </Link>
                  <Link to="/admin-login" className="px-4 py-1.5 rounded-full border border-emerald-300/60 text-emerald-200 hover:bg-emerald-400/10 transition">
                    Admin
                  </Link>
                  <Link to="/register" className="px-4 py-1.5 rounded-full bg-white text-slate-900 font-semibold hover:bg-slate-100 transition">
                    Register
                  </Link>
                </>
              )}

              {authStatus === 'approved' && (
                <button onClick={handleLogout} className="px-4 py-1.5 rounded-full border border-white/35 text-white hover:bg-white/10 transition">
                  Logout
                </button>
              )}

              {authStatus === 'pending' && (
                <button onClick={handleLogout} className="px-4 py-1.5 rounded-full border border-white/35 text-white hover:bg-white/10 transition">
                  Logout
                </button>
              )}

              {authStatus === 'admin' && (
                <button onClick={handleLogout} className="px-4 py-1.5 rounded-full border border-white/35 text-white hover:bg-white/10 transition">
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
