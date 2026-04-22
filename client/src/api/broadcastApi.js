import { supabase } from '../lib/supabaseClient';

export const broadcastApi = {
  /**
   * Send a new broadcast message (Admin only)
   */
  async sendBroadcast(payload) {
    const { data, error } = await supabase
      .from('admin_broadcasts')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetch broadcasts applicable to a specific user and attach isRead status
   */
  async fetchUserBroadcastsWithReadState(userId) {
    if (!userId) return [];

    // 1. Fetch user profile for targeting
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type, branch, graduation_year')
      .eq('id', userId)
      .maybeSingle();

    if (profileError || !userProfile) {
      console.error('Error fetching profile for broadcasts:', profileError);
      return [];
    }

    const { user_type, branch, graduation_year } = userProfile;

    // 2. Fetch all broadcasts
    const { data: broadcasts, error: broadcastsError } = await supabase
      .from('admin_broadcasts')
      .select(`
        id, title, content, target_role, target_branch, target_year, attachment_url, created_at,
        sender:profiles!sender_id(id, full_name, avatar_url, role)
      `)
      .order('created_at', { ascending: false });

    if (broadcastsError) {
      console.error('Error fetching broadcasts:', broadcastsError);
      return [];
    }

    // 3. Fetch read states for this user
    const { data: reads, error: readsError } = await supabase
      .from('announcement_reads')
      .select('announcement_id')
      .eq('user_id', userId);

    const readIds = new Set(reads?.map(r => r.announcement_id) || []);

    // 4. Filter for user and map read state
    return broadcasts
      .filter(broadcast => {
        const roleMatch = broadcast.target_role === 'All' || broadcast.target_role === user_type;
        const branchMatch = broadcast.target_branch === 'All' || !broadcast.target_branch || broadcast.target_branch === branch;
        const yearMatch = !broadcast.target_year || broadcast.target_year === graduation_year;
        return roleMatch && branchMatch && yearMatch;
      })
      .map(broadcast => ({
        ...broadcast,
        isRead: readIds.has(broadcast.id)
      }));
  },

  /**
   * Get total unread announcements for a user
   */
  async getUnreadCount(userId) {
    const broadcasts = await this.fetchUserBroadcastsWithReadState(userId);
    return broadcasts.filter(b => !b.isRead).length;
  },

  /**
   * Fetch a single broadcast by ID
   */
  async getBroadcastById(id) {
    const { data, error } = await supabase
      .from('admin_broadcasts')
      .select(`
        id, title, content, target_role, target_branch, target_year, attachment_url, created_at,
        sender:profiles!sender_id(id, full_name, avatar_url, role)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Mark a broadcast as read for a user
   */
  async markAsRead(announcementId, userId) {
    const { error } = await supabase
      .from('announcement_reads')
      .insert([{ announcement_id: announcementId, user_id: userId }])
      // Using upsert or ignoring error if already exists due to unique constraint
      // supabase-js doesn't have a built-in 'ON CONFLICT DO NOTHING' without an RPC or upsert
      // We will just catch the error if it's a unique violation
    
    if (error && error.code !== '23505') { // 23505 is unique_violation
      console.error('Error marking announcement as read:', error);
    }
  }
};
