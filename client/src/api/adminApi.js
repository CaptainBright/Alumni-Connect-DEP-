import axios from 'axios'

const API_BASE = 'http://localhost:5001/api'

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true
})

export const fetchProfiles = async (status) => {
    try {
        const response = await api.get('/admin/profiles', {
            params: { status }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch profiles';
    }
};

export const approveProfile = async (id) => {
    try {
        const response = await api.post('/admin/approve', { id });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to approve profile';
    }
};

export const rejectProfile = async (id, notes) => {
    try {
        const response = await api.post('/admin/reject', { id, notes });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to reject profile';
    }
};
