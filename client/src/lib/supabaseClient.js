// client/src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase credentials missing! Create .env file with:',
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase project.'
  )
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

// Setup cross-tab session sync using BroadcastChannel API
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    const channel = new BroadcastChannel('supabase-auth')
    
    // Send auth state changes to other tabs
    supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔔 Auth state change (broadcasting to other tabs):', _event)
      channel.postMessage({
        type: 'AUTH_STATE_CHANGE',
        event: _event,
        session: session
      })
    })
    
    // Listen for auth state changes from other tabs
    channel.onmessage = (msg) => {
      const { type, event, session } = msg.data
      if (type === 'AUTH_STATE_CHANGE') {
        console.log('📢 Received auth state change from another tab:', event)
        // Auth changes automatically trigger onAuthStateChange in this tab
      }
    }
    
    console.log('📡 Cross-tab sync enabled via BroadcastChannel')
  } catch (err) {
    console.warn('⚠️ BroadcastChannel not available, cross-tab sync disabled:', err.message)
  }
} else if (typeof window !== 'undefined') {
  // Fallback for browsers that don't support BroadcastChannel
  console.warn('⚠️ BroadcastChannel not supported in this browser, cross-tab session sync limited')
}

// DEBUG ONLY
if (typeof window !== "undefined") {
  window.supabase = supabase
}
