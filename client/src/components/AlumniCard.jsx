import React from 'react'
import { UserPlus, UserCheck, Clock, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AlumniCard({ alumni, currentUserId, connectionStatus, onConnect }) {
  const nav = useNavigate();
  const isSelf = currentUserId === alumni?.id;
  const isPending = connectionStatus === 'PENDING_SENT' || connectionStatus === 'PENDING_RECEIVED';
  const isConnected = connectionStatus === 'ACCEPTED';
  return (
    <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group flex flex-col h-full">
      {/* Cover Banner */}
      <div className="h-24 bg-gradient-to-r from-[var(--cardinal)] to-red-800"></div>

      <div className="px-5 pb-5 flex-1 flex flex-col relative">
        {/* Profile Photo */}
        <div className="flex justify-center -mt-16 mb-3">
          <div className="h-32 w-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-md">
            <img
              src={alumni?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(alumni?.full_name || 'User')}&backgroundColor=e2e8f0&textColor=475569`}
              alt={alumni?.full_name || 'avatar'}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Text Details */}
        <div className="text-center flex-1">
          <h3 className="text-lg font-bold text-slate-900 leading-tight">
            {alumni?.full_name || 'Unnamed'}
          </h3>
          <p className="text-sm font-medium text-slate-700 mt-1">
            {alumni?.role || 'No Role Listed'}
          </p>
          <div className="mt-2 flex justify-center">
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${
              (alumni?.user_type === 'Student') 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {alumni?.user_type === 'Student' ? 'Student' : 'Alumni'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {alumni?.company || 'No Company Listed'}
          </p>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 w-full text-center text-xs text-slate-500">
            <div>
              <span className="block font-semibold text-slate-800">Branch</span>
              {alumni?.branch || 'N/A'}
            </div>
            <div>
              <span className="block font-semibold text-slate-800">Class of</span>
              {alumni?.graduation_year || 'N/A'}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-center gap-2">
          {alumni?.linkedin && (
            <a
              href={alumni.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-center py-2 text-sm font-semibold rounded-lg bg-slate-100 text-[#0a66c2] hover:bg-slate-200 transition"
            >
              LinkedIn
            </a>
          )}

          {!isSelf && (
            isConnected ? (
              <div className="flex w-full gap-2">
                <button className="flex-1 py-2 text-sm font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-1.5 pointer-events-none">
                  <UserCheck className="w-4 h-4" /> Connected
                </button>
                <button 
                  onClick={() => nav(`/messages`)} 
                  className="flex-1 py-2 text-sm font-semibold rounded-lg bg-[var(--cardinal)] text-white hover:opacity-90 flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" /> Message
                </button>
              </div>
            ) : (
              <button
                onClick={!isPending ? onConnect : undefined}
                disabled={isPending}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition overflow-hidden text-ellipsis whitespace-nowrap ${
                  isPending ? 'bg-slate-100 text-slate-500 border border-slate-200'
                  : 'bg-[var(--cardinal)] text-white hover:opacity-90 shadow-sm'
                }`}
              >
                {isPending ? (
                  <><Clock className="w-4 h-4" /> Pending</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Connect</>
                )}
              </button>
            )
          )}
        </div>
      </div>
    </article>
  )
}
