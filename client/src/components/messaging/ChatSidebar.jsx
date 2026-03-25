import React, { useState } from 'react';
import { Search, Filter, MessageSquareCode } from 'lucide-react';

export default function ChatSidebar({ conversations, activeConversationId, onSelectConversation }) {
  const [searchTerm, setSearchTerm] = useState('');

  const [activeTab, setActiveTab] = useState('All');

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

  return (
    <div className="flex flex-col h-full">
      {/* Header & Search */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center justify-between">
          Messages
          <button className="text-slate-400 hover:text-[var(--cardinal)]">
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
