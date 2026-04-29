import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useConnections } from '../../hooks/useConnections';
import { UserPlus, CheckCircle, XCircle } from 'lucide-react';

export default function ConnectionRequests() {
  const { user } = useAuth();
  const { connections, loading, acceptRequest, rejectRequest } = useConnections();
  const [rejectingAll, setRejectingAll] = useState(false);

  if (loading) return null;

  // Filter only incoming requests that are PENDING
  const incomingRequests = connections.filter(
    c => c.receiver.id === user?.id && c.status === 'PENDING'
  );

  if (incomingRequests.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-6">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[var(--cardinal)]" />
            Pending Connection Requests
          </h3>
          <span className="bg-[var(--cardinal)] text-white text-xs font-bold px-2 py-1 rounded-full">
            {incomingRequests.length} New
          </span>
        </div>
        <button
          onClick={async () => {
            setRejectingAll(true);
            for (const req of incomingRequests) {
              await rejectRequest(req.id, req.requester.id);
            }
            setRejectingAll(false);
          }}
          disabled={rejectingAll}
          className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50"
        >
          {rejectingAll ? 'Rejecting...' : 'Reject All'}
        </button>
      </div>
      
      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
        {incomingRequests.map((req) => (
          <div key={req.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <img 
                src={req.requester.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${req.requester.full_name}`} 
                alt="Avatar" 
                className="w-12 h-12 rounded-full border border-slate-200 object-cover shadow-sm"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{req.requester.full_name}</h4>
                <p className="text-xs text-slate-500 font-medium">{req.requester.role} at {req.requester.company}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Requested on {new Date(req.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => acceptRequest(req.id, req.requester.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors text-xs font-bold shadow-sm border border-emerald-100 hover:border-emerald-600"
              >
                <CheckCircle className="w-4 h-4" /> Accept
              </button>
              <button 
                onClick={() => rejectRequest(req.id, req.requester.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white rounded-lg transition-colors text-xs font-bold shadow-sm border border-red-100 hover:border-red-600"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
