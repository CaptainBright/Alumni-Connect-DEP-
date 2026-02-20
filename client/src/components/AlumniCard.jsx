import React from 'react'

export default function AlumniCard({ alumni }) {
  return (
    <article className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center gap-4">
        <img
          src={alumni?.avatar_url || '/image.png'}
          alt={alumni?.full_name || 'avatar'}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900">{alumni?.full_name || 'Unnamed'}</h3>
          <p className="text-xs text-slate-500">
            {alumni?.role || 'Alumni Member'} {alumni?.company ? ` | ${alumni.company}` : ''}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {alumni?.branch || 'Branch not listed'} {alumni?.graduation_year ? ` | Class of ${alumni.graduation_year}` : ''}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2">
          <a
            href={alumni?.linkedin || '#'}
            target="_blank"
            rel="noreferrer"
            className="text-sm px-3 py-1 rounded-md border border-slate-300 hover:bg-slate-50"
          >
            LinkedIn
          </a>
          <button className="text-sm px-3 py-1 rounded-md bg-[var(--cardinal)] text-white hover:opacity-90 transition">
            Connect
          </button>
        </div>
        <div className="text-xs text-slate-400">
          {alumni?.created_at ? new Date(alumni.created_at).toLocaleDateString() : ''}
        </div>
      </div>
    </article>
  )
}
