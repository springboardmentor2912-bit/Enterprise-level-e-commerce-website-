import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Award,
  AlertTriangle,
  RefreshCw,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [vendorPerf, setVendorPerf] = useState([]);
  const [productStats, setProductStats] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [statsRes, vendorRes, prodRes, salesRes] = await Promise.all([
        axiosClient.get('/admin/dashboard/stats'),
        axiosClient.get('/admin/dashboard/vendor-performance'),
        axiosClient.get('/admin/dashboard/product-stats'),
        axiosClient.get('/admin/reports/sales'),
      ]);
      setStats(statsRes.data);
      setVendorPerf(vendorRes.data);
      setProductStats(prodRes.data);
      setSalesReport(salesRes.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load admin dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading Admin Intelligence Dashboard...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 text-center max-w-lg space-y-3">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Dashboard Error</h2>
          <p className="text-xs text-rose-300">{errorMsg}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Admin Control Center</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Real-time marketplace monitoring, vendor analytics & revenue insights</p>
          </div>
          <button
            onClick={fetchData}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Refresh Data
          </button>
        </div>

        {/* 1. Main KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Customers */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
            <div className="absolute right-3 top-3 p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-400">Total Customers</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">{stats?.totalCustomers || 0}</h3>
            <p className="text-[11px] text-blue-400 mt-2 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Registered Buyers
            </p>
          </div>

          {/* Vendors */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
            <div className="absolute right-3 top-3 p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400">
              <Store className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-400">Total Vendors</p>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-2">{stats?.totalVendors || 0}</h3>
            <p className="text-[11px] text-purple-400 mt-2 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Active Merchants
            </p>
          </div>

          {/* Total Revenue */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
            <div className="absolute right-3 top-3 p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-400">Gross Sales Revenue</p>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
              ₹{Number(stats?.totalSalesRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-emerald-400 mt-2 font-medium">Platform Gross GMV</p>
          </div>

          {/* Platform Commission */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
            <div className="absolute right-3 top-3 p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400">
              <Percent className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-400">Platform Commission</p>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
              ₹{Number(stats?.totalPlatformCommission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-amber-400 mt-2 font-medium">Platform Earned Commission</p>
          </div>
        </div>

        {/* 2. Order Status Breakdown Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              Order Pipeline Overview ({stats?.totalOrders || 0} Total Orders)
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-[11px] text-slate-400 font-medium">Pending</p>
              <p className="text-lg font-black text-amber-400 mt-0.5">{stats?.pendingOrders || 0}</p>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <CheckCircle className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-[11px] text-slate-400 font-medium">Confirmed</p>
              <p className="text-lg font-black text-blue-400 mt-0.5">{stats?.confirmedOrders || 0}</p>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <RefreshCw className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <p className="text-[11px] text-slate-400 font-medium">Processing</p>
              <p className="text-lg font-black text-indigo-400 mt-0.5">{stats?.processingOrders || 0}</p>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <Package className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <p className="text-[11px] text-slate-400 font-medium">Shipped</p>
              <p className="text-lg font-black text-purple-400 mt-0.5">{stats?.shippedOrders || 0}</p>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-[11px] text-slate-400 font-medium">Delivered</p>
              <p className="text-lg font-black text-emerald-400 mt-0.5">{stats?.deliveredOrders || 0}</p>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <XCircle className="w-4 h-4 text-rose-400 mx-auto mb-1" />
              <p className="text-[11px] text-slate-400 font-medium">Cancelled</p>
              <p className="text-lg font-black text-rose-400 mt-0.5">{stats?.cancelledOrders || 0}</p>
            </div>
          </div>
        </div>

        {/* 3. Vendor Performance Section */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-400" /> Merchant Performance Breakdown
              </h2>
              <p className="text-xs text-slate-400">Vendor sales volume, platform commission, net vendor earnings & commission rate</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Vendor / Merchant</th>
                  <th className="py-3 px-4">Contact Email</th>
                  <th className="py-3 px-4">Rate %</th>
                  <th className="py-3 px-4 text-center">Products</th>
                  <th className="py-3 px-4 text-center">Orders Sold</th>
                  <th className="py-3 px-4 text-right">Gross Sales</th>
                  <th className="py-3 px-4 text-right">Platform Commission</th>
                  <th className="py-3 px-4 text-right">Net Vendor Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {vendorPerf.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-500">
                      No vendor performance data available.
                    </td>
                  </tr>
                ) : (
                  vendorPerf.map((v) => (
                    <tr key={v.vendorId} className="hover:bg-slate-800/40 transition-all">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                            {v.businessName?.charAt(0)}
                          </div>
                          <span>{v.businessName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">{v.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-bold">
                          {v.commissionRate}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-200">{v.totalProducts}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-200">{v.totalOrdersSold}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-100">
                        ₹{Number(v.totalGrossSales || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-amber-400">
                        ₹{Number(v.totalCommissionDeducted || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">
                        ₹{Number(v.netVendorEarnings || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
