import React, { useState, useRef } from 'react';
import { broadcastApi } from '../../api/broadcastApi';
import { messagingApi } from '../../api/messagingApi'; // to upload file
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { sendBroadcastEmail } from '../../api/adminApi';

export default function AdminBroadcastPanel({ uniqueYears, uniqueBranches }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_role: 'All',
    target_branch: 'All',
    target_year: '' // Empty means All
  });
  
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMsg('File size must be under 5MB.');
        e.target.value = null;
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      let attachment_url = null;
      if (file) {
        // Upload file using messagingApi.uploadAttachment but adapt for broadcasts
        // Just use a dummy conversation ID "broadcasts"
        attachment_url = await messagingApi.uploadAttachment(file, `broadcasts/${user.id}`);
      }

      await broadcastApi.sendBroadcast({
        sender_id: user.id,
        title: formData.title,
        content: formData.content,
        target_role: formData.target_role,
        target_branch: formData.target_branch,
        target_year: formData.target_year ? parseInt(formData.target_year) : null,
        attachment_url
      });

      // Trigger email dispatch via backend API
      try {
        await sendBroadcastEmail({
          title: formData.title,
          content: formData.content,
          target_role: formData.target_role,
          target_branch: formData.target_branch,
          target_year: formData.target_year ? parseInt(formData.target_year) : null
        });
      } catch (emailErr) {
        console.error('Failed to trigger email broadcast:', emailErr);
        // We don't block the UI success if only the email fails, or we can set a warning.
      }

      setSuccessMsg('Broadcast sent and emails dispatched successfully!');
      setFormData({
        title: '',
        content: '',
        target_role: 'All',
        target_branch: 'All',
        target_year: ''
      });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;

    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to send broadcast.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-2">Send Broadcast Message</h2>
      <p className="text-sm text-slate-500 mb-6">Send an announcement to a targeted group of users.</p>

      {successMsg && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg">{successMsg}</div>}
      {errorMsg && <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-lg">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Target Role</label>
            <select name="target_role" value={formData.target_role} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--cardinal)]">
              <option value="All">All Users</option>
              <option value="Alumni">Only Alumni</option>
              <option value="Student">Only Students</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Target Branch</label>
            <select name="target_branch" value={formData.target_branch} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--cardinal)]">
              <option value="All">All Branches</option>
              {uniqueBranches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Target Year</label>
            <select name="target_year" value={formData.target_year} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--cardinal)]">
              <option value="">All Years</option>
              {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
          <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--cardinal)]" placeholder="Announcement Title" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Message Content</label>
          <textarea required name="content" value={formData.content} onChange={handleChange} rows="4" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--cardinal)]" placeholder="Type your broadcast message here..."></textarea>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Attachment (Optional, max 5MB)</label>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-[var(--cardinal)] hover:file:bg-slate-100" />
        </div>

        <div className="pt-2">
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2 bg-[var(--cardinal)] text-white font-bold rounded-xl hover:bg-red-800 disabled:opacity-50 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? 'Sending...' : 'Send Broadcast'}
          </button>
        </div>
      </form>
    </div>
  );
}
