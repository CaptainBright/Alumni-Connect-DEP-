// client/src/lib/upload.js
import { supabase } from './supabaseClient'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export async function uploadAvatar(file, userId) {
  const ext = file.name.split('.').pop()
  const filePath = `avatars/${userId}.${ext}`

  // 1. Upload the file to Supabase Storage
  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (error) throw error

  // 2. Get the public URL
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
  const publicUrl = data.publicUrl

  // 3. Update the profile via server API (bypasses RLS)
  const res = await fetch(`${API_BASE}/api/profile/update-avatar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // sends the session_token cookie
    body: JSON.stringify({ avatar_url: publicUrl }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || 'Failed to save avatar URL')
  }

  return publicUrl
}

export async function uploadCoverImage(file) {
  // Generate a unique file name to prevent overwriting
  const ext = file.name.split('.').pop()
  const uniqueId = Math.random().toString(36).substring(2, 15)
  const timestamp = Date.now()
  const filePath = `covers/${uniqueId}-${timestamp}.${ext}`

  // Upload the file to the 'avatars' Supabase Storage bucket
  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: false })

  if (error) throw error

  // Get the public URL
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
  return data.publicUrl
}
