import axios from 'axios'

const API_BASE = (import.meta.env.VITE_SERVER_URL || 'http://localhost:5001') + '/api'

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

export const exportUsersExcel = async (filters = {}) => {
    try {
        const response = await api.get('/admin/export-users', {
            params: filters,
            responseType: 'blob',
        });

        // Build filename from Content-Disposition header or default
        const disposition = response.headers['content-disposition'];
        let filename = 'Alumni_Connect_Users.xlsx';
        if (disposition) {
            const match = disposition.match(/filename="?([^"]+)"?/);
            if (match) filename = match[1];
        }

        // Trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        throw error.response?.data?.message || 'Failed to export users';
    }
};

export const sendBroadcastEmail = async (payload) => {
    try {
        const response = await api.post('/admin/broadcast/email', payload);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to send broadcast emails';
    }
};
