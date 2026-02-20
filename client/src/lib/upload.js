// client/src/lib/upload.js
import { supabase } from './supabaseClient'

export async function uploadAvatar(file, userId) {
  const ext = file.name.split('.').pop()
  const filePath = `avatars/${userId}.${ext}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (error) throw error

  const { publicURL } = supabase.storage.from('avatars').getPublicUrl(filePath)
  return publicURL
}
