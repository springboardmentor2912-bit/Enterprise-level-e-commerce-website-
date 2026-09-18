import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
  Package,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Layers,
  Percent,
  TrendingUp,
} from 'lucide-react';

const VendorDashboardPage = () => {
  const navigate = useNavigate();
  const { vendor } = useSelector((state) => state.vendorAuth);

  const [analytics, setAnalytics] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const [analyticsRes, earningsRes] = await Promise.all([
        axiosClient.get('/vendor/dashboard'),
        axiosClient.get('/vendor/earnings'),
      ]);
      setAnalytics(analyticsRes.data);
      setEarnings(earningsRes.data);
    } catch (err) {
      console.error('Failed to fetch vendor data', err);
      setFetchError(err.response?.data?.message || 'Failed to load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl border border-purple-500/30 shadow-2xl">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold border border-purple-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Merchant Control Panel</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome, <span className="text-purple-400">{vendor?.businessName || earnings?.businessName || 'Vendor Merchant'}</span>!
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Monitor gross sales, platform commission deductions, net earnings payout, inventory stock, and sales orders.
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {fetchError && (
          <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{fetchError}</span>
          </div>
        )}

        {/* Quick Refresh */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Layers className="w-5 h-5 mr-2 text-purple-400" /> Merchant Performance & Financial Summary
          </h2>
          <button
            onClick={fetchData}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 transition-all cursor-pointer"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Financial KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Gross Sales */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-md hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Sales Volume</p>
                <h3 className="text-2xl font-black text-white mt-1">
                  ₹{Number(earnings?.totalGrossSales || analytics?.totalRevenue || 0).toFixed(2)}
                </h3>
              </div>
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3">Total sales value before commission</p>
          </div>

          {/* Platform Commission Deducted */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-md hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Commission Deducted</p>
                <h3 className="text-2xl font-black text-amber-400 mt-1">
                  ₹{Number(earnings?.totalCommissionDeducted || 0).toFixed(2)}
                </h3>
              </div>
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                <Percent className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-amber-400 mt-3 font-semibold">
              Platform Rate: {earnings?.commissionRate || 10}%
            </p>
          </div>

          {/* Net Vendor Earnings */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-md hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Vendor Earnings</p>
                <h3 className="text-2xl font-black text-emerald-400 mt-1">
                  ₹{Number(earnings?.netEarnings || 0).toFixed(2)}
                </h3>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-emerald-400 mt-3 font-semibold">Your Net Take-Home Revenue</p>
          </div>

          {/* Active Listings / Low Stock */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-md hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Product Listings</p>
                <h3 className="text-2xl font-black text-white mt-1">{analytics?.totalProducts || 0}</h3>
              </div>
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-amber-400 mt-3 font-semibold">
              {analytics?.lowStockProducts || 0} Low Stock Alerts (&lt; 5)
            </p>
          </div>
        </div>

        {/* Itemized Commission & Earnings Breakdown Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Percent className="w-5 h-5 text-amber-400" /> Itemized Order Earnings & Commission Deductions
              </h3>
              <p className="text-xs text-slate-400">Order-by-order breakdown of sales amount, platform commission cut & net payout</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Price @ Purchase</th>
                  <th className="py-3 px-4 text-right">Item Total</th>
                  <th className="py-3 px-4 text-center">Comm %</th>
                  <th className="py-3 px-4 text-right">Platform Cut</th>
                  <th className="py-3 px-4 text-right">Net Earning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {earnings?.itemizedEarnings?.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-500">
                      No order earnings recorded yet.
                    </td>
                  </tr>
                ) : (
                  earnings?.itemizedEarnings?.map((item) => (
                    <tr key={item.orderItemId} className="hover:bg-slate-800/40 transition-all">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-300">#{item.orderId}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{item.productName}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-200">{item.quantity}</td>
                      <td className="py-3.5 px-4 text-right text-slate-300">₹{Number(item.priceAtPurchase || 0).toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-white">₹{Number(item.itemTotal || 0).toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-bold">
                          {item.commissionRate}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-amber-400">− ₹{Number(item.commissionDeducted || 0).toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">₹{Number(item.netEarning || 0).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center">
              <Package className="w-5 h-5 mr-2 text-purple-400" /> Inventory & Price Management
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Add new products with categories, brand, description, and multi-image gallery. Modify prices and stock quantities in real time.
            </p>
            <button
              onClick={() => navigate('/vendor/products')}
              className="w-full flex items-center justify-between p-3.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-2xl transition-all cursor-pointer font-semibold text-xs"
            >
              <span>Manage Products & Stock</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-indigo-400" /> Merchant Order Monitoring
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              View customer orders placed for your vendor items, track delivery fulfillment status, and monitor sales activity.
            </p>
            <button
              onClick={() => navigate('/vendor/orders')}
              className="w-full flex items-center justify-between p-3.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-2xl transition-all cursor-pointer font-semibold text-xs"
            >
              <span>View Customer Sales Orders</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VendorDashboardPage;
