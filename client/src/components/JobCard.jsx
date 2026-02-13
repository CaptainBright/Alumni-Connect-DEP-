import React from 'react'

export default function JobCard({ job }){
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-semibold">{job?.title}</h4>
          <div className="text-sm text-gray-500">{job?.company} • {job?.location}</div>
          <p className="mt-2 text-sm text-gray-600">{job?.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-[var(--cardinal)]">{job?.type}</div>
          <div className="mt-4">
            <a href={job?.url || '#'} className="inline-block px-3 py-1 rounded-md border">Apply</a>
          </div>
        </div>
      </div>
    </div>
  )
}
