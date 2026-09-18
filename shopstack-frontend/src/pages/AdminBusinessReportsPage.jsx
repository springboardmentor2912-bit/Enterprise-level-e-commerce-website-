import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { getErrorMessage } from '../api/errorUtils';
import {
  FileText,
  RefreshCw,
  AlertTriangle,
  Download,
  BarChart3,
  DollarSign,
  ShoppingBag,
  Store,
  Package,
  Percent,
} from 'lucide-react';

const REPORT_TABS = [
  { id: 'sales', label: 'Sales Report', icon: BarChart3 },
  { id: 'revenue', label: 'Revenue Report', icon: DollarSign },
  { id: 'orders', label: 'Order Report', icon: ShoppingBag },
  { id: 'vendor', label: 'Vendor Performance', icon: Store },
  { id: 'products', label: 'Product Performance', icon: Package },
  { id: 'commission', label: 'Commission Report', icon: Percent },
];

const AdminBusinessReportsPage = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('sales');

  const fetchReports = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axiosClient.get('/admin/reports/comprehensive');
      setReports(res.data);
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to load business reports.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // CSV export helper
  const exportCSV = (rows, headers, filename) => {
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => `"${r[h] ?? ''}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading Business Reports...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 text-center max-w-lg space-y-3">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Reports Error</h2>
          <p className="text-xs text-rose-300">{errorMsg}</p>
          <button onClick={fetchReports} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const sr = reports?.salesReport;
  const rr = reports?.revenueReport;
  const or_ = reports?.orderReport;
  const vp = reports?.vendorPerformanceReport || [];
  const pp = reports?.productPerformanceReport;
  const cr = reports?.commissionReport;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FileText className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Business Reports</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Comprehensive PostgreSQL-sourced reports — export to CSV</p>
          </div>
          <button
            onClick={fetchReports}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Refresh
          </button>
        </div>

        {/* Report Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {REPORT_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                  activeTab === tab.id
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── Sales Report ─────────────────────────────────────────────────── */}
        {activeTab === 'sales' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" /> Sales Report
              </h2>
              <button
                onClick={() => exportCSV(
                  sr?.dailySalesBreakdown || [],
                  ['date', 'orderCount', 'totalSales', 'commissionEarned'],
                  'sales_report.csv'
                )}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-500/20 transition-all"
              >
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Gross Volume', val: `₹${Number(sr?.totalGrossSales || 0).toFixed(2)}`, color: 'text-white' },
                { label: 'Discounts Given', val: `₹${Number(sr?.totalDiscountsGiven || 0).toFixed(2)}`, color: 'text-rose-400' },
                { label: 'Net Sales', val: `₹${Number(sr?.totalNetSales || 0).toFixed(2)}`, color: 'text-emerald-400' },
                { label: 'Platform Commission', val: `₹${Number(sr?.totalPlatformCommission || 0).toFixed(2)}`, color: 'text-amber-400' },
              ].map((c) => (
                <div key={c.label} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                  <p className="text-xs text-slate-400">{c.label}</p>
                  <p className={`text-lg font-extrabold mt-1 ${c.color}`}>{c.val}</p>
                </div>
              ))}
            </div>

            {/* Daily Breakdown Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="py-2 px-3 text-left">Date</th>
                    <th className="py-2 px-3 text-center">Orders</th>
                    <th className="py-2 px-3 text-right">Daily Sales</th>
                    <th className="py-2 px-3 text-right">Commission Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(sr?.dailySalesBreakdown || []).length === 0 ? (
                    <tr><td colSpan="4" className="py-8 text-center text-slate-500">No sales data yet.</td></tr>
                  ) : (
                    (sr?.dailySalesBreakdown || []).map((d) => (
                      <tr key={d.date} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono text-slate-300">{d.date}</td>
                        <td className="py-2.5 px-3 text-center text-indigo-400 font-bold">{d.orderCount}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-white">₹{Number(d.totalSales || 0).toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-amber-400">₹{Number(d.commissionEarned || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Revenue Report ───────────────────────────────────────────────── */}
        {activeTab === 'revenue' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Revenue Report
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Gross Revenue', val: `₹${Number(rr?.grossRevenue || 0).toFixed(2)}`, color: 'text-white', sub: 'Total gross volume from all orders' },
                { label: 'Total Discounts', val: `₹${Number(rr?.totalDiscounts || 0).toFixed(2)}`, color: 'text-rose-400', sub: 'Coupon discounts applied' },
                { label: 'Net Revenue', val: `₹${Number(rr?.netRevenue || 0).toFixed(2)}`, color: 'text-emerald-400', sub: 'Gross minus all discounts' },
                { label: 'Platform Commission', val: `₹${Number(rr?.platformCommissionEarnings || 0).toFixed(2)}`, color: 'text-amber-400', sub: 'ShopStack platform earnings' },
                { label: 'Total Vendor Payouts', val: `₹${Number(rr?.totalVendorPayouts || 0).toFixed(2)}`, color: 'text-purple-400', sub: 'Net payments to all vendors' },
              ].map((c) => (
                <div key={c.label} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
                  <p className="text-xs text-slate-400">{c.label}</p>
                  <p className={`text-2xl font-black ${c.color}`}>{c.val}</p>
                  <p className="text-[10px] text-slate-500">{c.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Order Report ─────────────────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-teal-400" /> Order Report
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Orders', val: or_?.totalOrders ?? 0, color: 'text-white' },
                { label: 'Delivered', val: or_?.completedOrders ?? 0, color: 'text-emerald-400' },
                { label: 'Cancelled', val: or_?.cancelledOrders ?? 0, color: 'text-rose-400' },
                { label: 'Avg Order Value', val: `₹${Number(or_?.averageOrderValue || 0).toFixed(2)}`, color: 'text-amber-400' },
              ].map((c) => (
                <div key={c.label} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                  <p className="text-xs text-slate-400">{c.label}</p>
                  <p className={`text-2xl font-black mt-1 ${c.color}`}>{c.val}</p>
                </div>
              ))}
            </div>
            {/* Orders by Status */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-3">Orders by Status</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {Object.entries(or_?.ordersByStatus || {}).map(([status, count]) => (
                  <div key={status} className="bg-slate-950 p-3 rounded-xl text-center">
                    <p className="text-[10px] text-slate-400">{status}</p>
                    <p className="text-lg font-black text-white mt-0.5">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Vendor Performance Report ────────────────────────────────────── */}
        {activeTab === 'vendor' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-purple-400" /> Vendor Performance Report
              </h2>
              <button
                onClick={() => exportCSV(
                  vp.map((v) => ({
                    businessName: v.businessName,
                    email: v.email,
                    active: v.active !== false ? 'Active' : 'Inactive',
                    commissionRate: v.commissionRate,
                    totalProducts: v.totalProducts,
                    totalOrdersSold: v.totalOrdersSold,
                    totalGrossSales: v.totalGrossSales,
                    totalCommissionDeducted: v.totalCommissionDeducted,
                    netVendorEarnings: v.netVendorEarnings,
                  })),
                  ['businessName', 'email', 'active', 'commissionRate', 'totalProducts', 'totalOrdersSold', 'totalGrossSales', 'totalCommissionDeducted', 'netVendorEarnings'],
                  'vendor_performance_report.csv'
                )}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl text-xs font-bold cursor-pointer hover:bg-purple-500/20 transition-all"
              >
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="py-2 px-3 text-left">Vendor</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-center">Rate%</th>
                    <th className="py-2 px-3 text-center">Products</th>
                    <th className="py-2 px-3 text-center">Orders</th>
                    <th className="py-2 px-3 text-right">Gross Sales</th>
                    <th className="py-2 px-3 text-right">Commission</th>
                    <th className="py-2 px-3 text-right">Net Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {vp.length === 0 ? (
                    <tr><td colSpan="8" className="py-8 text-center text-slate-500">No vendor data available.</td></tr>
                  ) : (
                    vp.map((v) => (
                      <tr key={v.vendorId} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-white">{v.businessName}</p>
                          <p className="text-slate-400 text-[10px]">{v.email}</p>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${v.active !== false ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'}`}>
                            {v.active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-amber-400">{v.commissionRate}%</td>
                        <td className="py-2.5 px-3 text-center text-slate-200 font-bold">{v.totalProducts}</td>
                        <td className="py-2.5 px-3 text-center text-slate-200 font-bold">{v.totalOrdersSold}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-100">₹{Number(v.totalGrossSales || 0).toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-amber-400">₹{Number(v.totalCommissionDeducted || 0).toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">₹{Number(v.netVendorEarnings || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Product Performance Report ───────────────────────────────────── */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-400" /> Product Performance Report
              </h2>
              <button
                onClick={() => exportCSV(
                  (pp?.topSellingProducts || []).map((p) => ({
                    productName: p.productName,
                    categoryName: p.categoryName,
                    vendorName: p.vendorName,
                    totalUnitsSold: p.totalUnitsSold,
                    totalRevenueGenerated: p.totalRevenueGenerated,
                  })),
                  ['productName', 'categoryName', 'vendorName', 'totalUnitsSold', 'totalRevenueGenerated'],
                  'product_performance_report.csv'
                )}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl text-xs font-bold cursor-pointer hover:bg-indigo-500/20 transition-all"
              >
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                <p className="text-xs text-slate-400">Out of Stock Products</p>
                <p className="text-2xl font-black text-rose-400 mt-1">{pp?.outOfStockProductsCount ?? 0}</p>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                <p className="text-xs text-slate-400">Low Stock (≤5)</p>
                <p className="text-2xl font-black text-amber-400 mt-1">{pp?.lowStockProductsCount ?? 0}</p>
              </div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="py-2 px-3 text-left">Rank</th>
                    <th className="py-2 px-3 text-left">Product</th>
                    <th className="py-2 px-3 text-left">Category</th>
                    <th className="py-2 px-3 text-left">Vendor</th>
                    <th className="py-2 px-3 text-center">Units Sold</th>
                    <th className="py-2 px-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(pp?.topSellingProducts || []).length === 0 ? (
                    <tr><td colSpan="6" className="py-8 text-center text-slate-500">No product sales data available.</td></tr>
                  ) : (
                    (pp?.topSellingProducts || []).map((p, idx) => (
                      <tr key={p.productId} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black ${idx === 0 ? 'bg-amber-400 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white">{p.productName}</td>
                        <td className="py-2.5 px-3 text-slate-400">{p.categoryName}</td>
                        <td className="py-2.5 px-3 text-indigo-300">{p.vendorName}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-200">{p.totalUnitsSold}</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">₹{Number(p.totalRevenueGenerated || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Commission Report ────────────────────────────────────────────── */}
        {activeTab === 'commission' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Percent className="w-4 h-4 text-amber-400" /> Commission Report
              </h2>
              <button
                onClick={() => exportCSV(
                  (cr?.vendorCommissions || []).map((v) => ({
                    businessName: v.businessName,
                    email: v.email,
                    commissionRate: v.commissionRate,
                    totalOrdersSold: v.totalOrdersSold,
                    totalGrossSales: v.totalGrossSales,
                    totalCommissionDeducted: v.totalCommissionDeducted,
                    netVendorEarnings: v.netVendorEarnings,
                  })),
                  ['businessName', 'email', 'commissionRate', 'totalOrdersSold', 'totalGrossSales', 'totalCommissionDeducted', 'netVendorEarnings'],
                  'commission_report.csv'
                )}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-bold cursor-pointer hover:bg-amber-500/20 transition-all"
              >
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Gross Volume', val: `₹${Number(cr?.totalGrossVolume ?? cr?.totalOrderVolume ?? 0).toFixed(2)}`, color: 'text-white' },
                { label: 'Total Platform Commission', val: `₹${Number(cr?.totalPlatformCommission ?? 0).toFixed(2)}`, color: 'text-amber-400' },
                { label: 'Total Vendor Payouts', val: `₹${Number(cr?.totalVendorPayout ?? cr?.totalVendorPayouts ?? 0).toFixed(2)}`, color: 'text-emerald-400' },
              ].map((c) => (
                <div key={c.label} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4">
                  <p className="text-xs text-slate-400">{c.label}</p>
                  <p className={`text-xl font-extrabold mt-1 ${c.color}`}>{c.val}</p>
                </div>
              ))}
            </div>

            {/* Per-vendor table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="py-2 px-3 text-left">Vendor</th>
                    <th className="py-2 px-3 text-center">Rate%</th>
                    <th className="py-2 px-3 text-center">Orders</th>
                    <th className="py-2 px-3 text-right">Gross Sales</th>
                    <th className="py-2 px-3 text-right">Commission Collected</th>
                    <th className="py-2 px-3 text-right">Net Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(cr?.vendorCommissions || []).length === 0 ? (
                    <tr><td colSpan="6" className="py-8 text-center text-slate-500">No commission data yet.</td></tr>
                  ) : (
                    (cr?.vendorCommissions || []).map((v) => (
                      <tr key={v.vendorId} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-white">{v.businessName}</p>
                          <p className="text-[10px] text-slate-400">{v.email}</p>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-amber-400">{v.commissionRate}%</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-200">{v.totalOrdersSold ?? v.totalItemsSold ?? 0}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-100">₹{Number(v.totalGrossSales || 0).toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-amber-400">₹{Number(v.totalCommissionDeducted ?? v.platformCommissionDeducted ?? 0).toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">₹{Number(v.netVendorEarnings || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminBusinessReportsPage;
