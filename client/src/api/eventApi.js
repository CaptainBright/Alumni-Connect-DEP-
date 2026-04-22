import { supabase } from '../lib/supabaseClient';

export const eventApi = {
  /**
   * Fetch all upcoming events, ordered by event_date ascending
   */
  async fetchUpcomingEvents() {
    const { data, error } = await supabase
      .from('events')
      .select(`
        id, title, description, event_date, event_time, location, created_by, created_at,
        creator:profiles!created_by(id, full_name, avatar_url)
      `)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Fetch all events (including past) for admin
   */
  async fetchAllEvents() {
    const { data, error } = await supabase
      .from('events')
      .select(`
        id, title, description, event_date, event_time, location, created_by, created_at,
        creator:profiles!created_by(id, full_name, avatar_url)
      `)
      .order('event_date', { ascending: false });

    if (error) {
      console.error('Error fetching all events:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Fetch the top N upcoming events (for dashboard widget)
   */
  async fetchTopUpcomingEvents(limit = 3) {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, event_date, event_time, location')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching top events:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Create a new event (Admin only)
   */
  async createEvent(payload) {
    const { data, error } = await supabase
      .from('events')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an event (Admin only)
   */
  async deleteEvent(eventId) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
    return true;
  }
};
