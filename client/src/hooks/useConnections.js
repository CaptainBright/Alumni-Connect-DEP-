import { useState, useEffect } from 'react';
import { connectionApi } from '../api/connectionApi';
import { useAuth } from './useAuth';

export function useConnections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map representation: { "userId": "PENDING" | "ACCEPTED" }
  const [connectionStatusMap, setConnectionStatusMap] = useState({});

  useEffect(() => {
    if (!user) return;
    fetchConnections();
  }, [user]);

  async function fetchConnections() {
    setLoading(true);
    try {
      const data = await connectionApi.getUserConnections(user.id);
      setConnections(data);

      const statusMap = {};
      data.forEach(conn => {
        // Find the "other" person in this connection
        const otherId = conn.requester.id === user.id ? conn.receiver.id : conn.requester.id;
        // If I received it, and it's pending, I might want to know it's "INCOMING_PENDING" vs "OUTGOING_PENDING".
        // For simplicity, let's just mark the relationship status
        if (conn.status === 'PENDING') {
          statusMap[otherId] = conn.requester.id === user.id ? 'PENDING_SENT' : 'PENDING_RECEIVED';
        } else {
          statusMap[otherId] = conn.status; // 'ACCEPTED' etc.
        }
      });
      setConnectionStatusMap(statusMap);
    } catch (err) {
      console.error('Failed to fetch connections', err);
    } finally {
      setLoading(false);
    }
  }

  async function sendConnectionRequest(receiverId) {
    if (!user) return;
    try {
      await connectionApi.sendRequest(user.id, receiverId);
      // Optimistically update
      setConnectionStatusMap(prev => ({ ...prev, [receiverId]: 'PENDING_SENT' }));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async function acceptRequest(connectionId, requesterId) {
    try {
      await connectionApi.updateStatus(connectionId, 'ACCEPTED');
      setConnectionStatusMap(prev => ({ ...prev, [requesterId]: 'ACCEPTED' }));
      // Refetch to get populated data just in case
      fetchConnections();
    } catch (err) {
      console.error(err);
    }
  }

  async function rejectRequest(connectionId, requesterId) {
    try {
      await connectionApi.deleteConnection(connectionId);
      setConnectionStatusMap(prev => {
        const newMap = { ...prev };
        delete newMap[requesterId];
        return newMap;
      });
      fetchConnections();
    } catch (err) {
      console.error(err);
    }
  }

  return {
    connections,
    connectionStatusMap,
    loading,
    sendConnectionRequest,
    acceptRequest,
    rejectRequest,
    refreshConnections: fetchConnections
  };
}
