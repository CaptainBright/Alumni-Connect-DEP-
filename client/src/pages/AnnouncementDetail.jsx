import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { broadcastApi } from '../api/broadcastApi';
import { Megaphone, Paperclip, ArrowLeft, Loader2, Calendar } from 'lucide-react';

export default function AnnouncementDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchAndMark() {
      if (!user?.id) return;
      try {
        const data = await broadcastApi.getBroadcastById(id);
        if (!mounted) return;
        setAnnouncement(data);

        // Mark as read immediately when viewed
        await broadcastApi.markAsRead(id, user.id);
      } catch (err) {
        if (mounted) setError('Announcement not found or failed to load.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAndMark();

    return () => {
      mounted = false;
    };
  }, [id, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--cardinal)]" />
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-slate-200">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Announcement Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'The announcement you are looking for does not exist.'}</p>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--cardinal)] hover:text-red-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-red-100 shadow-[0_4px_20px_rgba(140,21,21,0.08)] overflow-hidden">
          {/* Header Banner */}
          <div className="bg-red-50 border-l-[6px] border-[var(--cardinal)] p-6 sm:p-8 flex items-start gap-4">
            <div className="mt-1 w-12 h-12 rounded-full bg-red-100 text-[var(--cardinal)] flex items-center justify-center shrink-0">
              <Megaphone className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-red-900 leading-tight mb-2">
                {announcement.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-red-700/80">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(announcement.created_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                {announcement.sender && (
                  <span className="flex items-center gap-2 border-l border-red-200 pl-4">
                    <img 
                      src={announcement.sender.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(announcement.sender.full_name)}&background=8C1515&color=fff`} 
                      alt={announcement.sender.full_name} 
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    By {announcement.sender.full_name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8">
            <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-slate-700">
              <p className="whitespace-pre-wrap">{announcement.content}</p>
            </div>

            {/* Attachment */}
            {announcement.attachment_url && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Attached Files</h3>
                <a 
                  href={announcement.attachment_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl transition-colors group"
                >
                  <Paperclip className="w-4 h-4 text-slate-400 group-hover:text-[var(--cardinal)] transition-colors" /> 
                  View Attachment
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
