import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import {
  Store,
  Mail,
  Phone,
  Package,
  ShoppingBag,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  AlertTriangle,
  Percent,
  DollarSign,
  Search,
} from 'lucide-react';

import { getErrorMessage } from '../api/errorUtils';

const AdminVendorManagementPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const fetchVendors = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axiosClient.get('/admin/vendors');
      setVendors(res.data);
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to load vendors.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleToggleStatus = async (vendorId, currentActive) => {
    setTogglingId(vendorId);
    try {
      const res = await axiosClient.put(`/admin/vendors/${vendorId}/status`, null, {
        params: { active: !currentActive },
      });
      setVendors((prev) =>
        prev.map((v) => (v.vendorId === vendorId ? { ...v, active: res.data.active } : v))
      );
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to toggle vendor status.'));
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = vendors.filter((v) =>
    !searchQuery ||
    v.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading Vendor Directory...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 text-center max-w-lg space-y-3">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Error Loading Vendors</h2>
          <p className="text-xs text-rose-300">{errorMsg}</p>
          <button
            onClick={fetchVendors}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const activeCount = vendors.filter((v) => v.active !== false).length;
  const totalGMV = vendors.reduce((sum, v) => sum + Number(v.totalGrossSales || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Store className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Vendor Management</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Manage all marketplace vendors — status, products, and performance</p>
          </div>
          <button
            onClick={fetchVendors}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Refresh
          </button>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400">Total Vendors</p>
            <p className="text-2xl font-black text-white mt-1">{vendors.length}</p>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400">Active Vendors</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{activeCount}</p>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400">Inactive Vendors</p>
            <p className="text-2xl font-black text-rose-400 mt-1">{vendors.length - activeCount}</p>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400">Total GMV</p>
            <p className="text-lg font-black text-amber-400 mt-1">
              ₹{totalGMV.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by vendor name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Vendor Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center text-slate-500 py-12">No vendors found.</div>
          ) : (
            filtered.map((v) => {
              const isActive = v.active !== false;
              return (
                <div
                  key={v.vendorId}
                  className={`bg-slate-900/90 border rounded-2xl p-5 shadow-lg space-y-4 transition-all ${
                    isActive ? 'border-slate-800' : 'border-rose-900/40 bg-rose-950/10'
                  }`}
                >
                  {/* Vendor Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-lg">
                        {v.businessName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{v.businessName}</p>
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Toggle Status */}
                    <button
                      onClick={() => handleToggleStatus(v.vendorId, isActive)}
                      disabled={togglingId === v.vendorId}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isActive
                          ? 'text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
                          : 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                      } disabled:opacity-50`}
                      title={isActive ? 'Deactivate vendor' : 'Activate vendor'}
                    >
                      {togglingId === v.vendorId ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : isActive ? (
                        <ToggleRight className="w-4 h-4" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                      {isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>

                  {/* Contact */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="font-mono truncate">{v.email}</span>
                    </div>
                    {v.phone && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{v.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Commission Rate */}
                  <div className="flex items-center gap-2 text-xs">
                    <Percent className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-slate-400">Commission Rate:</span>
                    <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {v.commissionRate}%
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-800 pt-3">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                        <Package className="w-3 h-3" />
                      </div>
                      <p className="text-sm font-black text-slate-200">{v.totalProducts}</p>
                      <p className="text-[10px] text-slate-500">Products</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                        <ShoppingBag className="w-3 h-3" />
                      </div>
                      <p className="text-sm font-black text-slate-200">{v.totalOrdersSold}</p>
                      <p className="text-[10px] text-slate-500">Orders</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                        <TrendingUp className="w-3 h-3" />
                      </div>
                      <p className="text-sm font-black text-emerald-400">
                        ₹{Number(v.totalGrossSales || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-[10px] text-slate-500">Gross Sales</p>
                    </div>
                  </div>

                  {/* Earnings Breakdown */}
                  <div className="bg-slate-950 rounded-xl p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Platform Commission</span>
                      <span className="font-bold text-amber-400">₹{Number(v.totalCommissionDeducted || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Net Vendor Payout</span>
                      <span className="font-bold text-emerald-400">₹{Number(v.netVendorEarnings || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVendorManagementPage;
