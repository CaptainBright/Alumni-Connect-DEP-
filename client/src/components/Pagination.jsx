import React from 'react'

export default function Pagination({ page, totalPages, onPageChange }){
  if(!totalPages || totalPages<=1) return null
  const prev = () => onPageChange(Math.max(1, page-1))
  const next = () => onPageChange(Math.min(totalPages, page+1))
  return (
    <div className="flex items-center gap-3 mt-4">
      <button onClick={prev} className="px-3 py-1 rounded border">Prev</button>
      <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
      <button onClick={next} className="px-3 py-1 rounded border">Next</button>
    </div>
  )
}
