import React, { useState, useRef } from 'react';
import { Paperclip, Send, Loader2, X } from 'lucide-react';

export default function ChatInput({ onSendMessage, isUploading = false }) {
  const [messageText, setMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((messageText.trim() || selectedFile) && !isUploading) {
      onSendMessage(messageText.trim(), selectedFile);
      setMessageText('');
      setSelectedFile(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-slate-200">
      {selectedFile && (
        <div className="max-w-4xl mx-auto mb-3 px-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <Paperclip className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px]">{selectedFile.name}</span>
            <button 
              type="button" 
              onClick={() => setSelectedFile(null)} 
              className="ml-1 p-0.5 hover:bg-blue-200 rounded-full transition-colors text-blue-500 hover:text-blue-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 max-w-4xl mx-auto">
        {/* Attachment Button */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              if (file.size > 5 * 1024 * 1024) {
                alert('File size must be under 5MB.');
                e.target.value = null;
                return;
              }
              setSelectedFile(file);
            }
          }}
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
        />
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0"
          title="Attach file (Resume/JD/Docs)"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea 
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Write a message..."
            className="w-full resize-none bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cardinal)] focus:border-transparent min-h-[52px] max-h-32"
            rows="1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>

        {/* Send Button */}
        <button 
          type="submit"
          disabled={(!messageText.trim() && !selectedFile) || isUploading}
          className={`p-3 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-sm ${
            (messageText.trim() || selectedFile) && !isUploading
              ? 'bg-[var(--cardinal)] hover:bg-red-800 text-white shadow-red-200' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 -ml-0.5" />}
        </button>
      </div>
    </form>
  );
}
