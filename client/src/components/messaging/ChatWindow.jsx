import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, CheckCircle, Clock } from 'lucide-react';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBubble';
import { messagingApi } from '../../api/messagingApi';
import { useRealtimeMessages } from '../../hooks/useRealtimeMessages';

export default function ChatWindow({ conversation, currentUser, onConversationCreated, onMessagesRead }) {
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  // Hook handles subscribing to realtime inserts for this specific conversation id
  const { messages, setMessages } = useRealtimeMessages(conversation.isPlaceholder ? null : conversation.id);

  // Auto-scroll logic on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch full chat history
  useEffect(() => {
    let mounted = true;
    if (conversation.isPlaceholder) {
      setMessages([]);
      return;
    }
    
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const data = await messagingApi.fetchMessages(conversation.id);
        if (mounted) setMessages(data);
        
        // Instantly mark messages as read and clear local sidebar notification counts
        await messagingApi.markAsRead(conversation.id, currentUser.id);
        if (onMessagesRead) {
          onMessagesRead(conversation.id);
        }
        // Dispatch global event for Navbar to update the notification bubble
        window.dispatchEvent(new Event('messagesRead'));
      } catch (err) {
        console.error('Failed to load chat history', err);
      } finally {
        if (mounted) setLoadingHistory(false);
      }
    };
    fetchHistory();

    return () => { mounted = false; };
  }, [conversation.id, conversation.isPlaceholder, setMessages]);
  
  const handleSendMessage = async (text, file = null) => {
    if ((!text?.trim() && !file) || sending) return;
    setSending(true);

    try {
      let targetConversationId = conversation.id;
      
      // If this is a new connection without a thread, create the thread first
      if (conversation.isPlaceholder) {
        targetConversationId = await messagingApi.createConversation(
          currentUser.id, 
          conversation.participant.id, 
          'General Networking'
        );
        onConversationCreated(targetConversationId);
      }

      // Upload attachment if any
      let attachmentUrl = null;
      if (file) {
        attachmentUrl = await messagingApi.uploadAttachment(file, targetConversationId);
      }

      // 2. Persist message in Supabase
      const messageData = await messagingApi.sendMessage({
        conversation_id: targetConversationId,
        sender_id: currentUser.id,
        content: text || 'Shared an attachment',
        attachment_url: attachmentUrl,
        is_read: false,
        is_delivered: true
      });
      
      // Optimistically append to UI immediately
      setMessages(prev => {
        if (prev.find(m => m.id === messageData.id)) return prev;
        return [...prev, messageData];
      });
      
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      await messagingApi.editMessage(messageId, newContent);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: newContent, is_edited: true } : m));
    } catch (err) {
      console.error('Failed to edit message', err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await messagingApi.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  };

  const handleReactMessage = async (messageId, reaction) => {
    try {
      await messagingApi.reactToMessage(messageId, reaction);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reaction } : m));
    } catch (err) {
      console.error('Failed to react to message', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fbff]">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <img 
            src={conversation.participant.avatar_url} 
            alt={conversation.participant.full_name} 
            className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-sm" 
          />
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {conversation.participant.full_name}
            </h2>
            <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
              {conversation.participant.company} • {conversation.participant.role}
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border border-emerald-100">
                Alumni
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Context Badge (Feature request: "Conversation Context Tagging") */}
      {conversation.contextTag && (
        <div className="flex justify-center -mb-3 mt-3 z-10 max-w-xs mx-auto">
          <span className="bg-slate-800 text-white text-[10px] px-3 py-1 font-bold uppercase tracking-wide rounded-full shadow-md">
            Topic: {conversation.contextTag}
          </span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        {loadingHistory ? (
          <div className="flex h-full items-center justify-center">
            <div className="inline-block w-6 h-6 border-2 border-slate-300 border-t-[var(--cardinal)] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto flex flex-col justify-end min-h-full">
            {messages.length === 0 ? (
              <div className="text-center py-6 flex flex-col items-center">
                <div className="bg-yellow-50 text-yellow-800 text-[11px] font-medium px-4 py-2 rounded-lg max-w-xs shadow-sm border border-yellow-100 flex items-center justify-center gap-2">
                  <span className="text-sm">🔒</span>
                  Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  isOwnMessage={msg.sender_id === currentUser?.id} 
                  currentUserAvatar={currentUser?.avatar_url || currentUser?.profile_image}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                  onReact={handleReactMessage}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput onSendMessage={handleSendMessage} isUploading={sending} />
    </div>
  );
}
