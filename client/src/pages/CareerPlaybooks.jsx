import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchExperiences } from '../api/experienceApi'
import { useAuth } from '../hooks/useAuth'
import '../styles/careerPlaybooks.css'

const categories = [
  { key: 'all', label: 'All Stories' },
  { key: 'interview', label: 'Interview Experiences' },
  { key: 'job', label: 'Job Experiences' },
  { key: 'internship', label: 'Internship Experiences' },
  { key: 'advice', label: 'Career Advice' },
]

function readingTime(text) {
  const words = (text || '').split(/\s+/).length
  const mins = Math.max(1, Math.ceil(words / 200))
  return `${mins} min read`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function CareerPlaybooks() {
  const { user } = useAuth()
  const [experiences, setExperiences] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchExperiences(activeCategory)
      .then(setExperiences)
      .catch(() => setExperiences([]))
      .finally(() => setLoading(false))
  }, [activeCategory])

  return (
    <div className="min-h-screen bg-[var(--sand)]">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-[#0f1720] to-[#1b2734] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="home-copy uppercase tracking-[0.24em] text-xs text-[var(--cardinal)] opacity-90">
            Career Playbooks
          </p>
          <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-bold mt-3">
            Real Stories, Real Advice
          </h1>
          <p className="home-copy mt-4 text-white/80 max-w-2xl mx-auto text-lg">
            Alumni and students share their interview experiences, job journeys, internship stories, and career advice to help the community grow.
          </p>
        </div>
      </section>

      {/* ── Filter Pills ── */}
      <div className="max-w-5xl mx-auto px-6 -mt-5">
        <div className="flex flex-wrap gap-2 justify-center bg-white rounded-2xl shadow-md border border-slate-200 py-4 px-6">
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={`filter-pill ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Feed ── */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-slate-300 border-t-[var(--cardinal)] rounded-full animate-spin" />
            <p className="mt-3 text-slate-500">Loading stories…</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <svg className="mx-auto w-16 h-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <h3 className="text-xl font-bold text-slate-800 mt-4">No stories yet</h3>
            <p className="text-slate-500 mt-2">Be the first to share your experience!</p>
            <Link
              to="/career-playbooks/write"
              className="inline-block mt-5 px-6 py-2.5 rounded-full bg-[var(--cardinal)] text-white font-semibold hover:opacity-90 transition"
            >
              Write Your Story
            </Link>
          </div>
        ) : (
          <div className="grid gap-8">
            {experiences.map((exp) => (
              <Link
                key={exp.id}
                to={`/career-playbooks/${exp.id}`}
                className="playbook-card bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col-reverse md:flex-row justify-between p-6 gap-6"
              >
                {/* Content */}
                <div className="flex flex-col flex-1 min-w-0">
                  {/* Author at Top */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 flex-shrink-0 rounded-full bg-gradient-to-br from-[var(--cardinal)] to-[#b91c1c] flex items-center justify-center text-white font-bold text-[10px]">
                      {(exp.author_name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm text-slate-800 truncate">
                      <span className="font-semibold">{exp.author_name}</span>
                      <span className="text-slate-500 mx-1">in</span>
                      <span className="capitalize">{exp.category}</span>
                    </p>
                  </div>

                  <h2
                    className="text-xl md:text-2xl font-bold text-[#7d1111] leading-snug mb-2"
                    style={{ fontFamily: '"Playfair Display", serif' }}
                  >
                    {exp.title}
                  </h2>
                  
                  {exp.subtitle && (
                    <p className="text-slate-700 text-sm md:text-base leading-relaxed line-clamp-2 mb-4">
                      {exp.subtitle}
                    </p>
                  )}

                  <div className="mt-auto flex items-center gap-3 text-sm text-slate-500 font-medium">
                    <span>{formatDate(exp.created_at)}</span>
                    <span>·</span>
                    <span>{readingTime(exp.body)}</span>
                  </div>
                </div>

                {/* Cover image on Right (Desktop) / Top (Mobile) */}
                {exp.cover_image && (
                  <div className="w-full md:w-[200px] lg:w-[240px] flex-shrink-0">
                    <img
                      src={exp.cover_image}
                      alt=""
                      className="w-full h-48 md:h-[135px] lg:h-[160px] object-cover rounded-xl border border-slate-100"
                    />
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* ── Floating Write Button ── */}
      <Link to="/career-playbooks/write" className="floating-write-btn flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Write Your Story
      </Link>
    </div>
  )
}
