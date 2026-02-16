const COOKIE_NAME = 'ac_session'

export function saveSessionToCookie(session) {
  if (typeof document === 'undefined' || !session?.access_token || !session?.refresh_token) {
    if (session) {
      console.warn('🍪 Skip saving session to cookie: missing tokens')
    }
    return
  }

  try {
    const payload = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at || null
    }

    const json = JSON.stringify(payload)
    const raw = btoa(json)
    const maxAge = 60 * 60 * 24 * 7
    
    document.cookie = `${COOKIE_NAME}=${raw}; Max-Age=${maxAge}; Path=/; SameSite=Lax`
    console.log('🍪 Session saved to cookie (7 days)')
  } catch (err) {
    console.error('❌ Failed to save session to cookie:', err.message)
  }
}

export function clearSessionCookie() {
  if (typeof document === 'undefined') return
  try {
    document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`
    console.log('🍪 Session cookie cleared')
  } catch (err) {
    console.error('❌ Failed to clear session cookie:', err.message)
  }
}

export function readSessionFromCookie() {
  if (typeof document === 'undefined') return null

  try {
    const cookies = document.cookie.split(';').map((p) => p.trim())
    const rawCookie = cookies.find((item) => item.startsWith(`${COOKIE_NAME}=`))
    
    if (!rawCookie) {
      console.log('🍪 No session cookie found')
      return null
    }

    const base64Data = rawCookie.slice(COOKIE_NAME.length + 1)
    if (!base64Data) {
      console.log('🍪 Session cookie found but empty')
      return null
    }

    const jsonString = atob(base64Data)
    const parsed = JSON.parse(jsonString)
    
    if (!parsed?.access_token || !parsed?.refresh_token) {
      console.warn('🍪 Session cookie missing tokens')
      return null
    }
    
    // Check if expired (with 1-minute buffer)
    if (parsed?.expires_at && Number.isFinite(parsed.expires_at)) {
      const nowSec = Math.floor(Date.now() / 1000)
      const expiresIn = parsed.expires_at - nowSec
      
      if (expiresIn < -60) {
        console.warn('🍪 Session cookie expired', `(${expiresIn}s ago)`)
        return null
      }
      
      console.log(`🍪 Cookie session valid, expires in ${expiresIn}s`)
    } else {
      console.log('🍪 Cookie session loaded (no expiration info)')
    }
    
    return parsed
  } catch (err) {
    console.error('❌ Failed to read session from cookie:', err.message)
    return null
  }
}
