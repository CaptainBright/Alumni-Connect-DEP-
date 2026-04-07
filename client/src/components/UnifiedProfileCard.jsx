import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadAvatar, deleteAvatar } from '../lib/upload'
import { useAuth } from '../hooks/useAuth'
import {
  CheckCircle2,
  Clock,
  Edit,
  Camera,
  Loader2,
  Trash2
} from 'lucide-react'

export default function UnifiedProfileCard({ profile, loadingProfile }) {
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const { user } = useAuth()
  const nav = useNavigate()

  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url)
    }
  }, [profile?.avatar_url])

  const isApproved = profile?.approval_status === 'APPROVED'

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return

    // Validate file type and size (max 2MB)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, WebP, or GIF).')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be smaller than 2 MB.')
      return
    }

    try {
      setUploading(true)
      const publicUrl = await uploadAvatar(file, user.id)
      // Append a cache-buster so the browser fetches the new image
      setAvatarUrl(publicUrl + '?t=' + Date.now())
    } catch (err) {
      console.error('Avatar upload failed:', err)
      alert('Failed to upload avatar. Please try again.')
    } finally {
      setUploading(false)
      // Reset input so re-selecting the same file triggers onChange
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAvatarDelete = async (e) => {
    e.stopPropagation() // Don't trigger the file picker
    if (!avatarUrl || uploading) return
    if (!window.confirm('Remove your profile picture?')) return

    try {
      setUploading(true)
      await deleteAvatar()
      setAvatarUrl(null)
    } catch (err) {
      console.error('Avatar delete failed:', err)
      alert('Failed to remove avatar. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Cover Banner */}
      <div className="h-24 bg-gradient-to-r from-[var(--cardinal)] to-red-800 relative"></div>

      <div className="px-6 pb-6 relative">
        {/* Profile Photo — click to upload */}
        <div className="flex justify-center -mt-12 mb-4">
          <div
            className="relative h-24 w-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-md cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
            title="Click to change profile picture"
          >
            <img
              src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name || 'User'}&backgroundColor=e2e8f0&textColor=475569`}
              alt="Profile"
              className="h-full w-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              {uploading
                ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                : <Camera className="w-6 h-6 text-white" />
              }
            </div>
            {/* Delete button — only shown when a custom avatar exists */}
            {avatarUrl && !uploading && (
              <button
                onClick={handleAvatarDelete}
                className="absolute -top-1 -right-1 z-10 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove profile picture"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            {/* Uploading overlay (always visible while uploading) */}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarUpload}
            disabled={uploading}
          />
        </div>

        {/* Name & Details */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            {loadingProfile ? 'Loading...' : (profile?.full_name || 'Member')}
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {profile?.branch || 'Branch'} • Class of {profile?.graduation_year || 'YYYY'}
          </p>

          {/* Status Badge */}
          <div className="mt-3 flex justify-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${isApproved
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
              {isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              {isApproved ? 'Approved Member' : 'Pending Approval'}
            </span>
          </div>
        </div>

        {/* Unified Profile Details */}
        <div className="space-y-5 pt-5 border-t border-slate-100">
          
          {/* Company & Role */}
          {profile?.company && (
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Company</h3>
              <p className="text-sm text-slate-800 font-semibold">{profile.company}</p>
            </div>
          )}

          {/* Bio / About */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">About Me</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {profile?.bio || 'No bio added yet. Tell the community about yourself.'}
            </p>
          </div>

          {/* Career Goals */}
          {profile?.career_goals && (
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Career Goals</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {profile.career_goals}
              </p>
            </div>
          )}

          {/* Skills */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Core Skills</h3>
            {profile?.skills ? (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {profile.skills.split(',').map((skill, idx) => (
                  <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm">{skill.trim()}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No skills listed</p>
            )}
          </div>

          {/* Interests */}
          {profile?.interests && (
            <div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Interests</h3>
              <p className="text-sm text-slate-700 font-medium">
                {profile.interests}
              </p>
            </div>
          )}

        </div>

        {/* Edit Profile Button */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <button
            onClick={() => nav('/edit-profile')}
            className="w-full py-2.5 bg-slate-50 text-slate-700 text-sm font-bold rounded-xl border border-slate-200 hover:bg-[var(--cardinal)] hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-2 group shadow-sm"
          >
            <Edit className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            Edit Profile
          </button>
        </div>

      </div>
    </div>
  )
}
