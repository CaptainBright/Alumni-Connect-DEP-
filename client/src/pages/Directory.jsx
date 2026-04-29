import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Users, Search, Filter } from 'lucide-react'
import AlumniCard from '../components/AlumniCard'
import SearchBar from '../components/SearchBar'
import Pagination from '../components/Pagination'
import { useAuth } from '../hooks/useAuth'
import { useConnections } from '../hooks/useConnections'

const branchOptions = ['All', 'Computer Science', 'Electrical', 'Mechanical', 'Civil', 'Chemical']

export default function Directory() {
  const [alumni, setAlumni] = useState([])
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [yearOptions, setYearOptions] = useState(['All'])
  const [filters, setFilters] = useState({ year: 'All', branch: 'All' })
  // Show fewer items since cards are bigger
  const pageSize = 9

  const { user } = useAuth();
  const { connectionStatusMap, sendConnectionRequest, loading: loadingConnections } = useConnections();
  const location = useLocation();

  const isConnectionsTab = new URLSearchParams(location.search).get('tab') === 'connections';

  const offset = useMemo(() => (page - 1) * pageSize, [page])

  useEffect(() => {
    if (isConnectionsTab && loadingConnections) return;
    fetchProfiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page, filters, isConnectionsTab, loadingConnections])

  async function fetchProfiles() {
    try {
      let qb = supabase
        .from('alumni_directory')
        .select('*', { count: 'exact' })

      if (q && q.length > 0) {
        qb = qb.or(`full_name.ilike.%${q}%,company.ilike.%${q}%,branch.ilike.%${q}%`)
      }

      if (filters.year !== 'All') qb = qb.eq('graduation_year', Number(filters.year))
      if (filters.branch !== 'All') qb = qb.eq('branch', filters.branch)

      if (isConnectionsTab) {
        // Fetch a larger limit for categorization without strict pagination
        qb = qb.order('full_name', { ascending: true }).limit(200)
      } else {
        qb = qb.order('full_name', { ascending: true }).range(offset, offset + pageSize - 1)
      }

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
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm mb-8 relative">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Users className="w-64 h-64 text-[var(--cardinal)]" />
          </div>
          <div className="relative z-10 p-8 sm:p-10 md:p-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
              {isConnectionsTab ? 'My ' : 'Alumni '}<span className="text-[var(--cardinal)]">{isConnectionsTab ? 'Connections' : 'Directory'}</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl leading-relaxed">
              {isConnectionsTab
                ? 'Stay in touch with your professional network and manage your alumni connections.'
                : 'Reconnect with fellow graduates, explore exciting career paths, and expand your professional network across the globe.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-12 gap-8 items-start">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 xl:col-span-3 space-y-6 lg:sticky lg:top-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-slate-500" />
                <h4 className="text-base font-bold text-slate-900">Search</h4>
              </div>
              <SearchBar value={q} onChange={setQ} placeholder="Name, company, branch..." />
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Filter className="w-5 h-5 text-slate-500" />
                <h4 className="text-base font-bold text-slate-900">Filters</h4>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Graduation Year</label>
                  <div className="relative">
                    <select
                      value={filters.year}
                      onChange={(e) => {
                        setPage(1)
                        setFilters({ ...filters, year: e.target.value })
                      }}
                      className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:bg-white transition-all cursor-pointer"
                    >
                      {yearOptions.map((year) => <option key={year} value={year}>{year === 'All' ? 'All Years' : year}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Branch / Department</label>
                  <div className="relative">
                    <select
                      value={filters.branch}
                      onChange={(e) => {
                        setPage(1)
                        setFilters({ ...filters, branch: e.target.value })
                      }}
                      className="w-full appearance-none px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:bg-white transition-all cursor-pointer"
                    >
                      {branchOptions.map((branch) => <option key={branch} value={branch}>{branch === 'All' ? 'All Branches' : branch}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Grid Content */}
          <main className="lg:col-span-3 xl:col-span-9">
            {alumni.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                <Users className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-1">{isConnectionsTab ? 'No connections found' : 'No alumni found'}</h3>
                <p className="text-slate-500">{isConnectionsTab ? 'Try adjusting your search criteria or filters.' : 'Try adjusting your search criteria or filters.'}</p>
              </div>
            ) : isConnectionsTab ? (
              <div className="space-y-12">
                {/* 1. Accepted Connections */}
                {alumni.filter(a => connectionStatusMap[a.id] === 'ACCEPTED').length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Already Connected</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {alumni.filter(a => connectionStatusMap[a.id] === 'ACCEPTED').map((member) => (
                        <AlumniCard
                          key={member.id}
                          alumni={member}
                          currentUserId={user?.id}
                          connectionStatus={connectionStatusMap[member.id]}
                          onConnect={() => sendConnectionRequest(member.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}


                {/* 3. Discover (Not Connected) */}
                {alumni.filter(a => !connectionStatusMap[a.id] || connectionStatusMap[a.id] === 'REJECTED').length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Discover Connections</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {alumni.filter(a => !connectionStatusMap[a.id] || connectionStatusMap[a.id] === 'REJECTED').map((member) => (
                        <AlumniCard
                          key={member.id}
                          alumni={member}
                          currentUserId={user?.id}
                          connectionStatus={connectionStatusMap[member.id]}
                          onConnect={() => sendConnectionRequest(member.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {alumni.map((member) => (
                  <AlumniCard
                    key={member.id}
                    alumni={member}
                    currentUserId={user?.id}
                    connectionStatus={connectionStatusMap[member.id]}
                    onConnect={() => sendConnectionRequest(member.id)}
                  />
                ))}
              </div>
            )}

            {!isConnectionsTab && totalPages > 1 && (
              <div className="mt-10">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
