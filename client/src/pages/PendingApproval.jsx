import React, { useEffect, useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { supabase } from "../lib/supabaseClient"

export default function PendingApproval() {
  const { user, signOut } = useAuth()
  const [checking, setChecking] = useState(false)
  const message = "Your account is awaiting admin approval."

  // 🔁 periodically check approval
  useEffect(() => {
    if (!user) return

    const interval = setInterval(async () => {
      setChecking(true)

      const { data } = await supabase
        .from("profiles")
        .select("approval_status")
        .eq("id", user.id)
        .single()

      if (data?.approval_status === "APPROVED") {
        window.location.href = "/dashboard"
      }

      setChecking(false)
    }, 8000) // every 8 sec

    return () => clearInterval(interval)
  }, [user])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8 text-center">
        
        <div className="text-5xl mb-4">⏳</div>

        <h1 className="text-2xl font-semibold mb-2">
          Approval Pending
        </h1>

        <p className="text-gray-600 mb-6">
          {message}
        </p>

        <div className="text-sm text-gray-500 mb-6">
          You will automatically enter the portal once an admin approves your account.
        </div>

        {checking && (
          <p className="text-blue-600 text-sm mb-4">
            Checking approval status...
          </p>
        )}

        <button
          onClick={signOut}
          className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
