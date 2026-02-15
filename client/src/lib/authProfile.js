import { supabase } from './supabaseClient'

export function normalizeUserType(value) {
  const normalized = (value || '').toString().trim().toLowerCase()

  if (normalized === 'admin') return 'Admin'
  if (normalized === 'faculty') return 'Faculty'
  if (normalized === 'student') return 'Student'
  return 'Alumni'
}

export function normalizeApprovalStatus(value) {
  const normalized = (value || '').toString().trim().toUpperCase()

  if (normalized === 'APPROVED') return 'APPROVED'
  if (normalized === 'REJECTED') return 'REJECTED'
  return 'PENDING'
}

function buildProfileRow(user, overrides = {}) {
  const metadata = user?.user_metadata || {}
  const userType = normalizeUserType(
    overrides.userType || metadata.user_type || metadata.userType
  )

  const defaultApproved = userType === 'Admin'
  const isApproved =
    typeof overrides.isApproved === 'boolean'
      ? overrides.isApproved
      : defaultApproved

  const approvalStatus =
    normalizeApprovalStatus(overrides.approvalStatus || (isApproved ? 'APPROVED' : 'PENDING'))

  const emailValue = overrides.email || user.email || metadata.email || null
  
  console.log('📝 buildProfileRow email resolution:', {
    'overrides.email': overrides.email,
    'user.email': user.email,
    'metadata.email': metadata.email,
    'final': emailValue
  })

  return {
    id: user.id,
    email: emailValue,
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
  if (!userId) {
    console.warn('⚠️ getProfileByUserId: Missing user ID')
    return { data: null, error: new Error('Missing user id') }
  }

  try {
    console.log('🔍 Fetching profile for user:', userId)
    const result = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (result.error && result.error.message !== 'AbortError') {
      console.error('❌ Error fetching profile:', result.error.message)
    } else if (!result.error) {
      console.log('✅ Profile fetch result:', result.data ? 'Found' : 'Not found')
    }

    return result
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('⚠️ Profile fetch was aborted')
      return { data: null, error: err }
    }
    console.error('❌ Unexpected error fetching profile:', err.message)
    return { data: null, error: err }
  }
}

export function isProfileApproved(profile) {
  if (!profile) return false
  return (
    normalizeApprovalStatus(profile.approval_status) === 'APPROVED' ||
    profile.is_approved === true
  )
}

export function isAdminProfile(profile) {
  if (!profile) return false
  return normalizeUserType(profile.user_type) === 'Admin'
}

export async function ensureProfile(user, overrides = {}) {
  if (!user?.id) {
    console.error('❌ ensureProfile: Missing user ID')
    return { data: null, error: new Error('Missing authenticated user') }
  }

  try {
    console.log('🔍 Checking if profile exists for user:', user.id)
    const { data: existingProfile, error: readError } = await getProfileByUserId(user.id)

    if (readError && readError.message !== 'AbortError') {
      console.error('❌ Error reading profile:', readError.message)
      // Fallthrough to create new profile
    } else if (existingProfile?.id) {
      console.log('✅ Profile already exists:', existingProfile.id)
      const updates = {}
      const normalizedType = normalizeUserType(
        overrides.userType || user?.user_metadata?.user_type || user?.user_metadata?.userType
      )
      const incomingEmail = overrides.email || user.email || null

      if (!existingProfile.email && incomingEmail) {
        console.log('📝 Backfilling email:', incomingEmail)
        updates.email = incomingEmail
      }

      if (!existingProfile.user_type && normalizedType) {
        console.log('📝 Backfilling user_type:', normalizedType)
        updates.user_type = normalizedType
      }

      // Backfill previous bugged admin rows so admin can sign in immediately.
      if (
        normalizedType === 'Admin' &&
        (existingProfile.approval_status !== 'APPROVED' || existingProfile.is_approved !== true)
      ) {
        console.log('📝 Admin backfill: setting APPROVED status')
        updates.approval_status = 'APPROVED'
        updates.is_approved = true
      }

      if (Object.keys(updates).length === 0) {
        console.log('✅ No updates needed for existing profile')
        return { data: existingProfile, error: null }
      }

      console.log('💾 Updating profile with:', updates)
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select('*')
        .single()

      if (updateError) {
        console.error('❌ Error updating profile:', updateError.message)
        // Return existing profile even if update fails
        return { data: existingProfile, error: updateError }
      }
      console.log('✅ Profile updated successfully')
      return { data: updatedProfile, error: null }
    }

    // Profile doesn't exist or read failed, create new one
    console.log('📝 Creating new profile with overrides:', Object.keys(overrides))
    const profileRow = buildProfileRow(user, overrides)
    console.log('💾 Inserting profile:', profileRow)

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileRow)
      .select()
      .single()

    if (error) {
      console.error('❌ Error inserting profile:', error.message, error.details)
    } else {
      console.log('✅ Profile inserted successfully:', data)
    }

    return { data, error }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('⚠️ ensureProfile was aborted')
    } else {
      console.error('💥 Unexpected error in ensureProfile:', err.message)
    }
    return { data: null, error: err }
  }
}
