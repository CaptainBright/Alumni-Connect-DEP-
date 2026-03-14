import React from 'react'

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <img src="/hero.jpg" alt="IIT Ropar campus" className="absolute inset-0 w-full h-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />

      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <div className="max-w-5xl text-center">
          <p className="home-copy uppercase tracking-[0.28em] text-xs text-white/80">IIT Ropar Alumni Connect</p>
          <h1 className="hero-title mt-4 font-bold text-white leading-tight text-5xl md:text-[64px]">
            Welcome to the Alumni Portal
          </h1>
          <p className="home-copy mt-6 text-[18px] text-white/85 max-w-[700px] mx-auto leading-relaxed">
            Connect with alumni, discover career opportunities, participate in mentorship, and stay informed about
            events, initiatives, and academic progress across the IIT Ropar community.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="/directory"
              className="px-[22px] py-3 rounded-lg bg-[#8C1515] text-white font-medium hover:bg-[#6A0F0F] hover:-translate-y-[1px] hover:shadow-lg transition"
            >
              Find Alumni
            </a>
            <a href="/resources" className="px-6 py-3 rounded-lg border border-white text-white bg-transparent hover:bg-white/10 transition">
              Explore Resources
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
