import React, { useEffect, useMemo, useState } from 'react';
import {
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  setCouponStatus,
  getCouponAnalytics,
  getCouponUsages,
} from '../../services/couponService';

const emptyForm = {
  code: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minOrderAmount: '',
  maxDiscount: '',
  startDate: '',
  expiryDate: '',
  usageLimit: '',
  perCustomerLimit: '',
  active: true,
};

const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
  INACTIVE: 'bg-stone-100 text-slate-600 border-stone-200',
  EXPIRED: 'bg-rose-50 text-rose-700 border-rose-200',
  LIMIT_REACHED: 'bg-amber-50 text-amber-700 border-amber-200',
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [usages, setUsages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [busyId, setBusyId] = useState(null);
  const [showUsages, setShowUsages] = useState(false);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError('');
      const [couponsRes, analyticsRes, usagesRes] = await Promise.all([
        getAdminCoupons(),
        getCouponAnalytics(),
        getCouponUsages(),
      ]);
      setCoupons(Array.isArray(couponsRes) ? couponsRes : []);
      setAnalytics(Array.isArray(analyticsRes) ? analyticsRes : []);
      setUsages(Array.isArray(usagesRes) ? usagesRes : []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
      setError('Unable to load coupon information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const analyticsByCode = useMemo(() => {
    const map = {};
    analytics.forEach((a) => {
      map[a.code] = a;
    });
    return map;
  }, [analytics]);

  const totalDiscountGiven = useMemo(
    () => analytics.reduce((sum, a) => sum + Number(a.totalDiscountGiven || 0), 0),
    [analytics]
  );

  const totalUsages = useMemo(
    () => analytics.reduce((sum, a) => sum + Number(a.usageCount || 0), 0),
    [analytics]
  );

  const formatCurrency = (value) =>
    `\u20B9${Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (value) => {
    if (!value) return '\u2014';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (value) => {
    if (!value) return '\u2014';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '\u2014';
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code || '',
      discountType: coupon.discountType || 'PERCENTAGE',
      discountValue: coupon.discountValue ?? '',
      minOrderAmount: coupon.minOrderAmount ?? '',
      maxDiscount: coupon.maxDiscount ?? '',
      startDate: coupon.startDate || '',
      expiryDate: coupon.expiryDate || '',
      usageLimit: coupon.usageLimit ?? '',
      perCustomerLimit: coupon.perCustomerLimit ?? '',
      active: coupon.active,
    });
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        code: form.code,
        discountType: form.discountType,
        discountValue: form.discountValue === '' ? null : Number(form.discountValue),
        minOrderAmount: form.minOrderAmount === '' ? null : Number(form.minOrderAmount),
        maxDiscount: form.maxDiscount === '' ? null : Number(form.maxDiscount),
        startDate: form.startDate,
        expiryDate: form.expiryDate,
        usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
        perCustomerLimit: form.perCustomerLimit === '' ? null : Number(form.perCustomerLimit),
        active: form.active,
      };
      if (editingId) {
        await updateCoupon(editingId, payload);
      } else {
        await createCoupon(payload);
      }
      closeForm();
      await loadAll();
    } catch (err) {
      console.error('Failed to save coupon:', err);
      setFormError(err.response?.data || 'Failed to save this coupon. Please check the details and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      setBusyId(coupon.id);
      await setCouponStatus(coupon.id, !coupon.active);
      await loadAll();
    } catch (err) {
      console.error('Failed to toggle coupon status:', err);
      setError('Unable to update the coupon status. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (coupon) => {
    const hasUsage = Number(coupon.usageCount || 0) > 0;

    if (hasUsage) {
      window.alert(
        `Coupon "${coupon.code}" has already been used.\n\nUsed coupons cannot be deleted because their usage history must be preserved. Please deactivate the coupon instead.`
      );
      return;
    }

    if (!window.confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    try {
      setBusyId(coupon.id);
      await deleteCoupon(coupon.id);
      await loadAll();
    } catch (err) {
      console.error('Failed to delete coupon:', err);
      const backendMessage = err.response?.data;
      setError(
        typeof backendMessage === 'string'
          ? backendMessage
          : 'Unable to delete this coupon. Please try again.'
      );
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
              Coupons &amp; Promotions
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create discount codes and track how they perform.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer shadow-xs"
          >
            + Create Coupon
          </button>
        </div>

        {/* ANALYTICS SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Coupons</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {coupons.filter((c) => c.computedStatus === 'ACTIVE').length}
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Redemptions</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalUsages}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-medium text-emerald-800 uppercase tracking-wider">Total Discount Given</span>
            <p className="text-2xl font-bold text-emerald-900 mt-1">{formatCurrency(totalDiscountGiven)}</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200/80 text-rose-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* CREATE / EDIT FORM */}
        {showForm && (
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">
                {editingId ? 'Edit Coupon' : 'Create Coupon'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200/80 text-rose-700 text-xs px-3 py-2 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => handleFormChange('code', e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE20"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Discount Type *</label>
                <select
                  value={form.discountType}
                  onChange={(e) => handleFormChange('discountType', e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (\u20B9)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Discount Value * {form.discountType === 'PERCENTAGE' ? '(%)' : '(\u20B9)'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.discountValue}
                  onChange={(e) => handleFormChange('discountValue', e.target.value)}
                  placeholder={form.discountType === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 200'}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Max Discount (\u20B9) {form.discountType !== 'PERCENTAGE' && <span className="text-slate-400 font-normal">— % only</span>}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={form.discountType !== 'PERCENTAGE'}
                  value={form.maxDiscount}
                  onChange={(e) => handleFormChange('maxDiscount', e.target.value)}
                  placeholder="Leave blank for no cap"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:bg-stone-50 disabled:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Minimum Order Amount (\u20B9)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minOrderAmount}
                  onChange={(e) => handleFormChange('minOrderAmount', e.target.value)}
                  placeholder="Leave blank for no minimum"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Usage Limit</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.usageLimit}
                  onChange={(e) => handleFormChange('usageLimit', e.target.value)}
                  placeholder="Leave blank for unlimited"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Per Customer Limit</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.perCustomerLimit}
                  onChange={(e) => handleFormChange('perCustomerLimit', e.target.value)}
                  placeholder="Leave blank for unlimited"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <p className="mt-1 text-[11px] text-slate-400">Maximum times one customer can redeem this coupon.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => handleFormChange('startDate', e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={form.expiryDate}
                  onChange={(e) => handleFormChange('expiryDate', e.target.value)}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  id="active-checkbox"
                  checked={form.active}
                  onChange={(e) => handleFormChange('active', e.target.checked)}
                  className="accent-slate-900"
                />
                <label htmlFor="active-checkbox" className="text-sm text-slate-700">
                  Active (customers can use this coupon immediately, subject to its dates)
                </label>
              </div>

              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Coupon'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-stone-300 text-slate-700 hover:bg-stone-50 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* COUPON LIST */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200">
            <h2 className="text-sm font-semibold text-slate-900">All Coupons</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th scope="col" className="px-6 py-4">Code</th>
                  <th scope="col" className="px-6 py-4">Discount</th>
                  <th scope="col" className="px-6 py-4">Min Order</th>
                  <th scope="col" className="px-6 py-4">Valid Period</th>
                  <th scope="col" className="px-6 py-4">Usage</th>
                  <th scope="col" className="px-6 py-4">Per Customer</th>
                  <th scope="col" className="px-6 py-4">Discount Given</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm text-slate-700">
                {coupons.length > 0 ? (
                  coupons.map((coupon) => {
                    const stats = analyticsByCode[coupon.code];
                    return (
                      <tr key={coupon.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 font-mono">{coupon.code}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {coupon.discountType === 'PERCENTAGE'
                            ? `${Number(coupon.discountValue).toFixed(0)}%${coupon.maxDiscount ? ` (max ${formatCurrency(coupon.maxDiscount)})` : ''}`
                            : formatCurrency(coupon.discountValue)}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {coupon.minOrderAmount ? formatCurrency(coupon.minOrderAmount) : '\u2014'}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {formatDate(coupon.startDate)} \u2192 {formatDate(coupon.expiryDate)}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {coupon.usageCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {coupon.perCustomerLimit || '\u2014'}
                        </td>
                        <td className="px-6 py-4 font-semibold text-emerald-700">
                          {formatCurrency(stats ? stats.totalDiscountGiven : 0)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                              STATUS_STYLES[coupon.computedStatus] || 'bg-stone-100 text-slate-700 border-stone-200'
                            }`}
                          >
                            {coupon.computedStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openEditForm(coupon)}
                              className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(coupon)}
                              disabled={busyId === coupon.id}
                              className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer disabled:opacity-50"
                            >
                              {coupon.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(coupon)}
                              disabled={busyId === coupon.id}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-10 text-center text-slate-500">
                      No coupons created yet. Click "Create Coupon" to add your first one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* USAGE / TRACKING */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
          <button
            type="button"
            onClick={() => setShowUsages((prev) => !prev)}
            className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer"
          >
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Coupon Usage History</h2>
              <p className="text-xs text-slate-500 mt-0.5">Every redemption — coupon, customer, order, discount, and when it happened.</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{showUsages ? 'Hide' : 'Show'}</span>
          </button>
          {showUsages && (
            <div className="overflow-x-auto border-t border-stone-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50/80 border-b border-stone-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th scope="col" className="px-6 py-4">Coupon</th>
                    <th scope="col" className="px-6 py-4">Customer</th>
                    <th scope="col" className="px-6 py-4">Order ID</th>
                    <th scope="col" className="px-6 py-4">Discount</th>
                    <th scope="col" className="px-6 py-4">Date/Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm text-slate-700">
                  {usages.length > 0 ? (
                    usages.map((usage) => (
                      <tr key={usage.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 font-mono">{usage.couponCode}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {usage.customerName || usage.customerEmail}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">#{usage.orderId}</td>
                        <td className="px-6 py-4 font-semibold text-emerald-700">{formatCurrency(usage.discountAmount)}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{formatDateTime(usage.usedAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                        No coupons have been used yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-stone-200 rounded-md"></div>
          <div className="h-4 w-80 bg-stone-200 rounded-md"></div>
        </div>
        <div className="h-10 w-36 bg-stone-200 rounded-xl"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-stone-200 rounded-2xl"></div>
        ))}
      </div>
      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
        <div className="h-8 bg-stone-100 rounded-md w-full"></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-stone-50 rounded-md w-full"></div>
        ))}
      </div>
    </div>
  </div>
);

export default AdminCoupons;