import React from 'react'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[58vh] md:h-[66vh] lg:h-[74vh]">
        <img src="/hero.jpg" alt="IIT Ropar campus" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-6xl mx-auto px-6 md:px-10 text-center">
            <h1 className="hero-title text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold">
              Welcome Home
            </h1>

            <p className="mt-6 text-white text-base sm:text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
              Step into the virtual home of IIT Ropar&apos;s global community where our spirit thrives beyond campus.
              Reconnect with classmates, discover opportunities, and stay updated with the latest research and community initiatives.
            </p>

            <div className="mt-8 flex justify-center gap-3">
              <a href="/directory" className="px-5 py-3 text-sm rounded-md cardinal-cta shadow-sm">Find Alumni</a>
              <a href="/resources" className="px-5 py-3 text-sm rounded-md border border-white text-white">Explore Resources</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
