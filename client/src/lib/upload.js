// client/src/lib/upload.js

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001'

export async function uploadAvatar(file, userId) {
  // Send the file to the server, which uploads to Supabase Storage
  // using the service role key (bypasses storage RLS).
  const formData = new FormData()
  formData.append('avatar', file)

  const res = await fetch(`${API_BASE}/api/profile/upload-avatar`, {
    method: 'POST',
    credentials: 'include', // sends the session_token cookie
    body: formData,         // Content-Type is set automatically for FormData
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || 'Failed to upload avatar')
  }

  const data = await res.json()
  return data.avatar_url
}

export async function deleteAvatar() {
  const res = await fetch(`${API_BASE}/api/profile/delete-avatar`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || 'Failed to delete avatar')
  }

  return true
}

export async function uploadCoverImage(file) {
  // Cover images also go through the server now
  const formData = new FormData()
  formData.append('avatar', file)

  const res = await fetch(`${API_BASE}/api/profile/upload-avatar`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || 'Failed to upload cover image')
  }

  const data = await res.json()
  return data.avatar_url
}
