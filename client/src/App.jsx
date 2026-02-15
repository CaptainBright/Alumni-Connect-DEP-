import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Home from './pages/Home'
import Directory from './pages/Directory'
import Jobs from './pages/Jobs'
import Resources from './pages/Resources'
import Donation from './pages/Donation'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AuthCallback from './pages/AuthCallback'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import PendingApproval from './pages/PendingApproval'

import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1">
        <Routes>

          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            element={<ProtectedRoute allow={["pending", "approved", "admin"]} redirectGuest="/login" />}
          >
            <Route path="/pending-approval" element={<PendingApproval />} />
          </Route>
          {/* APPROVED USERS ONLY */}
          <Route
            element={<ProtectedRoute allow={["approved", "admin"]} />}
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/donation" element={<Donation />} />
          </Route>

          {/* ADMIN ONLY */}
          <Route
            element={<ProtectedRoute allow={["admin"]} />}
          >
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

        </Routes>
      </div>

      <Footer />
    </div>
  )
}
