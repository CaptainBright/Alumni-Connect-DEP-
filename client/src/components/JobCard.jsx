import React from 'react'
import { ExternalLink } from 'lucide-react'

export default function JobCard({ job }) {
  const handleApply = () => {
    if (job?.url && job.url !== '#') {
      window.open(job.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 text-lg">{job?.title}</h4>
          <div className="text-sm text-slate-500">{job?.company} | {job?.location}</div>
          <p className="mt-2 text-sm text-slate-600">{job?.description}</p>
          {job?.skills?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span key={skill} className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full border ${
            job?.type === 'Internship'
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : job?.type === 'Part-time'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : job?.type === 'Contract'
              ? 'bg-sky-50 text-sky-700 border-sky-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {job?.type}
          </span>
          <div className="mt-4">
            <button
              onClick={handleApply}
              disabled={!job?.url || job.url === '#'}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold border border-[var(--cardinal)] text-[var(--cardinal)] hover:bg-[var(--cardinal)] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Apply
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
