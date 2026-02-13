import React from 'react'

export default function SearchBar({ value, onChange, placeholder = 'Search...' }){
  return (
    <div className="w-full">
      <label className="sr-only">Search</label>
      <div className="relative">
        <input
          value={value}
          onChange={e=>onChange(e.target.value)}
          className="w-full pl-4 pr-10 py-2 rounded-lg border focus:ring-2 focus:ring-[var(--cardinal)]"
          placeholder={placeholder}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">↵</div>
      </div>
    </div>
  )
}
