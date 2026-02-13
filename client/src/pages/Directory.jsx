// client/src/pages/Directory.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import AlumniCard from '../components/AlumniCard'
import SearchBar from '../components/SearchBar'
import Pagination from '../components/Pagination'

export default function Directory(){
  const [alumni, setAlumni] = useState([])
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 12
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({ year: 'All', branch: 'All' })
  const offset = (page - 1) * pageSize

  useEffect(() => {
    fetchProfiles()
    // eslint-disable-next-line
  }, [q, page, filters])

  async function fetchProfiles(){
    try {
      let qb = supabase
        .from('profiles')
        .select('*', { count: 'exact' })

      // Text search across name/company/branch (ilike)
      if (q && q.length > 0) {
        // use OR to search multiple columns
        qb = qb.or(
          `full_name.ilike.%${q}%,company.ilike.%${q}%,branch.ilike.%${q}%`
        )
      }

      if (filters.year !== 'All') qb = qb.eq('graduation_year', Number(filters.year))
      if (filters.branch !== 'All') qb = qb.eq('branch', filters.branch)

      // ordering and pagination
      qb = qb.order('full_name', { ascending: true }).range(offset, offset + pageSize - 1)

      const { data, error, count } = await qb

      if (error) throw error
      setAlumni(data || [])
      setTotalPages(Math.max(1, Math.ceil((count || (data?.length || 0)) / pageSize)))
    } catch (err) {
      console.error('Error fetching profiles:', err)
      setAlumni([])
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Alumni Directory</h2>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-4">
          <SearchBar value={q} onChange={setQ} placeholder="Search people, company, branch" />
          <div className="bg-white p-4 rounded-xl border">
            <h4 className="font-semibold">Filters</h4>
            <div className="mt-3 flex flex-col gap-2">
              <select value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value })} className="p-2 border rounded">
                <option>All</option>
                <option>2026</option>
                <option>2025</option>
                <option>2024</option>
                <option>2020</option>
                <option>2015</option>
              </select>
              <select value={filters.branch} onChange={e => setFilters({ ...filters, branch: e.target.value })} className="p-2 border rounded">
                <option>All</option>
                <option>Computer Science</option>
                <option>Electrical</option>
                <option>Mechanical</option>
              </select>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {alumni.map(a => <AlumniCard key={a.id} alumni={a} />)}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </main>
      </div>
    </div>
  )
}
