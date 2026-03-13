import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { fetchJobs, createJob } from '../api/jobApi'
import JobCard from '../components/JobCard'
import SearchBar from '../components/SearchBar'
import {
  Briefcase,
  Plus,
  X,
  Loader2,
  SlidersHorizontal,
  MapPin
} from 'lucide-react'

const typeOptions = ['All', 'Full-time', 'Internship', 'Part-time', 'Contract']

export default function Jobs() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [jobType, setJobType] = useState('All')
  const [locationFilter, setLocationFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Determine if user can post (Alumni, Admin, Faculty — NOT Student)
  const userRole = (user?.role || '').toLowerCase()
  const canPost = userRole === 'alumni' || userRole === 'admin' || userRole === 'faculty'

  // ------- LOAD JOBS -------
  const loadJobs = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchJobs()
      setJobs(data || [])
    } catch (err) {
      console.error('Error loading jobs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  // ------- DERIVED -------
  const locationOptions = useMemo(() => {
    const locs = [...new Set(jobs.map((j) => j.location).filter(Boolean))].sort()
    return ['All', ...locs]
  }, [jobs])

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesText = [job.title, job.company, job.location, job.description, ...(job.skills || [])]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase())
      const matchesType = jobType === 'All' || job.type === jobType
      const matchesLocation = locationFilter === 'All' || job.location === locationFilter
      return matchesText && matchesType && matchesLocation
    })
  }, [jobs, query, jobType, locationFilter])

  // ------- POST JOB -------
  const handlePostJob = async (e) => {
    e.preventDefault()
    setFormError('')
    const form = e.target
    const title = form.title.value.trim()
    const company = form.company.value.trim()
    const location = form.location.value.trim() || 'Remote'
    const type = form.type.value
    const description = form.description.value.trim()
    const skills = form.skills.value.trim()
    const url = form.url.value.trim()

    if (!title || !company) {
      setFormError('Title and Company are required.')
      return
    }

    try {
      setSubmitting(true)
      await createJob({ title, company, location, type, description, skills, url })
      setShowModal(false)
      loadJobs() // refresh list
    } catch (err) {
      console.error('Error posting job:', err)
      setFormError(err.response?.data?.message || 'Failed to post job. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
      {/* Header */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2.5">
              <Briefcase className="w-7 h-7 text-[var(--cardinal)]" />
              Jobs &amp; Internship Board
            </h1>
            <p className="mt-2 text-slate-600">Opportunities shared by alumni, partners, and hiring managers.</p>
          </div>
          {canPost && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--cardinal)] text-white font-semibold text-sm hover:opacity-90 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Post Opportunity
            </button>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="mt-6 bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">Filters</span>
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <SearchBar value={query} onChange={setQuery} placeholder="Search role, company, skill, or location" />
          </div>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent"
          >
            {typeOptions.map((t) => (
              <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>
            ))}
          </select>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent"
          >
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {loc === 'All' ? 'All Locations' : loc}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Job list */}
      <section className="mt-6 space-y-4">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600">
            No jobs found for the selected filters.
          </div>
        ) : (
          filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </section>

      {/* ---- POST OPPORTUNITY MODAL ---- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Post an Opportunity</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePostJob} className="p-6 space-y-4">
              {formError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{formError}</div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Job Title *</label>
                <input name="title" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent" placeholder="e.g. Software Engineer" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Company *</label>
                <input name="company" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent" placeholder="e.g. Google" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input name="location" className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent" placeholder="Remote" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
                  <select name="type" defaultValue="Full-time" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent">
                    <option>Full-time</option>
                    <option>Internship</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea name="description" rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent resize-none" placeholder="Brief description of the role..." />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Skills <span className="font-normal text-slate-400">(comma-separated)</span></label>
                <input name="skills" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent" placeholder="React, Node.js, SQL" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Apply Link (URL)</label>
                <input name="url" type="url" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent" placeholder="https://careers.example.com/apply" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[var(--cardinal)] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Posting...' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
