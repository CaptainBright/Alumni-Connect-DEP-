import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { createExperience, updateExperience, fetchExperience } from '../api/experienceApi'
import { uploadCoverImage } from '../lib/upload'
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
  const [uploadingCover, setUploadingCover] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const coverInputRef = useRef(null)
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

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, WebP, or GIF).')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.')
      return
    }

    try {
      setUploadingCover(true)
      setError('')
      const publicUrl = await uploadCoverImage(file)
      setCoverImage(publicUrl)
    } catch (err) {
      console.error('Cover upload failed:', err)
      setError('Failed to upload cover image. Please try again.')
    } finally {
      setUploadingCover(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

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
            Cover Image <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <div className="flex flex-col gap-3">
            {!coverImage ? (
              <div 
                onClick={() => !uploadingCover && coverInputRef.current?.click()}
                className={`w-full h-32 md:h-40 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 text-slate-500 transition cursor-pointer hover:bg-slate-100 hover:border-slate-400 ${uploadingCover ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {uploadingCover ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-slate-300 border-t-[var(--cardinal)] rounded-full animate-spin" />
                    <span className="text-sm font-medium">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 mb-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">Click to upload cover image</span>
                    <span className="text-xs text-slate-400 mt-1">JPG, PNG, WebP or GIF (max 5MB)</span>
                  </>
                )}
              </div>
            ) : (
              <div className="relative group rounded-xl overflow-hidden border border-slate-200">
                <img 
                  src={coverImage} 
                  alt="Cover preview" 
                  className={`w-full h-48 md:h-64 object-cover ${uploadingCover ? 'opacity-50' : ''}`} 
                />
                
                {/* Overlay actions */}
                <div className="absolute inset-x-0 bottom-0 top-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploadingCover ? (
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="px-4 py-2 bg-white text-slate-800 text-sm font-semibold rounded-lg hover:bg-slate-100 transition shadow-sm"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition shadow-sm"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
            
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleCoverUpload}
              disabled={uploadingCover}
            />
          </div>
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