import { supabase } from './supabaseClient'

export function normalizeUserType(value) {
  const normalized = (value || '').toString().trim().toLowerCase()

  if (normalized === 'admin') return 'Admin'
  if (normalized === 'student') return 'Student'
  return 'Alumni'
}

function buildProfileRow(user, overrides = {}) {
  const metadata = user?.user_metadata || {}
  const userType = normalizeUserType(
    overrides.userType || metadata.user_type || metadata.userType
  )

  const isApproved =
    typeof overrides.isApproved === 'boolean'
      ? overrides.isApproved
      : false

  const approvalStatus =
    overrides.approvalStatus || (isApproved ? 'APPROVED' : 'PENDING')

  return {
    id: user.id,
    email: user.email || null,
    full_name:
      overrides.fullName ||
      metadata.full_name ||
      metadata.name ||
      (user.email ? user.email.split('@')[0] : 'User'),
    graduation_year: overrides.graduationYear ? Number(overrides.graduationYear) : null,
    branch: overrides.branch || null,
    company: overrides.company || null,
    linkedin: overrides.linkedIn || null,
    role: overrides.role || null,
    user_type: userType,
    is_approved: isApproved,
    approval_status: approvalStatus,
    admin_notes: overrides.adminNotes || null,
    created_at: new Date().toISOString()
  }
}

export async function getProfileByUserId(userId) {
  if (!userId) return { data: null, error: new Error('Missing user id') }

  return supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
}

export function isProfileApproved(profile) {
  if (!profile) return false
  return profile.approval_status === 'APPROVED' || profile.is_approved === true
}

export async function ensureProfile(user, overrides = {}) {
  if (!user?.id) {
    return { data: null, error: new Error('Missing authenticated user') }
  }

  const { data: existingProfile, error: readError } = await getProfileByUserId(user.id)

  if (readError) return { data: null, error: readError }
  if (existingProfile?.id) return { data: existingProfile, error: null }

  const profileRow = buildProfileRow(user, overrides)

  const { data, error } = await supabase
    .from('profiles')
    .insert(profileRow)
    .select()
    .single()

  return { data, error }
}
