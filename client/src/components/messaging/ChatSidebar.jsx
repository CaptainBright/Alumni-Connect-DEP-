import React, { useState, useRef } from 'react';
import { Search, Filter, MessageSquareCode, Camera, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function ChatSidebar({ conversations, activeConversationId, onSelectConversation, currentUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${currentUser.id}-${Date.now()}.${fileExt}`;
  
      const { error: uploadError } = await supabase.storage
        .from('message_attachments')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('message_attachments')
        .getPublicUrl(fileName);
        
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', currentUser.id);
        
      if (updateError) throw updateError;
      
      window.location.reload();
      
    } catch (err) {
      console.error('Failed to upload avatar', err);
      alert('Failed to upload profile picture. Try again.');
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const filteredConversations = conversations.filter(c => {
    const term = searchTerm.toLowerCase();
    const p = c.participant || {};
    const matchesSearch = (p.full_name || '').toLowerCase().includes(term) ||
      (p.company || '').toLowerCase().includes(term) ||
      (p.branch || '').toLowerCase().includes(term) ||
      (p.graduation_year?.toString() || '').includes(term);

    if (!matchesSearch) return false;

    if (activeTab === 'Unread') return c.unreadCount > 0;
    if (activeTab === 'Mentorship') return (c.context_tag || c.contextTag || '').toLowerCase().includes('mentor');
    
    return true;
  });

  const displayName = currentUser?.full_name || currentUser?.name || currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'User';

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Current User Profile Widget */}
      {currentUser && (
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()} title="Change Profile Picture">
              <img 
                src={currentUser.avatar_url || currentUser.profile_image || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`} 
                alt="My Profile" 
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm group-hover:brightness-75 transition-all" 
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-white drop-shadow-md" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg" 
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-slate-900">{displayName}</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{currentUser.user_type || 'User'}</span>
            </div>
          </div>
          {uploading && <Loader2 className="w-5 h-5 text-[var(--cardinal)] animate-spin" />}
        </div>
      )}

      {/* Header & Search */}
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center justify-between">
          Messages
          <button className="text-slate-400 hover:text-[var(--cardinal)] transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </h2>
        
        <div className="relative mt-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search name, company, batch..." 
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Conversation Tabs */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
          {['All', 'Mentorship', 'Unread'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-all shadow-sm ${activeTab === tab ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map(conv => (
            <div 
              key={conv.id} 
              onClick={() => onSelectConversation(conv.id)}
              className={`p-4 border-b border-slate-100 cursor-pointer transition-colors duration-150 flex gap-3 ${
                activeConversationId === conv.id ? 'bg-red-50/50 border-l-4 border-l-[var(--cardinal)]' : 'hover:bg-slate-50'
              }`}
            >
              <div className="relative group">
                <img src={conv.participant.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${conv.participant.full_name}`} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-sm transition-transform group-hover:scale-105" />
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--cardinal)] text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-pulse">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-sm font-bold text-slate-900 truncate pr-2">
                    {conv.participant.full_name}
                  </h3>
                  <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                    {conv.lastMessageAt && !isNaN(new Date(conv.lastMessageAt).getTime()) 
                      ? new Date(conv.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                      : ''}
                  </span>
                </div>
                <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                  {conv.lastMessage}
                </p>
                {conv.contextTag && (
                  <span className="inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                    {conv.contextTag}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-slate-500 text-sm">
            <MessageSquareCode className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            No conversations found.
          </div>
        )}
      </div>
    </div>
  );
}
