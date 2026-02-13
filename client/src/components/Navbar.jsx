import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Navbar(){
  return (
    <motion.header className="site-nav sticky top-0 z-50 border-b border-transparent"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <div className="max-w-7xl mx-auto flex items-stretch">
        {/* left logo block */}
        <div className="hidden md:flex items-center brand-block px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <img src="/image.png" alt="Alumni-Connect" className="h-8" />
          </Link>
        </div>

        {/* nav area */}
        <div className="flex-1 flex items-center justify-between px-4 md:px-8 py-3">
          <nav className="hidden lg:flex gap-10 items-center text-white">
            <Link to="/" className="text-sm font-semibold hover:text-cardinal-50">Events</Link>
            <Link to="/resources" className="text-sm font-semibold hover:text-cardinal-50">Reading & Resources</Link>
            <Link to="/directory" className="text-sm font-semibold hover:text-cardinal-50">Programs & Perks</Link>
            <Link to="/jobs" className="text-sm font-semibold hover:text-cardinal-50">Communities</Link>
            <Link to="/donation" className="text-sm font-semibold hover:text-cardinal-50">Volunteer</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/directory" className="text-white text-sm">Alumni Directory</Link>
            <Link to="/login" className="text-white text-sm font-medium">Log in</Link>
            <button className="ml-2 px-3 py-1 rounded-full border border-white text-white text-sm">Search 🔍</button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
