import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'

export default function AuthCallback() {
  const [error, setError] = useState(null)
  const nav = useNavigate()
  const { googleLogin } = useAuth()

  useEffect(() => {
    let mounted = true

    const finishAuth = async () => {
      const params = new URLSearchParams(window.location.search)
      const nextPath = params.get('next') || '/dashboard'

      try {
        // 1. Get Supabase Session (contains Google Access Token)
        let session = null
        for (let i = 0; i < 3; i += 1) {
          const { data, error: sessionError } = await supabase.auth.getSession()
          if (sessionError) throw sessionError

          if (data.session?.user) {
            session = data.session
            break
          }
          await new Promise((resolve) => setTimeout(resolve, 250))
        }

        if (!session?.user) {
          throw new Error('No authenticated user returned from Supabase')
        }

        // 2. Exchange Token with Server to get Session Cookie
        const result = await googleLogin(session.access_token, session.refresh_token)

        if (!result.success) {
          throw new Error(result.error)
        }

        if (mounted) nav(nextPath, { replace: true })

      } catch (err) {
        if (mounted) setError(err.message || 'Authentication callback failed')
        // Force logout if failed to sync with server
        await supabase.auth.signOut()
      }
    }

    finishAuth()

    return () => {
      mounted = false
    }
  }, [nav, googleLogin])

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
