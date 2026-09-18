import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  // Set alongside role/token whenever we know it (login, register, become-vendor) —
  // true if this account also has a Vendor profile, regardless of its primary role.
  const isVendor = localStorage.getItem('isVendor') === 'true';

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role
  const normalizedRole = userRole
    ? userRole.replace('ROLE_', '')
    : '';

  // Check allowed roles
  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedAllowedRoles = allowedRoles.map(
      (role) => role.replace('ROLE_', '')
    );

    const passesPrimaryRole = normalizedAllowedRoles.includes(normalizedRole);
    // Multi-role support: an account whose primary role isn't VENDOR can
    // still have become one (see "Become a Vendor") — let it through a
    // VENDOR-only route without needing role to actually equal "VENDOR".
    const passesVendorException = normalizedAllowedRoles.includes('VENDOR') && isVendor;

    if (!passesPrimaryRole && !passesVendorException) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
