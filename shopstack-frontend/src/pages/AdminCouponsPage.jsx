import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import {
  Ticket,
  Plus,
  Edit2,
  Trash2,
  Power,
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  Percent,
  DollarSign,
  Tag,
  Clock,
  RefreshCw,
  AlertTriangle,
  X,
} from 'lucide-react';
import { getErrorMessage } from '../api/errorUtils';

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    startDate: '',
    expiryDate: '',
    usageLimit: '',
    active: true,
    campaignName: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCouponsAndAnalytics = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [couponsRes, analyticsRes] = await Promise.all([
        axiosClient.get('/admin/coupons'),
        axiosClient.get('/admin/coupons/analytics'),
      ]);
      setCoupons(couponsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to load coupon data.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouponsAndAnalytics();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderAmount: '0',
      maxDiscount: '',
      startDate: new Date().toISOString().slice(0, 16),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      usageLimit: '100',
      active: true,
      campaignName: 'General Promotion',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'PERCENTAGE',
      discountValue: coupon.discountValue || '',
      minOrderAmount: coupon.minOrderAmount || '',
      maxDiscount: coupon.maxDiscount || '',
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : '',
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().slice(0, 16) : '',
      usageLimit: coupon.usageLimit || '',
      active: coupon.active,
      campaignName: coupon.campaignName || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) {
      alert('Code and discount value are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        startDate: formData.startDate ? formData.startDate + ':00' : null,
        expiryDate: formData.expiryDate ? formData.expiryDate + ':00' : null,
      };

      if (editingCoupon) {
        await axiosClient.put(`/admin/coupons/${editingCoupon.id}`, payload);
      } else {
        await axiosClient.post('/admin/coupons', payload);
      }

      setShowModal(false);
      fetchCouponsAndAnalytics();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to save coupon.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await axiosClient.patch(`/admin/coupons/${id}/toggle`);
      fetchCouponsAndAnalytics();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to toggle coupon status.'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon code permanently?')) return;
    try {
      await axiosClient.delete(`/admin/coupons/${id}`);
      fetchCouponsAndAnalytics();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete coupon.'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading Coupon & Promotion Engine...</p>
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
                <Ticket className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Coupon & Promotion Engine</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Manage promotional discount codes, validity windows, usage limits & track coupon ROI</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchCouponsAndAnalytics}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Refresh
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create New Coupon
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-2xl text-xs">
            {errorMsg}
          </div>
        )}

        {/* 1. Coupon Analytics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <p className="text-xs font-semibold text-slate-400">Total Promotional Coupons</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">{analytics?.totalCoupons || 0}</h3>
            <p className="text-[11px] text-amber-400 mt-1 font-medium">{analytics?.activeCoupons || 0} Active & Published</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <p className="text-xs font-semibold text-slate-400">Total Coupon Redemptions</p>
            <h3 className="text-2xl sm:text-3xl font-black text-indigo-400 mt-1">{analytics?.totalRedemptions || 0}</h3>
            <p className="text-[11px] text-indigo-300 mt-1 font-medium">Successful Customer Redemptions</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <p className="text-xs font-semibold text-slate-400">Total Savings / Discounts Given</p>
            <h3 className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">
              ₹{Number(analytics?.totalDiscountGiven || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-rose-300 mt-1 font-medium">Customer Savings Provided</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
            <p className="text-xs font-semibold text-slate-400">Coupon Generated Revenue</p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              ₹{Number(analytics?.totalRevenueWithCoupons || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-emerald-400 mt-1 font-medium">GMV from Coupon Orders</p>
          </div>
        </div>

        {/* 2. Coupons List Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-400" /> Active & Historical Coupons
              </h2>
              <p className="text-xs text-slate-400">Manage campaign codes, discount limits, validity windows & usage stats</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Coupon Code / Campaign</th>
                  <th className="py-3 px-4">Discount Type & Value</th>
                  <th className="py-3 px-4">Min Order Amount</th>
                  <th className="py-3 px-4">Max Discount</th>
                  <th className="py-3 px-4">Validity Window</th>
                  <th className="py-3 px-4 text-center">Usage Progress</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-500">
                      No coupons created yet. Click "Create New Coupon" to set up a promotion!
                    </td>
                  </tr>
                ) : (
                  coupons.map((c) => {
                    const isExpired = c.expiryDate && new Date(c.expiryDate) < new Date();
                    const isLimitReached = c.usageLimit && c.usedCount >= c.usageLimit;

                    return (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition-all">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg font-black font-mono tracking-wider">
                              {c.code}
                            </span>
                            <div>
                              <p className="font-bold text-white line-clamp-1">{c.campaignName || 'General'}</p>
                              <p className="text-[10px] text-slate-400 line-clamp-1">{c.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-400">
                          {c.discountType === 'PERCENTAGE' ? (
                            <span className="flex items-center gap-1">
                              <Percent className="w-3.5 h-3.5" /> {c.discountValue}% OFF
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3.5 h-3.5" /> ₹{c.discountValue} FLAT OFF
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-semibold">
                          ₹{Number(c.minOrderAmount || 0).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-semibold">
                          {c.maxDiscount ? `₹${Number(c.maxDiscount).toFixed(2)}` : 'No Cap'}
                        </td>
                        <td className="py-3.5 px-4 text-[11px] text-slate-400">
                          <div>
                            <span>Start: {c.startDate ? new Date(c.startDate).toLocaleDateString() : 'Immediate'}</span>
                          </div>
                          <div>
                            <span className={isExpired ? 'text-rose-400 font-bold' : ''}>
                              Exp: {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'Never'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-indigo-300">
                              {c.usedCount} / {c.usageLimit || '∞'}
                            </span>
                            {c.usageLimit && (
                              <div className="w-20 bg-slate-950 h-1.5 rounded-full overflow-hidden mx-auto border border-slate-800">
                                <div
                                  className="bg-indigo-500 h-full rounded-full transition-all"
                                  style={{ width: `${Math.min(100, (c.usedCount / c.usageLimit) * 100)}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {c.active && !isExpired && !isLimitReached ? (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                              <CheckCircle className="w-2.5 h-2.5" /> ACTIVE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                              <XCircle className="w-2.5 h-2.5" /> {isExpired ? 'EXPIRED' : isLimitReached ? 'LIMIT' : 'INACTIVE'}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleToggleActive(c.id)}
                              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                c.active
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              }`}
                              title={c.active ? 'Deactivate Coupon' : 'Activate Coupon'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(c)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-all cursor-pointer"
                              title="Edit Coupon"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-all cursor-pointer"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Create / Edit Coupon Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 relative my-8">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl bg-slate-950 border border-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-amber-400" />
                  {editingCoupon ? 'Edit Coupon Code' : 'Create New Promotional Coupon'}
                </h2>
                <p className="text-xs text-slate-400">Configure discount type, minimum order requirements, dates & usage limits</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Code */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Coupon Code *</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="e.g. FESTIVE20"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Campaign Name */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Campaign Name</label>
                    <input
                      type="text"
                      name="campaignName"
                      value={formData.campaignName}
                      onChange={handleInputChange}
                      placeholder="e.g. Summer Mega Sale"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Discount Type */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Discount Type *</label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="PERCENTAGE">PERCENTAGE (% OFF)</option>
                      <option value="FIXED">FIXED DISCOUNT (₹ FLAT OFF)</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">
                      Discount Value * ({formData.discountType === 'PERCENTAGE' ? '%' : '₹'})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 500'}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Min Order Amount */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Min Order Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="minOrderAmount"
                      value={formData.minOrderAmount}
                      onChange={handleInputChange}
                      placeholder="e.g. 500"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Max Discount (Cap for Percentage) */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Max Discount Cap (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="maxDiscount"
                      value={formData.maxDiscount}
                      onChange={handleInputChange}
                      placeholder="e.g. 300 (Optional for %)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Expiry Date & Time</label>
                    <input
                      type="datetime-local"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Usage Limit */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold">Overall Usage Limit</label>
                    <input
                      type="number"
                      name="usageLimit"
                      value={formData.usageLimit}
                      onChange={handleInputChange}
                      placeholder="e.g. 100 max uses"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center gap-2 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-bold">
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-950 border-slate-800"
                      />
                      <span>Active & Enabled</span>
                    </label>
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-300 font-bold">Coupon Description</label>
                    <textarea
                      name="description"
                      rows="2"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="e.g. Get 20% OFF up to ₹500 on all electronics!"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                    ></textarea>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl shadow-lg cursor-pointer"
                  >
                    {submitting ? 'Saving Coupon...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminCouponsPage;
