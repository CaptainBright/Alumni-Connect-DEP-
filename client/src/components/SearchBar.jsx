import React from 'react'

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="w-full">
      <label className="sr-only">Search</label>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-4 pr-11 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent"
          placeholder={placeholder}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">Search</div>
      </div>
    </div>
  )
}
