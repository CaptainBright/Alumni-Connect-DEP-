import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, GraduationCap, Microscope, Rocket, Search } from 'lucide-react'
import '../styles/resources-modern.css'

const collections = [
  {
    title: 'Career Playbooks',
    category: 'Career',
    description: 'Interview prep, resume templates, referral strategy, and transition guides.',
    link: '/career-playbooks',
    image: '/careerplaybooks.jpg',
    alt: 'Career Playbooks thumbnail'
  },
  {
    title: 'Higher Studies Toolkit',
    category: 'Education',
    description: 'GRE/TOEFL resources, SOP examples, and alumni profiles from global universities.',
    link: '#',
    image: '/higherstudies.png',
    alt: 'Higher Studies Toolkit thumbnail'
  },
  {
    title: 'Startup and Research Hub',
    category: 'Entrepreneurship',
    description: 'Founder stories, funding resources, and collaborative research opportunities.',
    link: '#',
    image: '/startupandresearchhub.png',
    alt: 'Startup and Research Hub thumbnail'
  }
]

const resourceCategories = [
  {
    title: 'Career Development',
    text: 'Playbooks, interview prep, and professional transition resources.',
    icon: BookOpen
  },
  {
    title: 'Higher Studies',
    text: 'Graduate admissions resources and standardized test guidance.',
    icon: GraduationCap
  },
  {
    title: 'Startup and Innovation',
    text: 'Founder journeys, funding pathways, and execution frameworks.',
    icon: Rocket
  },
  {
    title: 'Research and Labs',
    text: 'Research collaboration opportunities and technical learning material.',
    icon: Microscope
  }
]

function ResourceImage({ src, alt, parallaxY, onLoaded }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative w-full h-[200px] bg-slate-100 overflow-hidden">
      {!loaded && <div className="absolute inset-0 skeleton" aria-hidden="true" />}
      <div className="absolute inset-0" style={{ transform: `translateY(${parallaxY}px)` }}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => {
            setLoaded(true)
            onLoaded()
          }}
          className={`w-full h-full object-cover object-center ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 card-img-scale group-hover:scale-[1.08]`}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent pointer-events-none" />
    </div>
  )
}

export default function Resources() {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [scrollY, setScrollY] = useState(0)
  const [query, setQuery] = useState('')
  const [modalCollection, setModalCollection] = useState(null)
  const [liveMessage, setLiveMessage] = useState('Loading resource content.')
  const [imagesLoaded, setImagesLoaded] = useState(0)

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-up')
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })

    const nodes = containerRef.current?.querySelectorAll('.watch-animate') || []
    nodes.forEach((node, idx) => {
      node.style.animationDelay = `${idx * 80}ms`
      io.observe(node)
    })

    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || 0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!modalCollection) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setModalCollection(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modalCollection])

  const heroParallax = useMemo(() => {
    return Math.min(24, scrollY * 0.08).toFixed(2)
  }, [scrollY])

  const filteredCollections = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return collections
    return collections.filter((item) => {
      const haystack = `${item.title} ${item.category} ${item.description}`.toLowerCase()
      return haystack.includes(normalized)
    })
  }, [query])

  useEffect(() => {
    setLiveMessage(`${filteredCollections.length} resource collections shown.`)
  }, [filteredCollections.length])

  useEffect(() => {
    if (imagesLoaded >= filteredCollections.length && filteredCollections.length > 0) {
      setLiveMessage('Visible resource thumbnails loaded.')
    }
  }, [imagesLoaded, filteredCollections.length])

  function trackExploreClick(item) {
    if (typeof window !== 'undefined') {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'explore_collection_click', {
          event_category: 'Resources',
          event_label: item.title,
          value: item.link
        })
      }

      window.dispatchEvent(new CustomEvent('analytics:explore_collection', {
        detail: { title: item.title, link: item.link }
      }))
    }
  }

  function handleCollectionActivate(item) {
    trackExploreClick(item)
    if (item.link.startsWith('/')) {
      navigate(item.link)
      return
    }
    setModalCollection(item)
  }

  return (
    <div className="bg-slate-50" ref={containerRef}>
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveMessage}
        </div>

        <section className="relative h-[260px] rounded-2xl overflow-hidden border border-slate-200 mb-8 watch-animate opacity-0">
          <img
            src="/resources.png"
            alt="Resources hero"
            loading="lazy"
            className="w-full h-full object-cover object-center"
            style={{ transform: `translateY(${heroParallax}px) scale(1.04)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2E3B55]/85 via-[#2E3B55]/60 to-black/35" />
          <div className="absolute inset-0 flex items-center">
            <div className="px-8 md:px-10">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white">Resources and Library</h1>
              <p className="mt-3 text-slate-100 max-w-2xl">
                Find guides, playbooks, research, and career resources from the IIT Ropar alumni network.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 shadow-sm watch-animate opacity-0">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Search Resources</h2>
          <p className="mt-2 text-slate-600">Search playbooks, guides, and research material across collections.</p>
          <label className="mt-5 max-w-[500px] w-full bg-white border border-slate-200 rounded-full shadow-md px-4 py-3 flex items-center gap-3">
            <Search size={18} className="text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search playbooks, guides, research..."
              className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
              aria-label="Search resources"
            />
          </label>
        </section>

        <section className="mb-5 watch-animate opacity-0">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Featured Collections</h2>
          <p className="mt-2 text-slate-600">
            Curated paths for career growth, higher studies, and startup or research opportunities.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {filteredCollections.map((item, idx) => (
            <article
              key={item.title}
              className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-md card-hover-shadow hover:shadow-xl hover:-translate-y-[6px] transition-all duration-300 watch-animate opacity-0 cursor-pointer"
              role="button"
              aria-labelledby={`card-${idx}-title`}
              tabIndex={0}
              onClick={() => handleCollectionActivate(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCollectionActivate(item)
              }}
            >
              <ResourceImage
                src={item.image}
                alt={item.alt}
                parallaxY={Math.min(12, scrollY * (0.012 + idx * 0.002))}
                onLoaded={() => setImagesLoaded((prev) => prev + 1)}
              />

              <div className="p-5">
                <span className="inline-flex mb-3 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                  {item.category}
                </span>
                <h3 id={`card-${idx}-title`} className="text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>

                <div className="mt-5">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-[10px] rounded-lg bg-[#8C1515] text-white font-medium hover:bg-[#6A0F0F] focus:outline-none focus:ring-2 focus:ring-[#8C1515]"
                    aria-label={`Explore ${item.title}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCollectionActivate(item)
                    }}
                  >
                    Explore Collection
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="watch-animate opacity-0 mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Resource Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {resourceCategories.map((item) => {
              const Icon = item.icon
              return (
                <article key={item.title} className="bg-white rounded-xl border border-slate-200 p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-10 h-10 rounded-full bg-[#2E3B55]/10 text-[#2E3B55] flex items-center justify-center mb-3">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.text}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="watch-animate opacity-0 mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <article key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-slate-500">Coming Soon</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">Curated Editorial {i}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  This section will feature curated resources and alumni insights shortly.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="watch-animate opacity-0 bg-gradient-to-r from-[#2E3B55] to-[#1f2d4a] rounded-2xl p-8 md:p-10 text-white">
          <p className="text-white/80 text-sm uppercase tracking-wider">Need personalized guidance?</p>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">Connect with alumni mentors</h2>
          <p className="mt-3 text-slate-100 max-w-2xl">
            Connect with alumni mentors for career and higher studies.
          </p>
          <Link
            to="/mentorship"
            className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-lg bg-[#8C1515] text-white font-semibold hover:bg-[#6A0F0F] transition-all duration-300 hover:-translate-y-1"
          >
            Find a Mentor
            <ArrowRight size={16} />
          </Link>
        </section>

        {modalCollection && (
          <div
            className="fixed inset-0 z-[1200] bg-black/50 flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="collection-coming-soon-title"
            onClick={() => setModalCollection(null)}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-up-slow" onClick={(e) => e.stopPropagation()}>
              <h4 id="collection-coming-soon-title" className="text-xl font-bold text-slate-900">
                Coming soon: {modalCollection.title}
              </h4>
              <p className="mt-3 text-slate-600">
                This collection is being prepared and will be available soon.
              </p>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalCollection(null)}
                  className="px-4 py-2 rounded-lg bg-[#2E3B55] text-white hover:bg-[#243149] focus:outline-none focus:ring-2 focus:ring-[#2E3B55]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
