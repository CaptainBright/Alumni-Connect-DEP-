import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { createExperience, updateExperience, fetchExperience } from '../api/experienceApi'
import RichTextEditor from '../components/RichTextEditor'
import '../styles/careerPlaybooks.css'

const categoryOptions = [
  { value: 'interview', label: 'Interview Experience' },
  { value: 'job', label: 'Job Experience' },
  { value: 'internship', label: 'Internship Experience' },
  { value: 'advice', label: 'Career Advice' },
]

export default function WriteExperience() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('advice')
  const [tags, setTags] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [loadingEdit, setLoadingEdit] = useState(!!editId)

  // Load existing experience if editing
  useEffect(() => {
    if (!editId) return
    setLoadingEdit(true)
    fetchExperience(editId)
      .then((data) => {
        setTitle(data.title || '')
        setSubtitle(data.subtitle || '')
        setBody(data.body || '')
        setCategory(data.category || 'advice')
        setTags((data.tags || []).join(', '))
        setCoverImage(data.cover_image || '')
      })
      .catch(() => {
        setError('Could not load experience for editing')
      })
      .finally(() => setLoadingEdit(false))
  }, [editId])

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!title.trim() || !body.trim()) {
      setError('Title and body are required')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        body: body.trim(),
        category,
        tags,
        cover_image: coverImage.trim(),
      }

      if (editId) {
        await updateExperience(editId, payload)
        navigate(`/career-playbooks/${editId}`)
      } else {
        const created = await createExperience(payload)
        navigate(`/career-playbooks/${created.id}`)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingEdit) {
    return (
      <div className="min-h-screen bg-[var(--sand)] flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-slate-300 border-t-[var(--cardinal)] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--sand)]">
      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/career-playbooks" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-1.5 rounded-full bg-[var(--cardinal)] text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? 'Publishing…' : editId ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* ── Cover Image ── */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Cover Image URL <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[var(--cardinal)] focus:ring-1 focus:ring-[var(--cardinal)] outline-none transition text-sm"
          />
          {coverImage && (
            <img src={coverImage} alt="Cover preview" className="mt-3 w-full h-40 object-cover rounded-lg border border-slate-100" />
          )}
        </div>

        {/* ── Category ── */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCategory(opt.value)}
                className={`filter-pill ${category === opt.value ? 'active' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Title ── */}
        <div className="mb-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            className="w-full text-3xl md:text-4xl font-bold text-slate-900 placeholder-slate-400 border-none outline-none bg-transparent"
            style={{ fontFamily: '"Playfair Display", serif' }}
          />
        </div>

        {/* ── Subtitle ── */}
        <div className="mb-6">
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Write a short description…"
            className="w-full text-lg text-slate-700 placeholder-slate-400 border-none outline-none bg-transparent"
            style={{ fontFamily: '"Source Sans 3", sans-serif' }}
          />
        </div>

        {/* ── Rich Text Editor ── */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Your Story
          </label>
          <RichTextEditor
            content={body}
            onChange={setBody}
            placeholder="Share your experience… Select text to format it, use the toolbar to add headings, images, links, and more."
          />
        </div>

        {/* ── Tags ── */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Tags <span className="text-slate-400 font-normal">(comma-separated)</span>
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. Google, SDE, DSA, System Design"
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-[var(--cardinal)] focus:ring-1 focus:ring-[var(--cardinal)] outline-none transition text-sm"
          />
          {tags && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => (
                <span key={tag} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Submit (mobile fallback) ── */}
        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-[var(--cardinal)] text-white font-bold text-base hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? 'Publishing…' : editId ? 'Update Story' : 'Publish Story'}
          </button>
        </div>
      </div>
    </div>
  )
}
