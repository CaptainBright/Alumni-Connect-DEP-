import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({
  children,
  allow = ["approved", "admin"],   // which roles can access this route
  redirectGuest = "/login",
  redirectPending = "/pending-approval"
}) {
  const { authStatus, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-gray-600">Checking permissions...</p>
      </div>
    )
  }

  // Not logged in
  if (authStatus === "guest") {
    return <Navigate to={redirectGuest} replace />
  }

  // Logged in but waiting approval
  if (authStatus === "pending" && !allow.includes("pending")) {
    return <Navigate to={redirectPending} replace />
  }

  // Not allowed role
  if (!allow.includes(authStatus)) {
    return <Navigate to="/" replace />
  }

  if (children) return children
  return <Outlet />
}
