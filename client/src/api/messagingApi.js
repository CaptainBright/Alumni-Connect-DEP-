import { supabase } from '../lib/supabaseClient';

export const messagingApi = {
  
  // 1. Fetch all conversations for the active user
  async fetchConversations(userId) {
    if (!userId) return [];
    
    // We want all conversations where user is participant one or two
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id, context_tag, status, last_message_at,
        participant_one, participant_two
      `)
      .or(`participant_one.eq.${userId},participant_two.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    // Now manually enrich with participant profiles
    // Due to basic Supabase foreign key structures, we fetch profiles manually
    // or rely on a Supabase View. For scale, we'd use an SQL view of 'user_conversations'.
    const conversationIds = data.map(c => c.id);
    
    // Get latest message snippet per conversation
    const { data: latestMessages } = await supabase
      .from('messages')
      .select('conversation_id, content, is_read, sender_id')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false });

    // Build unique participant IDs
    const otherParticipantIds = [...new Set(data.map(c => 
      c.participant_one === userId ? c.participant_two : c.participant_one
    ))];

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, company, role, user_type')
      .in('id', otherParticipantIds);

    const enrichedConversations = data.map(conv => {
      const otherId = conv.participant_one === userId ? conv.participant_two : conv.participant_one;
      const participantProfile = profiles?.find(p => p.id === otherId);
      const lastMsg = latestMessages?.find(m => m.conversation_id === conv.id);
      
      return {
        ...conv,
        participant: participantProfile || { id: otherId, full_name: 'Unknown User' },
        lastMessage: lastMsg ? lastMsg.content : 'No messages yet',
        unreadCount: (lastMsg && !lastMsg.is_read && lastMsg.sender_id !== userId) ? 1 : 0
      };
    });

    return enrichedConversations;
  },

  // 1.5 Create a new conversation
  async createConversation(user1, user2, contextTag = 'General Networking') {
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        participant_one: user1,
        participant_two: user2,
        context_tag: contextTag,
        status: 'Active'
      }])
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  // 2. Fetch messages for a specific conversation
  async fetchMessages(conversationId) {
    if (!conversationId) return [];
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id, conversation_id, sender_id, content, attachment_url, 
        is_read, is_delivered, is_career_insight, reaction, created_at,
        sender:profiles!sender_id(id, full_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    return data;
  },

  // 3. Send a new message
  async sendMessage(payload) {
    const { data, error } = await supabase
      .from('messages')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', payload.conversation_id);
      
    return data;
  },

  // 4. Mark messages as read
  async markAsRead(conversationId, userId) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);
      
    if (error) console.error('Error marking as read:', error);
  },

  // 5. Upload an attachment file
  async uploadAttachment(file, conversationId) {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${conversationId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('message_attachments')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('message_attachments')
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  // 6. Edit a message
  async editMessage(messageId, newContent) {
    const { error } = await supabase
      .from('messages')
      .update({ content: newContent, is_edited: true })
      .eq('id', messageId);
      
    if (error) throw error;
    return true;
  },

  // 7. Delete a message
  async deleteMessage(messageId) {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);
      
    if (error) throw error;
    return true;
  },

  // 8. Add or update an emoji reaction
  async reactToMessage(messageId, reaction) {
    const { error } = await supabase
      .from('messages')
      .update({ reaction })
      .eq('id', messageId);
      
    if (error) throw error;
    return true;
  },

  // 9. Get total unread conversations count for a user
  async getUnreadMessageCount(userId) {
    if (!userId) return 0;
    
    // Safety check: Explicitly retrieve all conversations this user is part of
    const { data: userConvs, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .or(`participant_one.eq.${userId},participant_two.eq.${userId}`);
      
    if (convError || !userConvs || userConvs.length === 0) return 0;
    
    // Isolate those specific conversation IDs
    const myConvoIds = userConvs.map(c => c.id);

    // Fetch unread messages specifically within the user's threads
    const { data, error } = await supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', myConvoIds)
      .neq('sender_id', userId)
      .eq('is_read', false);
      
    if (error) {
      console.error('Error fetching global unread count:', error);
      return 0;
    }
    // Count unique conversation IDs
    const uniqueThreads = new Set(data.map(m => m.conversation_id));
    return uniqueThreads.size;
  }
};
