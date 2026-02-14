import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { ensureProfile, isProfileApproved } from '../lib/authProfile'

export default function AuthCallback() {
  const [error, setError] = useState(null)
  const nav = useNavigate()

  useEffect(() => {
    let mounted = true

    const finishAuth = async () => {
      const params = new URLSearchParams(window.location.search)
      const nextPath = params.get('next') || '/dashboard'
      const flow = params.get('flow') || 'login'

      try {
        let user = null
        for (let i = 0; i < 3; i += 1) {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
          if (sessionError) throw sessionError

          user = sessionData.session?.user || null
          if (user?.id) break

          // PKCE exchange can take a moment after redirect.
          await new Promise((resolve) => setTimeout(resolve, 250))
        }

        if (!user?.id) {
          throw new Error('No authenticated user returned from Supabase')
        }

        const pendingType = window.localStorage.getItem('pending_user_type')
        const pendingDraftRaw = window.localStorage.getItem('pending_profile_draft')
        let pendingDraft = {}

        if (pendingDraftRaw) {
          try {
            pendingDraft = JSON.parse(pendingDraftRaw)
          } catch {
            pendingDraft = {}
          }
        }

        const { data: profile, error: profileError } = await ensureProfile(user, {
          ...pendingDraft,
          userType: pendingType || pendingDraft.userType || undefined,
          isApproved: false,
          approvalStatus: 'PENDING'
        })

        window.localStorage.removeItem('pending_user_type')
        window.localStorage.removeItem('pending_profile_draft')

        if (profileError) throw profileError

        if (!isProfileApproved(profile) || flow === 'register') {
          await supabase.auth.signOut()
          if (mounted) {
            nav('/login', {
              replace: true,
              state: {
                info: 'Your profile has been submitted for admin verification. You can log in after approval.'
              }
            })
          }
          return
        }

        if (mounted) nav(nextPath, { replace: true })
      } catch (err) {
        window.localStorage.removeItem('pending_user_type')
        window.localStorage.removeItem('pending_profile_draft')
        if (mounted) setError(err.message || 'Authentication callback failed')
      }
    }

    finishAuth()

    return () => {
      mounted = false
    }
  }, [nav])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white border border-gray-200 shadow-lg rounded-xl p-6 text-center">
        {!error && (
          <>
            <h2 className="text-2xl font-bold text-gray-900">Completing sign-in</h2>
            <p className="text-gray-600 mt-2">Please wait while we connect your account.</p>
          </>
        )}

        {error && (
          <>
            <h2 className="text-2xl font-bold text-gray-900">Sign-in failed</h2>
            <p className="text-red-700 mt-2 text-sm">{error}</p>
            <button
              className="mt-6 px-4 py-2 rounded-lg bg-[var(--cardinal)] text-white hover:opacity-90"
              onClick={() => nav('/login')}
            >
              Back to login
            </button>
          </>
        )}
      </div>
    </div>
  )
}
