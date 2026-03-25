import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  ChevronRight,
  Linkedin,
  MessageSquare,
  UserPlus,
  Loader2
} from 'lucide-react'
import { handleMessage } from '../services/alumniCardActions'
import { profileService } from '../services/profileService'
import { getRecommendedAlumni } from '../services/recommendationEngine'
import { useAuth } from '../hooks/useAuth'
import { useConnections } from '../hooks/useConnections'
import { UserCheck, Clock } from 'lucide-react'

// Fallback Indian Mock Profiles
const fallbackMockAlumni = [
  {
    id: 'mock-1',
    full_name: 'Aditi Sharma',
    avatar_url: 'https://i.pravatar.cc/150?img=47',
    linkedin: 'https://linkedin.com/in/',
    company: 'Microsoft',
    branch: 'CSE',
    graduation_year: 2018,
    user_type: 'ALUMNI',
    recommendationScore: 'Mock'
  },
  {
    id: 'mock-2',
    full_name: 'Rahul Desai',
    avatar_url: 'https://i.pravatar.cc/150?img=11',
    linkedin: 'https://linkedin.com/in/',
    company: 'Atlassian',
    branch: 'MNC',
    graduation_year: 2020,
    user_type: 'ALUMNI',
    recommendationScore: 'Mock'
  },
  {
    id: 'mock-3',
    full_name: 'Priya Patel',
    avatar_url: 'https://i.pravatar.cc/150?img=32',
    linkedin: 'https://linkedin.com/in/',
    company: 'Amazon',
    branch: 'EE',
    graduation_year: 2019,
    user_type: 'ALUMNI',
    recommendationScore: 'Mock'
  }
]

export default function RecommendedAlumniSection({ currentProfile }) {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()
  
  const { user } = useAuth()
  const { connectionStatusMap, sendConnectionRequest } = useConnections()

  useEffect(() => {
    let mounted = true

    const fetchRecommendations = async () => {
      // Don't fetch if current user profile isn't fully loaded
      if (!currentProfile || !currentProfile.id) {
        if (mounted) setLoading(false)
        return
      }

      try {
        setLoading(true)
        const allAlumni = await profileService.getAllAlumni(currentProfile.id)
        
        // Execute client-side recommendation engine
        const topMatches = getRecommendedAlumni(currentProfile, allAlumni, 5)
        
        if (mounted) {
          setRecommendations(topMatches)
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to generate recommendations:', err)
        if (mounted) setLoading(false)
      }
    }

    fetchRecommendations()

    return () => {
      mounted = false
    }
  }, [currentProfile])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-[var(--cardinal)]" />
          Recommended Alumni for You
        </h2>
        <button 
          onClick={() => nav('/directory')}
          className="text-sm font-semibold text-[var(--cardinal)] hover:text-red-700 flex items-center gap-0.5"
        >
          See all <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid gap-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-xl">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-3" />
            <p className="text-sm text-slate-500 font-medium text-center">Finding the best connections based on your profile...</p>
          </div>
        ) : recommendations.length > 0 ? (
          recommendations.map((alumni) => {
            const status = connectionStatusMap[alumni.id];
            const isPending = status === 'PENDING_SENT' || status === 'PENDING_RECEIVED';
            const isConnected = status === 'ACCEPTED';
            return (
              <div key={alumni.id} className="flex flex-col p-4 border border-slate-100 bg-slate-50/50 rounded-xl hover:border-[var(--cardinal)] hover:bg-white hover:shadow-sm transition-all shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={alumni.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${alumni.full_name || 'User'}&backgroundColor=e2e8f0&textColor=475569`} 
                      alt={alumni.full_name} 
                      className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200" 
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {alumni.full_name}
                        {alumni.linkedin && (
                          <a href={alumni.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            <Linkedin className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium leading-tight my-0.5">
                        {alumni.company || (alumni.user_type === 'ALUMNI' ? 'Alumni' : 'Student')}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wide">
                        {alumni.branch || 'Branch N/A'} {alumni.graduation_year ? `• '${alumni.graduation_year.toString().slice(-2)}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={(!isPending && !isConnected) ? () => sendConnectionRequest(alumni.id) : undefined}
                    disabled={isPending || isConnected}
                    className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-bold border group overflow-hidden text-ellipsis whitespace-nowrap ${
                      isConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : isPending ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border-blue-100'
                    }`}
                  >
                    {isConnected ? (
                      <><UserCheck className="w-3.5 h-3.5" /> Connected</>
                    ) : isPending ? (
                      <><Clock className="w-3.5 h-3.5" /> Pending</>
                    ) : (
                      <><UserPlus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Connect</>
                    )}
                  </button>
                  <button
                    onClick={() => nav('/messages')}
                    className="flex-1 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-bold border border-slate-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Message
                  </button>
                </div>
                {/* Optional: Debug score visibility (can remove later if desired) */}
                <div className="mt-1.5 text-right">
                   <span className="text-[9px] font-bold text-slate-300 uppercase">Match Score: {alumni.recommendationScore}</span>
                </div>
              </div>
            );
          })
        ) : (
          fallbackMockAlumni.map((alumni) => (
            <div key={alumni.id} className="flex flex-col p-4 border border-slate-100 bg-slate-50/50 rounded-xl hover:border-[var(--cardinal)] hover:bg-white hover:shadow-sm transition-all shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={alumni.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${alumni.full_name || 'User'}&backgroundColor=e2e8f0&textColor=475569`} 
                    alt={alumni.full_name} 
                    className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200" 
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      {alumni.full_name}
                      {alumni.linkedin && (
                        <a href={alumni.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          <Linkedin className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-tight my-0.5">
                      {alumni.company || (alumni.user_type === 'ALUMNI' ? 'Alumni' : 'Student')}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-wide">
                      {alumni.branch || 'Branch N/A'} {alumni.graduation_year ? `• '${alumni.graduation_year.toString().slice(-2)}` : ''}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => handleConnect(alumni.id)}
                  className="flex-1 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-bold border border-blue-100 hover:border-blue-600 group"
                >
                  <UserPlus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Connect
                </button>
                <button
                  onClick={() => nav('/messages')}
                  className="flex-1 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs font-bold border border-slate-200"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Message
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
