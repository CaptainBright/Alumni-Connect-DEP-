import React, { useState, useEffect } from 'react';
import ChatSidebar from '../components/messaging/ChatSidebar';
import ChatWindow from '../components/messaging/ChatWindow';
import AlumniActivityPanel from '../components/messaging/AlumniActivityPanel';
import { useAuth } from '../hooks/useAuth';
import { messagingApi } from '../api/messagingApi';
import { connectionApi } from '../api/connectionApi';
import { Loader2 } from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync data
  useEffect(() => {
    if (!user) return;
    
    let mounted = true;
    async function loadMessagingData() {
      try {
        setLoading(true);
        // 1. Fetch active conversations
        const activeConvs = await messagingApi.fetchConversations(user.id);
        
        // 2. Fetch accepted connections
        const conns = await connectionApi.getUserConnections(user.id);
        const acceptedConns = conns.filter(c => c.status === 'ACCEPTED');
        
        // 3. Merge: display accepted connections that don't have a chat thread as placeholders
        const existingParticipantIds = activeConvs.map(c => c.participant?.id);
        
        const placeholders = acceptedConns.reduce((acc, c) => {
          const otherProfile = c.requester.id === user.id ? c.receiver : c.requester;
          if (!existingParticipantIds.includes(otherProfile.id)) {
            acc.push({
              id: `new-${otherProfile.id}`,
              isPlaceholder: true,
              participant_one: user.id,
              participant_two: otherProfile.id,
              participant: otherProfile,
              lastMessageAt: c.updated_at,
              lastMessage: 'Start a conversation...',
              unreadCount: 0,
              status: 'New Connection'
            });
          }
          return acc;
        }, []);
        
        const sampleAlumni = [
          {
            id: 'sample-1',
            isPlaceholder: true,
            participant_one: user.id,
            participant_two: 'sample-1',
            participant: {
              id: 'sample-1',
              full_name: 'Priya Patel',
              company: 'Google',
              role: 'Software Engineer',
              avatar_url: 'https://i.pravatar.cc/150?img=43',
              user_type: 'Alumni'
            },
            lastMessageAt: new Date().toISOString(),
            lastMessage: 'Let me know if you need help!',
            unreadCount: 0,
            status: 'Sample'
          },
          {
            id: 'sample-2',
            isPlaceholder: true,
            participant_one: user.id,
            participant_two: 'sample-2',
            participant: {
              id: 'sample-2',
              full_name: 'Rahul Desai',
              company: 'Atlassian',
              role: 'Senior SDE',
              avatar_url: 'https://i.pravatar.cc/150?img=11',
              user_type: 'Alumni'
            },
            lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
            lastMessage: 'Sure, I can review your resume.',
            unreadCount: 0,
            status: 'Sample'
          }
        ];
        
        if (mounted) {
          setConversations([...activeConvs, ...placeholders, ...sampleAlumni]);
        }
      } catch (err) {
        console.error('Failed to load messaging data', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    loadMessagingData();
    return () => { mounted = false; };
  }, [user]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="bg-slate-100 min-h-[calc(100vh-64px)] p-2 sm:p-4 lg:p-6 flex justify-center">
      {/* 3-Column LinkedIn/WhatsApp Hybrid Layout */}
      <div className="w-full max-w-[1500px] h-[85vh] flex bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* LEFT COLUMN: Sidebar (Connections) - 25% width */}
        <div className="w-full md:w-[35%] lg:w-[25%] border-r border-slate-200 flex flex-col bg-white relative">
          {loading && (
            <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--cardinal)]" />
            </div>
          )}
          <ChatSidebar 
            conversations={conversations} 
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
          />
        </div>

        {/* CENTER COLUMN: Chat Window - 50% width */}
        <div className="hidden md:flex md:w-[65%] lg:w-[50%] flex-col bg-slate-50 relative">
          {activeConversation ? (
            <ChatWindow 
              conversation={activeConversation} 
              currentUser={user}
              onConversationCreated={(newId) => {
                // Instantly swap the placeholder ID with the real newly created thread ID in UI
                setActiveConversationId(newId);
                setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, id: newId, isPlaceholder: false } : c));
              }}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white">
              <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-5 shrink-0 shadow-sm">
                <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Alumni Communication Hub</h3>
              <p className="max-w-md text-sm text-slate-500 leading-relaxed font-medium">
                Engage in targeted mentorship discussions, seek career guidance, and review interview strategies with verified alumni.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Alumni Activity Feed - 25% width */}
        <div className="hidden lg:flex lg:w-[25%] flex-col bg-slate-50">
          <AlumniActivityPanel />
        </div>
        
      </div>
    </div>
  );
}
