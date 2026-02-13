import React from 'react'
import { motion } from 'framer-motion'

export default function Hero(){
  return (
    <section className="relative overflow-hidden">
      {/* background image */}
      <div className="relative h-[56vh] md:h-[64vh] lg:h-[72vh]">
        <img src="/hero.jpg" alt="Campus" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-6xl mx-auto px-6 md:px-10 text-center lg:text-left">
            <motion.h1 className="hero-title text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Welcome Home
            </motion.h1>

            <motion.p className="mt-6 text-white text-base sm:text-lg md:text-xl max-w-3xl mx-auto lg:mx-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              Step into the virtual home of our global alumni community — reconnect with classmates, discover opportunities, and stay up-to-date on campus events and research.
            </motion.p>

            <div className="mt-8 flex justify-center lg:justify-start gap-3">
              <a href="/directory" className="px-5 py-3 text-sm rounded-md cardinal-cta shadow-sm">Find Alumni</a>
              <a href="/events" className="px-5 py-3 text-sm rounded-md border border-white text-white">Explore Events</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
