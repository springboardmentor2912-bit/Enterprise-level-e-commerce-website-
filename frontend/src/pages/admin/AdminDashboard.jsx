import React, { useEffect, useState } from 'react';
import {
  getDashboardSummary,
  getAdminCommissions
} from '../../services/adminService';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [commissions, setCommissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboard = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const [summaryResponse, commissionResponse] = await Promise.all([
        getDashboardSummary(),
        getAdminCommissions()
      ]);

      setSummary(summaryResponse || null);

      setCommissions(
        Array.isArray(commissionResponse) ? commissionResponse : []
      );
    } catch (err) {
      console.error('Dashboard error:', err);

      if (err?.response?.status === 401) {
        setError('Your session has expired. Please login again.');
      } else if (err?.response?.status === 403) {
        setError('Administrator access is required.');
      } else {
        setError('Unable to load dashboard information.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString('en-IN');
  };

  const totalCommission = commissions.reduce(
    (total, commission) =>
      total + Number(commission?.totalCommissionEarned || 0),
    0
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 flex items-center justify-center p-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-serif mb-2">Dashboard Error</h2>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <button
            onClick={() => fetchDashboard()}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition cursor-pointer shadow-xs"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Overview of your marketplace activities and metrics
            </p>
          </div>

          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-slate-700 font-semibold text-sm rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 text-slate-500 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard
            title="Marketplace Sales"
            value={formatCurrency(summary?.totalSales)}
            description="Total Gross Volume"
            icon={
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconBg="bg-emerald-50 border-emerald-100"
          />

          <StatCard
            title="Total Orders"
            value={formatNumber(summary?.totalOrders)}
            description="Orders Placed Across Stores"
            icon={
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
            iconBg="bg-indigo-50 border-indigo-100"
          />

          <StatCard
            title="Vendors"
            value={formatNumber(summary?.totalVendors)}
            description="Active Registered Vendors"
            icon={
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            iconBg="bg-sky-50 border-sky-100"
          />

          <StatCard
            title="Products"
            value={formatNumber(summary?.totalProducts)}
            description="Active Listed Products"
            icon={
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            iconBg="bg-amber-50 border-amber-100"
          />

          <StatCard
            title="Low Stock"
            value={formatNumber(summary?.lowStockProductsCount)}
            description="Products Requiring Attention"
            icon={
              <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            iconBg="bg-rose-50 border-rose-100"
            isAlert={Number(summary?.lowStockProductsCount) > 0}
          />

          <StatCard
            title="Commission"
            value={formatCurrency(totalCommission)}
            description="Total Platform Earnings"
            icon={
              <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            }
            iconBg="bg-emerald-50 border-emerald-200"
          />
        </div>

        {/* MARKETPLACE SUMMARY CARD */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 font-serif mb-5">
            Marketplace Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryItem
              label="Total Sales"
              value={formatCurrency(summary?.totalSales)}
            />
            <SummaryItem
              label="Total Orders"
              value={formatNumber(summary?.totalOrders)}
            />
            <SummaryItem
              label="Total Vendors"
              value={formatNumber(summary?.totalVendors)}
            />
            <SummaryItem
              label="Total Products"
              value={formatNumber(summary?.totalProducts)}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

/* STAT CARD COMPONENT */
const StatCard = ({ title, value, description, icon, iconBg, isAlert }) => {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <div className={`p-2.5 rounded-xl border ${iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3">
        <h3 className={`text-2xl font-extrabold tracking-tight ${isAlert ? 'text-rose-600' : 'text-slate-900'}`}>
          {value}
        </h3>
        <p className="text-xs text-slate-400 mt-1 font-medium">{description}</p>
      </div>
    </div>
  );
};

/* SUMMARY ITEM COMPONENT */
const SummaryItem = ({ label, value }) => {
  return (
    <div className="bg-stone-50/70 border border-stone-200/80 rounded-xl p-4">
      <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
        {label}
      </span>
      <span className="text-xl font-bold text-slate-900">
        {value}
      </span>
    </div>
  );
};

/* LOADING SKELETON COMPONENT */
const LoadingSkeleton = () => (
  <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-stone-200 rounded-md"></div>
          <div className="h-4 w-72 bg-stone-200 rounded-md"></div>
        </div>
        <div className="h-10 w-28 bg-stone-200 rounded-xl"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-28 bg-stone-200 rounded"></div>
              <div className="h-10 w-10 bg-stone-100 rounded-xl"></div>
            </div>
            <div className="h-8 w-36 bg-stone-200 rounded"></div>
            <div className="h-3 w-32 bg-stone-100 rounded"></div>
          </div>
        ))}
      </div>

      {/* Summary Skeleton */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
        <div className="h-5 w-44 bg-stone-200 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-stone-100 rounded-xl"></div>
          ))}
        </div>
      </div>

    </div>
  </div>
);

export default AdminDashboard;