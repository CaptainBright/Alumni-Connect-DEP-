import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { broadcastApi } from '../api/broadcastApi'
import { Bell, Megaphone, Trash2, Loader2, CheckCheck } from 'lucide-react'

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function Notifications() {
  const { user, authStatus } = useAuth()
  const isAdmin = authStatus === 'admin'
  const [broadcasts, setBroadcasts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (!user?.id) return
    let mounted = true
    setLoading(true)
    broadcastApi.fetchUserBroadcastsWithReadState(user.id)
      .then(data => {
        if (mounted) setBroadcasts(data)
      })
      .catch(err => console.error('Error fetching notifications:', err))
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [user?.id])

  const handleMarkRead = async (id) => {
    if (!user?.id) return
    await broadcastApi.markAsRead(id, user.id)
    setBroadcasts(prev => prev.map(b => b.id === id ? { ...b, isRead: true } : b))
    window.dispatchEvent(new Event('messagesRead'))
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement for all users? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await broadcastApi.deleteBroadcast(id)
      setBroadcasts(prev => prev.filter(b => b.id !== id))
      window.dispatchEvent(new Event('messagesRead'))
    } catch (err) {
      console.error('Failed to delete broadcast:', err)
      alert('Failed to delete notification.')
    } finally {
      setDeletingId(null)
    }
  }

  const unreadCount = broadcasts.filter(b => !b.isRead).length

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--cardinal)] to-red-700 flex items-center justify-center shadow-lg shadow-red-200/50">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Notifications</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You\'re all caught up'}
              </p>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-[var(--cardinal)]" />
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <Bell className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">No notifications yet</h3>
            <p className="text-sm text-slate-500">When announcements are sent, they'll appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {broadcasts.map((item) => (
              <div
                key={item.id}
                className={`group bg-white rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden ${
                  item.isRead
                    ? 'border-slate-200'
                    : 'border-l-4 border-l-[var(--cardinal)] border-t border-r border-b border-slate-200 bg-red-50/30'
                }`}
              >
                <div className="p-5">
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className={`mt-0.5 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      item.isRead ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-[var(--cardinal)]'
                    }`}>
                      <Megaphone className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <Link
                          to={`/announcements/${item.id}`}
                          onClick={() => !item.isRead && handleMarkRead(item.id)}
                          className="hover:underline"
                        >
                          <h3 className={`text-base ${item.isRead ? 'font-semibold text-slate-700' : 'font-bold text-slate-900'}`}>
                            {item.title}
                          </h3>
                        </Link>
                        <span className={`text-xs font-semibold whitespace-nowrap ${item.isRead ? 'text-slate-400' : 'text-slate-500'}`}>
                          {timeAgo(item.created_at)}
                        </span>
                      </div>

                      <p className={`text-sm leading-relaxed line-clamp-2 ${item.isRead ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                        {item.content}
                      </p>

                      {item.sender && (
                        <p className="text-xs text-slate-400 mt-2">
                          From: {item.sender.full_name || 'Admin'}
                        </p>
                      )}

                      {/* Actions row */}
                      <div className="flex items-center gap-3 mt-3">
                        {!item.isRead && (
                          <button
                            onClick={() => handleMarkRead(item.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                          >
                            <CheckCheck className="w-3.5 h-3.5" /> Mark as read
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-700 transition ml-auto"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            Delete for all
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
