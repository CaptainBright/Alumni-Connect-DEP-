import React from 'react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[58vh] md:h-[66vh] lg:h-[74vh]">
        <img src="/hero.jpg" alt="IIT Ropar campus" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-6xl mx-auto px-6 md:px-10 text-center">
            <p className="home-copy uppercase tracking-[0.28em] text-[11px] sm:text-xs text-white/80">
              IIT Ropar Alumni Connect
            </p>
            <h1 className="home-heading text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mt-3">
              Welcome to the Alumni Portal
            </h1>

            <p className="home-copy mt-6 text-white text-base sm:text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
              Connect with alumni, discover career opportunities, participate in mentorship, and stay informed about
              events, initiatives, and academic progress across the IIT Ropar community.
            </p>

            <div className="mt-8 flex justify-center gap-3">
              <a href="/directory" className="home-copy px-5 py-3 text-sm rounded-md cardinal-cta shadow-sm">Find Alumni</a>
              <a href="/resources" className="home-copy px-5 py-3 text-sm rounded-md border border-white text-white">Explore Resources</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
