import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { getErrorMessage } from '../api/errorUtils';
import {
  Percent,
  DollarSign,
  Store,
  Edit2,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Info,
} from 'lucide-react';

const AdminCommissionsPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [editingVendorId, setEditingVendorId] = useState(null);
  const [newRate, setNewRate] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCommissions = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axiosClient.get('/admin/commissions');
      setSummary(res.data);
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to load commission data.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const handleStartEdit = (vendor) => {
    setEditingVendorId(vendor.vendorId);
    setNewRate(vendor.commissionRate || '10.00');
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleCancelEdit = () => {
    setEditingVendorId(null);
    setNewRate('');
  };

  const handleSaveRate = async (vendorId) => {
    const rateNum = Number(newRate);
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      setErrorMsg('Please enter a valid commission rate percentage between 0 and 100.');
      return;
    }

    setUpdating(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await axiosClient.put(`/admin/vendors/${vendorId}/commission-rate?rate=${rateNum}`);
      setSuccessMsg(`Vendor commission rate updated to ${rateNum}% successfully!`);
      setEditingVendorId(null);
      fetchCommissions();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to update vendor commission rate.'));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading Commission Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Percent className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Vendor Commission Engine</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Configure platform commission percentages & monitor vendor earnings</p>
          </div>
          <button
            onClick={fetchCommissions}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Refresh Summary
          </button>
        </div>

        {/* Success / Error Banners */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs font-semibold">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-2xl text-xs">
            {errorMsg}
          </div>
        )}

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-4 top-4 p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-400">Total Order Volume (GMV)</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">
              ₹{Number(summary?.totalOrderVolume || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-blue-400 mt-2">Gross Marketplace Value</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-4 top-4 p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400">
              <Percent className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-400">Platform Commission Retained</p>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
              ₹{Number(summary?.totalPlatformCommission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-amber-400 mt-2">Calculated per vendor rate</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-4 top-4 p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-400">Total Net Vendor Payouts</p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
              ₹{Number(summary?.totalVendorPayouts || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-emerald-400 mt-2">Vendor Earning </p>
          </div>
        </div>

        {/* Vendor Commission Rates & Breakdown Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400" /> Vendor-wise Commission Table
              </h2>
              <p className="text-xs text-slate-400">View vendor performance and edit individual commission rate %</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Vendor ID</th>
                  <th className="py-3 px-4">Business Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Items Sold</th>
                  <th className="py-3 px-4 text-right">Gross Sales</th>
                  <th className="py-3 px-4 text-center">Commission Rate %</th>
                  <th className="py-3 px-4 text-right">Commission Deducted</th>
                  <th className="py-3 px-4 text-right">Net Vendor Payout</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {summary?.vendorCommissions?.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-8 text-center text-slate-500">
                      No vendor commission records found.
                    </td>
                  </tr>
                ) : (
                  summary?.vendorCommissions?.map((v) => {
                    const isEditing = editingVendorId === v.vendorId;
                    return (
                      <tr key={v.vendorId} className="hover:bg-slate-800/40 transition-all">
                        <td className="py-3.5 px-4 font-mono text-slate-400">#{v.vendorId}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{v.businessName}</td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono">{v.email}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-200">{v.totalItemsSold}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-white">
                          ₹{Number(v.totalGrossSales || 0).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="100"
                                value={newRate}
                                onChange={(e) => setNewRate(e.target.value)}
                                className="w-16 bg-slate-950 border border-amber-500/50 text-amber-400 text-center font-bold rounded-lg py-1 text-xs focus:outline-none"
                              />
                              <span className="text-amber-400 font-bold">%</span>
                            </div>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg font-bold">
                              {v.commissionRate}%
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-amber-400">
                          ₹{Number(v.platformCommissionDeducted ?? v.totalCommissionDeducted ?? 0).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">
                          ₹{Number(v.netVendorEarnings || 0).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleSaveRate(v.vendorId)}
                                disabled={updating}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all cursor-pointer"
                                title="Save Rate"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(v)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 mx-auto cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3 text-amber-400" /> Change Rate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCommissionsPage;
