import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Custom hook to manage Supabase Realtime subscriptions for a specific conversation
 */
export function useRealtimeMessages(conversationId) {
  const [messages, setMessages] = useState([]);

  // Removing wrapper function to provide a stable reference to setMessages for useEffect hooks


  useEffect(() => {
    if (!conversationId) return;

    // 1. Set up the Realtime Subscription targeting the specific conversation_id
    const channel = supabase
      .channel(`realtime:messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // New message received!
          setMessages((prevMessages) => {
            // Prevent duplicates if optimistic update already added it
            if (prevMessages.find(m => m.id === payload.new.id)) return prevMessages;
            
            return [...prevMessages, payload.new];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // Handle message edits, reactions, or read receipts
          setMessages((prevMessages) => 
            prevMessages.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // Handle completely removing deleted messages from view automatically
          setMessages((prevMessages) => prevMessages.filter(m => m.id !== payload.old.id));
        }
      )
      .subscribe((status) => {
        // console.log(`Supabase Realtime status for ${conversationId}:`, status);
      });

    // Cleanup subscription on unmount or conversation change
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return { messages, setMessages };
}
