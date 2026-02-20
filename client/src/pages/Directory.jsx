import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import AlumniCard from '../components/AlumniCard'
import SearchBar from '../components/SearchBar'
import Pagination from '../components/Pagination'

const branchOptions = ['All', 'Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Chemical']

export default function Directory() {
  const [alumni, setAlumni] = useState([])
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [yearOptions, setYearOptions] = useState(['All'])
  const [filters, setFilters] = useState({ year: 'All', branch: 'All' })
  const pageSize = 12

  const offset = useMemo(() => (page - 1) * pageSize, [page])

  useEffect(() => {
    fetchProfiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page, filters])

  async function fetchProfiles() {
    try {
      let qb = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('approval_status', 'APPROVED')

      if (q && q.length > 0) {
        qb = qb.or(`full_name.ilike.%${q}%,company.ilike.%${q}%,branch.ilike.%${q}%`)
      }

      if (filters.year !== 'All') qb = qb.eq('graduation_year', Number(filters.year))
      if (filters.branch !== 'All') qb = qb.eq('branch', filters.branch)

      qb = qb.order('full_name', { ascending: true }).range(offset, offset + pageSize - 1)

      const { data, error, count } = await qb
      if (error) throw error

      setAlumni(data || [])
      setTotalPages(Math.max(1, Math.ceil((count || 0) / pageSize)))

      const years = [...new Set((data || []).map((item) => item.graduation_year).filter(Boolean))]
        .sort((a, b) => b - a)
      if (years.length > 0) setYearOptions(['All', ...years.map(String)])
    } catch (err) {
      console.error('Error fetching profiles:', err)
      setAlumni([])
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
      <section className="bg-white rounded-2xl border border-slate-200 p-8">
        <h2 className="text-3xl font-bold text-slate-900">Alumni Directory</h2>
        <p className="mt-2 text-slate-600">Search by name, company, branch, and graduation year.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <SearchBar value={q} onChange={setQ} placeholder="Search people, company, branch" />
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h4 className="font-semibold text-slate-900">Filters</h4>
            <div className="mt-3 flex flex-col gap-2">
              <select
                value={filters.year}
                onChange={(e) => {
                  setPage(1)
                  setFilters({ ...filters, year: e.target.value })
                }}
                className="p-2 border border-slate-300 rounded"
              >
                {yearOptions.map((year) => <option key={year}>{year}</option>)}
              </select>
              <select
                value={filters.branch}
                onChange={(e) => {
                  setPage(1)
                  setFilters({ ...filters, branch: e.target.value })
                }}
                className="p-2 border border-slate-300 rounded"
              >
                {branchOptions.map((branch) => <option key={branch}>{branch}</option>)}
              </select>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3">
          {alumni.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600">
              No matching alumni found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {alumni.map((member) => <AlumniCard key={member.id} alumni={member} />)}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </main>
      </div>
    </div>
  )
}
