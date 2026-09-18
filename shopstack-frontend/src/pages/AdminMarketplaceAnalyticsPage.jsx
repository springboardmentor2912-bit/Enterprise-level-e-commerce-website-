import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { getErrorMessage } from '../api/errorUtils';
import {
  BarChart3,
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Percent,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

const AdminMarketplaceAnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [vendorPerf, setVendorPerf] = useState([]);
  const [productStats, setProductStats] = useState(null);
  const [salesReport, setSalesReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

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
      setErrorMsg(getErrorMessage(err, 'Failed to load marketplace analytics.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading Marketplace Analytics...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 text-center max-w-lg space-y-3">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Analytics Error</h2>
          <p className="text-xs text-rose-300">{errorMsg}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // Simple SVG bar chart component
  const BarChart = ({ data, labelKey, valueKey, color = '#f59e0b' }) => {
    if (!data || data.length === 0) return <p className="text-slate-500 text-xs py-4 text-center">No data available</p>;
    const maxVal = Math.max(...data.map((d) => Number(d[valueKey] || 0)));
    return (
      <div className="flex items-end gap-2 h-28 mt-2">
        {data.slice(0, 10).map((d, i) => {
          const pct = maxVal > 0 ? (Number(d[valueKey] || 0) / maxVal) * 100 : 0;
          return (
            <div key={i} className="flex flex-col items-center flex-1 gap-1 group relative">
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                {d[labelKey]}: {Number(d[valueKey] || 0).toFixed(0)}
              </div>
              <div
                className="w-full rounded-t-lg transition-all"
                style={{ height: `${Math.max(pct, 4)}%`, backgroundColor: color, opacity: 0.7 + 0.3 * (i / data.length) }}
              />
              <span className="text-[8px] text-slate-500 text-center leading-tight truncate w-full">{d[labelKey]?.slice(0, 6)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const dailyChartData = (salesReport?.dailySalesBreakdown || []).slice(-10).map((d) => ({
    date: d.date?.slice(5),
    revenue: Number(d.totalSales || 0),
  }));

  const topVendors = [...vendorPerf].sort((a, b) => Number(b.totalGrossSales || 0) - Number(a.totalGrossSales || 0)).slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <BarChart3 className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Marketplace Analytics</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Real-time metrics sourced from PostgreSQL — live marketplace intelligence</p>
          </div>
          <button
            onClick={fetchData}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Customers', value: stats?.totalCustomers, icon: Users, color: 'blue' },
            { label: 'Total Vendors', value: stats?.totalVendors, icon: Store, color: 'purple' },
            { label: 'Total Products', value: stats?.totalProducts, icon: Package, color: 'indigo' },
            { label: 'Total Orders', value: stats?.totalOrders, icon: ShoppingBag, color: 'teal' },
            { label: 'Gross Revenue', value: `₹${Number(stats?.totalSalesRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'emerald' },
            { label: 'Platform Commission', value: `₹${Number(stats?.totalPlatformCommission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Percent, color: 'amber' },
          ].map((kpi) => {
            const Icon = kpi.icon;
            const colorMap = {
              blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
              purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
              indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
              teal: 'bg-teal-500/10 border-teal-500/20 text-teal-400',
              emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
              amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
            };
            return (
              <div key={kpi.label} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg">
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center mb-2 ${colorMap[kpi.color]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">{kpi.label}</p>
                <p className="text-lg font-black text-white mt-1">{kpi.value ?? 0}</p>
              </div>
            );
          })}
        </div>

        {/* Order Pipeline */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <ShoppingBag className="w-5 h-5 text-indigo-400" /> Orders by Status
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { label: 'Pending', val: stats?.pendingOrders, icon: Clock, color: 'text-amber-400' },
              { label: 'Confirmed', val: stats?.confirmedOrders, icon: CheckCircle, color: 'text-blue-400' },
              { label: 'Processing', val: stats?.processingOrders, icon: RefreshCw, color: 'text-indigo-400' },
              { label: 'Shipped', val: stats?.shippedOrders, icon: Package, color: 'text-purple-400' },
              { label: 'Delivered', val: stats?.deliveredOrders, icon: CheckCircle, color: 'text-emerald-400' },
              { label: 'Cancelled', val: stats?.cancelledOrders, icon: XCircle, color: 'text-rose-400' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                  <Icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
                  <p className="text-[11px] text-slate-400">{s.label}</p>
                  <p className={`text-xl font-black mt-0.5 ${s.color}`}>{s.val ?? 0}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Products + Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Products */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
              <Award className="w-4 h-4 text-amber-400" /> Top Selling Products
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {productStats?.topSellingProducts?.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-4">No product sales data yet.</p>
              ) : (
                productStats?.topSellingProducts?.map((p, idx) => (
                  <div key={p.productId} className="flex items-center gap-3 py-2 border-b border-slate-800/50 last:border-b-0">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-400 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{p.productName}</p>
                      <p className="text-[10px] text-slate-400">{p.categoryName} · <span className="text-indigo-300">{p.vendorName}</span></p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-black text-emerald-400">₹{Number(p.totalRevenueGenerated || 0).toFixed(0)}</p>
                      <p className="text-[10px] text-slate-400">{p.totalUnitsSold} units</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Category Product Breakdown */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
              <Layers className="w-4 h-4 text-purple-400" /> Products by Category
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {Object.entries(productStats?.categoryProductCounts || {}).length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-4">No category data available.</p>
              ) : (
                Object.entries(productStats?.categoryProductCounts || {}).map(([cat, count]) => {
                  const total = Object.values(productStats?.categoryProductCounts || {}).reduce((s, c) => s + Number(c), 0);
                  const pct = total > 0 ? (Number(count) / total) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-300">{cat}</span>
                        <span className="text-xs font-bold text-purple-400">{count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500/70 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Gross Sales Volume', val: `₹${Number(salesReport?.totalGrossSales || 0).toFixed(2)}`, color: 'text-white' },
            { label: 'Discounts Given', val: `−₹${Number(salesReport?.totalDiscountsGiven || 0).toFixed(2)}`, color: 'text-rose-400' },
            { label: 'Net Platform Sales', val: `₹${Number(salesReport?.totalNetSales || 0).toFixed(2)}`, color: 'text-emerald-400' },
            { label: 'Commission Earned', val: `₹${Number(salesReport?.totalPlatformCommission || 0).toFixed(2)}`, color: 'text-amber-400' },
          ].map((r) => (
            <div key={r.label} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
              <p className="text-[11px] text-slate-400">{r.label}</p>
              <p className={`text-base font-extrabold mt-1 ${r.color}`}>{r.val}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdminMarketplaceAnalyticsPage;
