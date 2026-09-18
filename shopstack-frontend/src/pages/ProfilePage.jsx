import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import {
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  resetUpdateSuccess,
} from '../store/slices/authSlice';
import { User, Mail, Phone, MapPin, Shield, Edit3, CheckCircle, AlertCircle, RefreshCw, Calendar } from 'lucide-react';
import { getErrorMessage } from '../api/errorUtils';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, error, updateSuccess } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('view'); // 'view' | 'edit'
  const [profileData, setProfileData] = useState(null);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  // Fetch live profile from GET /api/customers/profile
  const loadProfile = async () => {
    setFetchingProfile(true);
    setFetchError('');
    try {
      const response = await axiosClient.get('/customers/profile');
      setProfileData(response.data);
      setFormData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
      });
    } catch (err) {
      setFetchError(getErrorMessage(err, 'Failed to fetch customer profile.'));
    } finally {
      setFetchingProfile(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    dispatch(updateProfileStart());

    try {
      const response = await axiosClient.put('/customers/profile', {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });

      dispatch(updateProfileSuccess(response.data));
      setProfileData(response.data);
      setActiveTab('view');

      setTimeout(() => {
        dispatch(resetUpdateSuccess());
      }, 5000);
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'Failed to update profile details.');
      dispatch(updateProfileFailure(errorMsg));
    }
  };

  const currentDisplayUser = profileData || user;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
              {currentDisplayUser?.name ? currentDisplayUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{currentDisplayUser?.name || 'Customer Profile'}</h1>
              <p className="text-slate-400 text-sm">{currentDisplayUser?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadProfile}
              disabled={fetchingProfile}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
              title="Refresh Profile"
            >
              <RefreshCw className={`w-4 h-4 ${fetchingProfile ? 'animate-spin' : ''}`} />
            </button>

            <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('view')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'view'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                View Profile
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'edit'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Banners */}
        {updateSuccess && (
          <div className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>Profile successfully updated </span>
          </div>
        )}

        {(error || fetchError) && (
          <div className="flex items-center space-x-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error || fetchError}</span>
          </div>
        )}

        {/* Tab 1: View Profile */}
        {activeTab === 'view' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center">
                <User className="w-5 h-5 mr-2 text-indigo-400" /> Account Details
              </h2>
              <button
                onClick={() => setActiveTab('edit')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-500/30 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1 p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Full Name
                </span>
                <p className="text-base font-semibold text-white">{currentDisplayUser?.name || 'N/A'}</p>
              </div>

              <div className="space-y-1 p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Email Address
                </span>
                <p className="text-base font-semibold text-white">{currentDisplayUser?.email || 'N/A'}</p>
              </div>

              <div className="space-y-1 p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Phone Number
                </span>
                <p className="text-base font-semibold text-white">{currentDisplayUser?.phone || 'Not provided'}</p>
              </div>

              <div className="space-y-1 p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 flex items-center">
                  <Shield className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Account Role
                </span>
                <p className="text-base font-semibold text-indigo-300">{currentDisplayUser?.role || 'CUSTOMER'}</p>
              </div>

              <div className="md:col-span-2 space-y-1 p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Shipping & Billing Address
                </span>
                <p className="text-base font-semibold text-white">{currentDisplayUser?.address || 'Not provided'}</p>
              </div>

              {currentDisplayUser?.createdAt && (
                <div className="md:col-span-2 space-y-1 p-4 bg-slate-950/50 rounded-xl border border-slate-800/80">
                  <span className="text-xs text-slate-400 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Account Created
                  </span>
                  <p className="text-sm font-semibold text-slate-300">
                    {new Date(currentDisplayUser.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Edit Profile */}
        {activeTab === 'edit' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center">
                <Edit3 className="w-5 h-5 mr-2 text-indigo-400" /> Update Customer Profile
              </h2>
              <p className="text-xs text-slate-400">
                Changes will be transmitted to <code className="text-indigo-300">PUT /api/customers/profile</code> and updated in PostgreSQL.
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">Shipping Address</label>
                <textarea
                  name="address"
                  rows="3"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full street address, city, state, and zip code"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('view')}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
