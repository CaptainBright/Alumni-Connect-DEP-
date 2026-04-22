import React, { useState } from 'react';
import { Download, Sparkles, Pencil, Trash2, X, Check, Smile, FileText, FileArchive, File } from 'lucide-react';

export default function MessageBubble({ message, isOwnMessage, currentUserAvatar, onEdit, onDelete, onReact }) {
  const { id, content, attachment_url, is_career_insight, created_at, sender, is_edited, reaction } = message;
  const deliveryTime = new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isImageAttachment = attachment_url && attachment_url.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i);
  const isPdfAttachment = attachment_url && attachment_url.match(/\.pdf(\?.*)?$/i);
  const isDocAttachment = attachment_url && attachment_url.match(/\.(doc|docx)(\?.*)?$/i);
  const isZipAttachment = attachment_url && attachment_url.match(/\.zip(\?.*)?$/i);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== content) {
      onEdit(id, editContent);
    }
    setIsEditing(false);
  };

  return (
    <div 
      className={`flex w-full mb-4 group ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      onMouseLeave={() => setShowEmojiPicker(false)}
    >
      
      {!isOwnMessage && (
        <img 
          src={sender?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${sender?.full_name || 'User'}`} 
          alt="Avatar" 
          className="w-8 h-8 rounded-full border border-slate-200 mr-2 flex-shrink-0 mt-auto mb-1"
        />
      )}

      <div className={`max-w-[75%] md:max-w-[65%] flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        
        {/* Message Container */}
        <div 
          className={`
            relative p-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm transform transition-all duration-300
            animate-in fade-in slide-in-from-bottom-2 duration-300
            ${is_career_insight 
              ? 'border border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-900' 
              : isOwnMessage 
                ? 'bg-[#d9fdd3] text-slate-800 shadow-sm border border-[#c4eabf]' 
                : 'bg-white border border-slate-200 text-slate-800 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]'
            }
            ${isOwnMessage ? 'rounded-br-[4px]' : 'rounded-bl-[4px]'}
          `}
        >
          {/* Career Insight Badge (if tagged by sender) */}
          {is_career_insight && !isOwnMessage && (
            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-amber-600 bg-amber-100/50 w-fit px-2 py-0.5 rounded-md">
              <Sparkles className="w-3.5 h-3.5" /> Career Insight
            </div>
          )}

          {/* Text Content */}
          {isEditing ? (
            <div className="flex flex-col gap-2 min-w-[200px]">
              <textarea 
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                autoFocus
                className="w-full text-slate-800 p-2 rounded-md border border-slate-300 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] text-sm resize-none"
                rows="2"
              />
              <div className="flex justify-end gap-1">
                <button onClick={() => { setIsEditing(false); setEditContent(content); }} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
                  <X className="w-4 h-4" />
                </button>
                <button onClick={handleSaveEdit} className="p-1 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap word-break-words break-words">{content}</p>
          )}

          {/* Attachment Render Snippet */}
          {attachment_url && (
            isImageAttachment ? (
              <div className={`mt-3 relative rounded-xl overflow-hidden border shadow-sm max-w-sm border-slate-200`}>
                <a href={attachment_url} target="_blank" rel="noopener noreferrer">
                  <img src={attachment_url} alt="Attached file" className="w-full h-auto object-cover max-h-64 hover:opacity-95 transition-opacity" />
                </a>
              </div>
            ) : (
              <div className={`mt-3 p-2.5 rounded-xl border flex items-center justify-between gap-3 bg-white/50 border-slate-200/60`}>
                <div className="flex items-center gap-3 overflow-hidden text-sm w-full">
                  <div className={`p-2 rounded-lg flex-shrink-0 bg-slate-200/50 text-slate-600`}>
                    {isPdfAttachment ? <FileText className="w-5 h-5 text-red-500" /> : 
                     isDocAttachment ? <FileText className="w-5 h-5 text-blue-500" /> :
                     isZipAttachment ? <FileArchive className="w-5 h-5 text-amber-500" /> :
                     <File className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className={`font-bold truncate text-slate-800`}>
                      Attached File
                    </span>
                    <span className={`text-[11px] truncate text-slate-500`}>Click to download</span>
                  </div>
                </div>
                <a 
                  href={attachment_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`p-1.5 rounded-full flex-shrink-0 transition-colors bg-[var(--cardinal)] hover:bg-red-800 text-white shadow-sm`}
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            )
          )}

          {/* Placed Reaction Badge */}
          {reaction && (
            <div className={`absolute -bottom-2.5 ${isOwnMessage ? 'right-2' : 'left-2'} bg-white shadow-sm border border-slate-200 rounded-full px-1.5 py-0.5 text-[11px] leading-tight z-10 animate-in zoom-in duration-200`}>
              {reaction}
            </div>
          )}
        </div>

        {/* Reactions, Actions & Meta / Timestamp */}
        <div className={`text-[10px] text-slate-400 font-medium px-1 mt-1 flex items-center gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
          <span>{deliveryTime}</span>
          {is_edited && <span className="italic text-slate-300 ml-1">(edited)</span>}
          
          {/* Quick Actions Array on hover */}
          <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 ml-1 relative ${showEmojiPicker ? 'opacity-100' : ''}`}>
            
            {/* Emoji Picker */}
            <div className="relative flex items-center mt-[-2px]">
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1 hover:text-amber-500 transition-colors" title="React">
                <Smile className="w-3.5 h-3.5" />
              </button>
              
              {showEmojiPicker && (
                <div className={`absolute bottom-full mb-1 ${isOwnMessage ? 'right-0' : 'left-0'} flex items-center gap-1.5 bg-white border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] rounded-full px-2 py-1.5 z-20 animate-in slide-in-from-bottom-2`}>
                  {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                    <button 
                      key={emoji} 
                      onClick={() => { onReact(id, emoji); setShowEmojiPicker(false); }}
                      className="hover:scale-125 transition-transform text-base leading-none"
                    >
                      {emoji}
                    </button>
                  ))}
                  {reaction && (
                    <div className="pl-1 border-l border-slate-200 ml-1 flex items-center h-full">
                      <button 
                        onClick={() => { onReact(id, null); setShowEmojiPicker(false); }}
                        className="hover:bg-slate-100 rounded-full p-1 transition-colors text-slate-400 hover:text-red-500" title="Remove Reaction"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {isOwnMessage && (
              <>
                <button onClick={() => setIsEditing(true)} className="p-1 hover:text-blue-500 transition-colors mt-[-2px]" title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onDelete(id)} className="p-1 hover:text-red-500 transition-colors mt-[-2px]" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
