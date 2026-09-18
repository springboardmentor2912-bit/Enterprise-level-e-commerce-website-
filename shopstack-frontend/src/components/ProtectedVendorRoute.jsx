import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedVendorRoute = () => {
  const { isVendorAuthenticated } = useSelector((state) => state.vendorAuth);

  return isVendorAuthenticated ? <Outlet /> : <Navigate to="/vendor/login" replace />;
};

export default ProtectedVendorRoute;
