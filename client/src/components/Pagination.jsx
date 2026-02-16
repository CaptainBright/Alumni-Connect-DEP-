import React from 'react'

export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null

  const prev = () => onPageChange(Math.max(1, page - 1))
  const next = () => onPageChange(Math.min(totalPages, page + 1))

  return (
    <div className="flex items-center gap-3 mt-6 justify-center">
      <button onClick={prev} className="px-4 py-1.5 rounded border border-slate-300 hover:bg-slate-50">
        Prev
      </button>
      <div className="text-sm text-slate-600">
        Page {page} of {totalPages}
      </div>
      <button onClick={next} className="px-4 py-1.5 rounded border border-slate-300 hover:bg-slate-50">
        Next
      </button>
    </div>
  )
}
