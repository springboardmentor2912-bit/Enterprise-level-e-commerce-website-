import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { vendorLoginStart, vendorLoginSuccess, vendorLoginFailure } from '../store/slices/vendorAuthSlice';
import { Store, CheckCircle, AlertCircle, Lock, Mail, Phone, MapPin, Building } from 'lucide-react';

import { getErrorMessage } from '../api/errorUtils';

const VendorAuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    description: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.vendorAuth);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setValidationError('');

    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        setValidationError('Passwords do not match. Please try again.');
        return;
      }

      dispatch(vendorLoginStart());
      try {
        const response = await axiosClient.post('/vendor/auth/register', {
          businessName: formData.businessName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          description: formData.description,
        });

        dispatch(vendorLoginSuccess(response.data));
        navigate('/vendor/dashboard');
      } catch (err) {
        const errorMessage = getErrorMessage(err, 'Vendor registration failed. Please check parameters.');
        dispatch(vendorLoginFailure(errorMessage));
      }
    } else {
      dispatch(vendorLoginStart());
      try {
        const response = await axiosClient.post('/vendor/auth/login', {
          email: formData.email,
          password: formData.password,
        });

        dispatch(vendorLoginSuccess(response.data));
        navigate('/vendor/dashboard');
      } catch (err) {
        const errorMessage = getErrorMessage(err, 'Vendor sign in failed. Invalid email or password.');
        dispatch(vendorLoginFailure(errorMessage));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
      {/* Brand Corner */}
      <div className="flex items-center space-x-3 mb-8 cursor-pointer" onClick={() => navigate('/products')}>
        <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2.5 rounded-2xl text-white shadow-xl">
          <Store className="w-8 h-8" />
        </div>
        <div className="text-left">
          <h1 className="font-extrabold text-2xl tracking-tight text-white font-sans">ShopStack Merchant</h1>
          <p className="text-xs text-purple-400 font-medium">Enterprise Multi-Vendor Merchant Portal</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-purple-900/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {isSignUp ? 'Register as Merchant' : 'Vendor Portal Login'}
          </h2>
          <p className="text-xs text-slate-400">
            {isSignUp
              ? 'List products, manage inventory stock & monitor sales analytics'
              : 'Sign in to manage your multi-vendor products'}
          </p>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Banner */}
        {(error || validationError) && (
          <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">Business / Store Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Building className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="e.g. Apex Electronics Ltd"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">Vendor Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="vendor@company.com"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {isSignUp && (
            <>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">Confirm Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">Phone</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-8888"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">Business Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="City, State"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Register Store' : 'Vendor Sign In'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          <span>{isSignUp ? 'Already a registered vendor?' : "Want to sell on ShopStack?"}</span>{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setSuccessMessage('');
              setValidationError('');
            }}
            className="text-purple-400 font-semibold hover:underline cursor-pointer"
          >
            {isSignUp ? 'Vendor Sign In' : 'Register Merchant Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorAuthPage;
