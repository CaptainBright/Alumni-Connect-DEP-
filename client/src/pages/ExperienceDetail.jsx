import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

import { fetchExperience, deleteExperience } from '../api/experienceApi'
import { useAuth } from '../hooks/useAuth'
import '../styles/careerPlaybooks.css'

function readingTime(text) {
  const words = (text || '').split(/\s+/).length
  const mins = Math.max(1, Math.ceil(words / 200))
  return `${mins} min read`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function ExperienceDetail() {
  const { id } = useParams()
  const experienceId = (id || '').split('--')[0]
  const navigate = useNavigate()
  const { user, authStatus } = useAuth()
  const [exp, setExp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    fetchExperience(experienceId)
      .then((data) => {
        setExp(data)
        setLikeCount(data.likes || 0)
      })
      .catch(() => navigate('/career-playbooks'))
      .finally(() => setLoading(false))
  }, [experienceId, navigate])

  const isAuthor = user && exp && user.id === exp.author_id
  const isAdmin = authStatus === 'admin'

  const handleDelete = async () => {
    try {
      await deleteExperience(experienceId)
      navigate('/career-playbooks')
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleLike = () => {
    if (!liked) {
      setLiked(true)
      setLikeCount((c) => c + 1)
    } else {
      setLiked(false)
      setLikeCount((c) => Math.max(0, c - 1))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--sand)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-slate-300 border-t-[var(--cardinal)] rounded-full animate-spin" />
          <p className="mt-3 text-slate-500">Loading article…</p>
        </div>
      </div>
    )
  }

  if (!exp) return null

  return (
    <div className="min-h-screen bg-[var(--sand)]">
      {/* ── Cover Image ── */}
      {exp.cover_image && (
        <div className="w-full max-h-[420px] overflow-hidden">
          <img
            src={exp.cover_image}
            alt=""
            className="w-full h-[420px] object-cover"
          />
        </div>
      )}

      {/* ── Article Container ── */}
      <article className="max-w-3xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          to="/career-playbooks"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[var(--cardinal)] transition mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to stories
        </Link>

        {/* Author at top like full article */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--cardinal)] to-[#b91c1c] flex items-center justify-center text-white font-bold text-lg">
            {(exp.author_name || 'A').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">
              {exp.author_name} 
              <span className="text-slate-500 font-normal mx-1">in</span> 
              <span className="capitalize">{exp.category}</span>
            </p>
            <p className="reading-meta">
              {readingTime(exp.body)} · {formatDate(exp.created_at)}
            </p>
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--ink)] leading-tight mb-4"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          {exp.title}
        </h1>

        {/* Subtitle */}
        {exp.subtitle && (
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed" style={{ fontFamily: '"Source Sans 3", sans-serif' }}>
            {exp.subtitle}
          </p>
        )}

        {/* Action Bar */}
        <div className="mt-8 mb-8 flex items-center justify-between border-y border-slate-200 py-4">
          <div className="flex items-center gap-2">
            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition text-sm font-medium ${
                liked
                  ? 'bg-red-50 border-[var(--cardinal)] text-[var(--cardinal)]'
                  : 'border-slate-200 text-slate-500 hover:border-[var(--cardinal)] hover:text-[var(--cardinal)]'
              }`}
            >
              <svg className={`w-4 h-4 ${liked ? 'like-pop' : ''}`} viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              {likeCount}
            </button>
          </div>

          {/* Author / Admin controls */}
          {(isAuthor || isAdmin) && (
            <div className="flex items-center gap-2">
              {isAuthor && (
                <Link
                  to={`/career-playbooks/write?edit=${exp.id}`}
                  className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition text-sm font-medium"
                >
                  Edit
                </Link>
              )}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-300 transition text-sm font-medium"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* ── Article Body ── */}
          <div className="article-body" dangerouslySetInnerHTML={{ __html: exp.body }} />

        {/* ── Tags ── */}
        {exp.tags && exp.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-slate-200">
            <div className="flex flex-wrap gap-2">
              {exp.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Author footer ── */}
        <div className="mt-10 bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--cardinal)] to-[#b91c1c] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {(exp.author_name || 'A').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">Written by {exp.author_name}</p>
            <p className="text-sm text-slate-500 mt-0.5">
              {exp.author_role} · Published {formatDate(exp.created_at)}
            </p>
          </div>
        </div>
      </article>

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Delete this story?</h3>
            <p className="text-sm text-slate-500 mt-2">
              This action cannot be undone. The story will be permanently removed.
            </p>
            <div className="flex gap-3 mt-5 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
