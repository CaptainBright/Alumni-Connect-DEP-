import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { eventApi } from '../api/eventApi'
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Loader2,
  CalendarDays,
  X,
  Users,
  Sparkles
} from 'lucide-react'

function formatEventDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getMonthShort(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
}

function getDay(dateStr) {
  return new Date(dateStr + 'T00:00:00').getDate()
}

export default function Events() {
  const { user, authStatus } = useAuth()
  const isAdmin = authStatus === 'admin'

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
  })

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    setLoading(true)
    try {
      // Show ALL events for everyone (upcoming + past)
      const data = await eventApi.fetchAllEvents()
      setEvents(data)
    } catch (err) {
      console.error('Failed to load events:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await eventApi.createEvent({
        ...form,
        created_by: user.id,
      })
      setForm({ title: '', description: '', event_date: '', event_time: '', location: '' })
      setShowForm(false)
      loadEvents()
    } catch (err) {
      console.error('Failed to create event:', err)
      alert('Failed to create event. Make sure the events table exists in Supabase.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await eventApi.deleteEvent(id)
      setEvents(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      console.error('Failed to delete event:', err)
      alert('Failed to delete event.')
    } finally {
      setDeletingId(null)
    }
  }

  const isPastEvent = (dateStr) => {
    return new Date(dateStr + 'T23:59:59') < new Date()
  }

  const upcomingEvents = events.filter(e => !isPastEvent(e.event_date))
  const pastEvents = events.filter(e => isPastEvent(e.event_date))

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--cardinal)] to-red-700 flex items-center justify-center shadow-lg shadow-red-200/50">
                <CalendarDays className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Events</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Community events and activities
                </p>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowForm(v => !v)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--cardinal)] text-white font-semibold rounded-xl hover:bg-red-800 transition-all shadow-md shadow-red-200/40"
              >
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? 'Cancel' : 'Schedule Event'}
              </button>
            )}
          </div>
        </div>

        {/* Admin Create Form */}
        {isAdmin && showForm && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-[var(--cardinal)]" />
              <h2 className="text-lg font-bold text-slate-900">Schedule New Event</h2>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Event Title *</label>
                  <input
                    required type="text" value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Annual Alumni Meet"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Location *</label>
                  <input
                    required type="text" value={form.location}
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. Main Auditorium, IIT Ropar"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    required type="date" value={form.event_date}
                    onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text" value={form.event_time}
                    onChange={e => setForm(p => ({ ...p, event_time: e.target.value }))}
                    placeholder="e.g. 5:00 PM IST"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows="3"
                  placeholder="Describe the event details, agenda, and any requirements..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit" disabled={creating}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[var(--cardinal)] text-white font-bold rounded-xl hover:bg-red-800 disabled:opacity-50 transition-all shadow-sm"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
                  {creating ? 'Scheduling...' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-[var(--cardinal)]" />
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <CalendarDays className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">No events scheduled</h3>
            <p className="text-sm text-slate-500">Check back later for upcoming community events.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-[var(--cardinal)]" />
                  <h2 className="text-lg font-bold text-slate-900">Upcoming Events</h2>
                  <span className="ml-1 text-xs font-bold text-white bg-[var(--cardinal)] px-2 py-0.5 rounded-full">{upcomingEvents.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingEvents.map(event => (
                    <EventCard key={event.id} event={event} isPast={false} isAdmin={isAdmin} deletingId={deletingId} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <h2 className="text-lg font-bold text-slate-500">Past Events</h2>
                  <span className="ml-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{pastEvents.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pastEvents.map(event => (
                    <EventCard key={event.id} event={event} isPast={true} isAdmin={isAdmin} deletingId={deletingId} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function EventCard({ event, isPast, isAdmin, deletingId, onDelete }) {
  return (
    <div className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md ${
      isPast ? 'border-slate-200 opacity-70' : 'border-slate-200'
    }`}>
      {/* Top Color Bar */}
      <div className={`h-1.5 ${isPast ? 'bg-slate-300' : 'bg-gradient-to-r from-[var(--cardinal)] to-red-600'}`} />

      <div className="p-5">
        <div className="flex gap-4">
          {/* Date Box */}
          <div className={`w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 ${
            isPast ? 'bg-slate-100' : 'bg-gradient-to-br from-[var(--cardinal)] to-red-700'
          }`}>
            <span className={`text-xl font-black leading-none ${isPast ? 'text-slate-500' : 'text-white'}`}>
              {getDay(event.event_date)}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isPast ? 'text-slate-400' : 'text-white/80'}`}>
              {getMonthShort(event.event_date)}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-bold text-slate-900 leading-snug">{event.title}</h3>
              {isPast && (
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0 mt-0.5">
                  Completed
                </span>
              )}
            </div>

            {event.description && (
              <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">{event.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatEventDate(event.event_date)}
              </span>
              {event.event_time && (
                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {event.event_time}
                </span>
              )}
              {event.location && (
                <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {event.location}
                </span>
              )}
            </div>

            {/* Creator info */}
            {event.creator && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                  <Users className="w-3 h-3 text-slate-500" />
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  Organized by {event.creator.full_name || 'Admin'}
                </span>
              </div>
            )}

            {/* Admin delete */}
            {isAdmin && (
              <div className="mt-3">
                <button
                  onClick={() => onDelete(event.id)}
                  disabled={deletingId === event.id}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-700 transition"
                >
                  {deletingId === event.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  Delete Event
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
