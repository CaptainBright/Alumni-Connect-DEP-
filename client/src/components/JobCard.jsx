import React from 'react'

export default function JobCard({ job }) {
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
        <div className="text-right">
          <div className="text-sm font-medium text-[var(--cardinal)]">{job?.type}</div>
          <div className="mt-4">
            <a href={job?.url || '#'} className="inline-block px-3 py-1 rounded-md border border-slate-300 hover:bg-slate-50">
              Apply
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
