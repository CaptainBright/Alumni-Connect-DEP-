import axios from 'axios';

const API_BASE = (import.meta.env.VITE_SERVER_URL || 'http://localhost:5001') + '/api/connections';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true // sends the session cookie
});

export const connectionApi = {
  /**
   * Fetch all connections involving the user (both requested and received)
   */
  async getUserConnections(userId) {
    if (!userId) return [];
    try {
      const { data } = await api.get('/');
      return data.connections || [];
    } catch (err) {
      console.error('Error fetching connections:', err);
      return [];
    }
  },

  /**
   * Send a new connection request
   */
  async sendRequest(requesterId, receiverId) {
    const { data } = await api.post('/request', { receiverId });
    return data.connection;
  },

  /**
   * Update connection status (ACCEPT / REJECT)
   */
  async updateStatus(connectionId, newStatus) {
    const { data } = await api.put(`/${connectionId}/status`, { status: newStatus });
    return data.connection;
  },

  /**
   * Delete a connection (Reject completely)
   */
  async deleteConnection(connectionId) {
    const { data } = await api.delete(`/${connectionId}`);
    return data;
  }
};
