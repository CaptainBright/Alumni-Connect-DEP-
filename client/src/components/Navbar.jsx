import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'

export default function Navbar(){
  const { authStatus, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate("/")
  }

  const isApproved = authStatus === "approved" || authStatus === "admin"

  return (
    <motion.header
      className="site-nav sticky top-0 z-50 border-b border-transparent"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <div className="max-w-7xl mx-auto flex items-stretch">

        {/* Logo */}
        <div className="hidden md:flex items-center brand-block px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <img src="/image.png" alt="Alumni-Connect" className="h-8" />
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex items-center justify-between px-4 md:px-8 py-3">

          {/* Main menu (only approved users) */}
          {isApproved && (
            <nav className="hidden lg:flex gap-10 items-center text-white">
              <Link to="/resources" className="text-sm font-semibold hover:text-cardinal-50">Resources</Link>
              <Link to="/directory" className="text-sm font-semibold hover:text-cardinal-50">Directory</Link>
              <Link to="/jobs" className="text-sm font-semibold hover:text-cardinal-50">Jobs</Link>
              <Link to="/donation" className="text-sm font-semibold hover:text-cardinal-50">Volunteer</Link>
            </nav>
          )}

          <div className="flex items-center gap-3 text-white text-sm">

            {/* GUEST */}
            {authStatus === "guest" && (
              <>
                <Link to="/login" className="font-medium">Log in</Link>
                <Link to="/register" className="px-3 py-1 rounded-full border border-white">Register</Link>
              </>
            )}

            {/* PENDING */}
            {authStatus === "pending" && (
              <>
                <Link to="/pending" className="text-yellow-300 font-medium">
                  Awaiting Approval
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 rounded-full border border-white"
                >
                  Logout
                </button>
              </>
            )}

            {/* APPROVED USERS */}
            {authStatus === "approved" && (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 rounded-full border border-white"
                >
                  Logout
                </button>
              </>
            )}

            {/* ADMIN */}
            {authStatus === "admin" && (
              <>
                <Link to="/admin" className="text-green-300 font-semibold">
                  Admin Panel
                </Link>
                <Link to="/dashboard">Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 rounded-full border border-white"
                >
                  Logout
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </motion.header>
  )
}
