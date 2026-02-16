import React, { useMemo, useState } from 'react'
import JobCard from '../components/JobCard'
import SearchBar from '../components/SearchBar'

const sampleJobs = [
  {
    _id: 1,
    title: 'Product Manager',
    company: 'FinEdge Technologies',
    location: 'Remote',
    description: 'Lead roadmap planning and execution for fintech growth products.',
    type: 'Full-time',
    skills: ['Product', 'Analytics', 'Stakeholder Mgmt'],
    url: '#'
  },
  {
    _id: 2,
    title: 'Data Engineer Intern',
    company: 'AI Labs',
    location: 'Bengaluru',
    description: 'Build and optimize data pipelines for machine learning platforms.',
    type: 'Internship',
    skills: ['Python', 'SQL', 'ETL'],
    url: '#'
  },
  {
    _id: 3,
    title: 'Software Developer',
    company: 'CloudSphere',
    location: 'Hyderabad',
    description: 'Develop scalable backend services and APIs for enterprise systems.',
    type: 'Full-time',
    skills: ['Node.js', 'PostgreSQL', 'AWS'],
    url: '#'
  }
]

export default function Jobs() {
  const [query, setQuery] = useState('')
  const [jobType, setJobType] = useState('All')

  const filteredJobs = useMemo(() => {
    return sampleJobs.filter((job) => {
      const matchesText = [job.title, job.company, job.location, job.description]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase())
      const matchesType = jobType === 'All' || job.type === jobType
      return matchesText && matchesType
    })
  }, [query, jobType])

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
      <section className="bg-white rounded-2xl border border-slate-200 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Jobs and Internship Board</h1>
            <p className="mt-2 text-slate-600">Opportunities shared by alumni, partners, and hiring managers.</p>
          </div>
          <button className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">
            Post Opportunity
          </button>
        </div>
      </section>

      <section className="mt-6 bg-white rounded-2xl border border-slate-200 p-5">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <SearchBar value={query} onChange={setQuery} placeholder="Search role, company, or location" />
          </div>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option>All</option>
            <option>Full-time</option>
            <option>Internship</option>
          </select>
        </div>
      </section>

      <section className="mt-6 space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600">
            No jobs found for the selected filters.
          </div>
        ) : (
          filteredJobs.map((job) => <JobCard key={job._id} job={job} />)
        )}
      </section>
    </div>
  )
}
