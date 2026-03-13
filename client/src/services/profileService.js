import { supabase } from '../lib/supabaseClient';

export const profileService = {
    /**
     * Fetch a user profile by ID
     * @param {string} userId
     * @returns {Promise<Object>} The user profile data
     */
    async getProfile(userId) {
        if (!userId) throw new Error('User ID is required');
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            console.error('Error fetching profile:', error.message);
            throw error;
        }
        return data;
    },

    /**
     * Update user profile fields
     * @param {string} userId - The ID of the user to update
     * @param {Object} updates - The fields to update
     * @returns {Promise<Object>} The updated profile data
     */
    async updateProfile(userId, updates) {
        if (!userId) throw new Error('User ID is required');
        if (!updates || Object.keys(updates).length === 0) return null;

        // We only pass fields that are relevant. Schema may vary, so we spread updates.
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error.message);
            throw error;
        }
        return data;
    }
};
