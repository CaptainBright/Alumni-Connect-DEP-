import { supabase } from '../lib/supabaseClient';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_SERVER_URL 
  ? `${import.meta.env.VITE_SERVER_URL}/api/profile` 
  : 'http://localhost:5001/api/profile';

const profileClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

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

        try {
            const response = await profileClient.put('/update', updates);
            return response.data.profile;
        } catch (error) {
            console.error('Error updating profile:', error.response?.data?.message || error.message);
            throw new Error(error.response?.data?.message || 'Failed to update profile');
        }
    },

    /**
     * Fetch all approved alumni for recommendations (excluding current user)
     * @param {string} currentUserId 
     * @returns {Promise<Array>} List of alumni profiles
     */
    async getAllAlumni(currentUserId) {
        if (!currentUserId) return [];
        
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, branch, graduation_year, company, skills, interests, linkedin, avatar_url, user_type')
            .eq('approval_status', 'APPROVED')
            .neq('id', currentUserId);

        if (error) {
            console.error('Error fetching alumni for recommendations:', error.message);
            return [];
        }
        return data;
    }
};
