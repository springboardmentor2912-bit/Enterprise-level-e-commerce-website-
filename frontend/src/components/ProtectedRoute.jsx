import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const token = sessionStorage.getItem('token');
  const role = (sessionStorage.getItem('role') || '').trim().toUpperCase().replace(/^ROLE_/, '');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
