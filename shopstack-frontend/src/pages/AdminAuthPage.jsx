import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { loginStart, loginSuccess, loginFailure } from '../store/slices/authSlice';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

import { getErrorMessage } from '../api/errorUtils';

const AdminAuthPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [adminError, setAdminError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAdminError('');

    dispatch(loginStart());
    try {
      const response = await axiosClient.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      const userRole = response.data?.user?.role;
      if (userRole === 'ADMIN') {
        dispatch(loginSuccess(response.data));
        navigate('/admin/dashboard');
      } else {
        dispatch(loginFailure('Admin access required'));
        setAdminError('Admin access required. Customer and Vendor accounts cannot access the Admin Portal.');
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Admin authentication failed. Invalid email or password.');
      dispatch(loginFailure(errorMessage));
      setAdminError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans">
      {/* Brand Corner */}
      <div className="flex items-center space-x-3 mb-8 cursor-pointer" onClick={() => navigate('/login')}>
        <div className="bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-600 p-2.5 rounded-2xl text-white shadow-xl">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="text-left">
          <h1 className="font-extrabold text-2xl tracking-tight text-white">ShopStack</h1>
          <p className="text-xs text-amber-400 font-semibold tracking-wide">Admin Control Portal</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">Admin Authentication</h2>
          <p className="text-xs text-slate-400">Enter your administrator credentials to access the Control Center</p>
        </div>

        {/* Error Banner */}
        {adminError && (
          <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-xl text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{adminError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">Admin Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@shopstack.com"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => alert('Password reset instructions have been sent to your administrator email.')}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-medium hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating Admin...' : 'Sign In to Admin Portal'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          <Link
            to="/login"
            className="text-slate-400 hover:text-white font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Customer Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthPage;
