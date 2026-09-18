import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, ShoppingBag, Clock, ArrowRight, Activity, Mail, Phone, MapPin } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900/80 via-slate-900 to-purple-900/80 p-6 sm:p-8 rounded-2xl border border-indigo-500/20 shadow-xl">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-medium border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Customer Account</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-indigo-400">{user?.name || user?.email || 'Valued Customer'}</span>!
            </h1>
            <p className="text-slate-300 max-w-2xl text-sm sm:text-base">
              Manage your ShopStack account, view profile details, track active orders, and explore multi-vendor products.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-8 translate-y-8 pointer-events-none">
            <ShoppingBag className="w-64 h-64 text-indigo-400" />
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-xl shadow-md hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Account Role</p>
                <h3 className="text-2xl font-bold text-white mt-1">{user?.role || 'CUSTOMER'}</h3>
              </div>
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Active Customer Status
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-xl shadow-md hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email Address</p>
                <h3 className="text-lg font-bold text-white mt-1 truncate max-w-[200px]">{user?.email || 'N/A'}</h3>
              </div>
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
                <Mail className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Used for login & order updates</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-xl shadow-md hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Customer ID</p>
                <h3 className="text-2xl font-bold text-white mt-1">#{user?.id || '101'}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                <User className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Unique ShopStack Identifier</p>
          </div>
        </div>

        {/* Profile Quick Overview & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Profile Summary Card */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Profile Quick Summary</h2>
                  <p className="text-xs text-slate-400">Personal details stored in PostgreSQL</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg text-xs font-medium border border-indigo-500/30 transition-all cursor-pointer"
              >
                <span>View Full Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div className="flex items-center text-slate-400 text-xs mb-1">
                  <User className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Full Name
                </div>
                <div className="text-sm font-semibold text-slate-200">{user?.name || 'Not provided'}</div>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div className="flex items-center text-slate-400 text-xs mb-1">
                  <Mail className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Email Address
                </div>
                <div className="text-sm font-semibold text-slate-200">{user?.email || 'Not provided'}</div>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div className="flex items-center text-slate-400 text-xs mb-1">
                  <Phone className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Contact Phone
                </div>
                <div className="text-sm font-semibold text-slate-200">{user?.phone || 'Not provided'}</div>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div className="flex items-center text-slate-400 text-xs mb-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Delivery Address
                </div>
                <div className="text-sm font-semibold text-slate-200 truncate">{user?.address || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-indigo-400" /> Quick Actions
            </h2>

            <button
              onClick={() => navigate('/profile')}
              className="w-full flex items-center justify-between p-3.5 bg-slate-800/60 hover:bg-indigo-600/20 hover:border-indigo-500/40 rounded-xl border border-slate-700/60 text-left transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-indigo-400" />
                <div>
                  <div className="text-sm font-semibold text-white">Edit Profile Info</div>
                  <div className="text-xs text-slate-400">Update phone, address, and name</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
            <button onClick={() => navigate('/products')}
              className="w-full flex items-center justify-between p-3.5 bg-slate-800/60 hover:bg-indigo-600/20 hover:border-indigo-500/40 rounded-xl border border-slate-700/60 text-left transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-sm font-semibold text-slate-300">Browse Catalog</div>
                  <div className="text-xs text-slate-400">Multi-vendor store</div>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
            <button onClick={() => navigate('/orders')}
              className="w-full flex items-center justify-between p-3.5 bg-slate-800/60 hover:bg-indigo-600/20 hover:border-indigo-500/40 rounded-xl border border-slate-700/60 text-left transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-sm font-semibold text-slate-300">Recent Orders</div>
                  <div className="text-xs text-slate-400">View order history </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>

  );
};

export default DashboardPage;
