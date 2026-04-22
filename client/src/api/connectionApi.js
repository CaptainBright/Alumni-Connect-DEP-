import { supabase } from '../lib/supabaseClient';

export const connectionApi = {
  /**
   * Fetch all connections involving the user (both requested and received)
   */
  async getUserConnections(userId) {
    if (!userId) return [];

    const { data, error } = await supabase
      .from('connections')
      .select(`
        id, status, created_at,
        requester:profiles!requester_id(id, full_name, avatar_url, role, company, user_type),
        receiver:profiles!receiver_id(id, full_name, avatar_url, role, company, user_type)
      `)
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching connections:', error);
      return [];
    }
    return data;
  },

  /**
   * Send a new connection request
   */
  async sendRequest(requesterId, receiverId) {
    // Check if backwards request exists already
    const { data: existing } = await supabase
      .from('connections')
      .select('id, status')
      .or(`and(requester_id.eq.${requesterId},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${requesterId})`)
      .maybeSingle();

    if (existing) {
      throw new Error(`Connection request already exists with status: ${existing.status}`);
    }

    const { data, error } = await supabase
      .from('connections')
      .insert([{
        requester_id: requesterId,
        receiver_id: receiverId,
        status: 'PENDING'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update connection status (ACCEPT / REJECT)
   */
  async updateStatus(connectionId, newStatus) {
    const { data, error } = await supabase
      .from('connections')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', connectionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
