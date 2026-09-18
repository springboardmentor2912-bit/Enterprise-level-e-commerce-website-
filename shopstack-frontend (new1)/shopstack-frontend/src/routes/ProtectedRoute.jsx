import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

/**
 * Guards a route subtree behind authentication, and optionally a specific
 * role (e.g. "VENDOR", "ADMIN"). Unauthenticated users are sent to /login;
 * authenticated users with the wrong role are sent home.
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { user, accessToken } = useSelector((state) => state.auth)

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
