import React, { useEffect, useState } from 'react';
import { getSystemStatus } from '../../services/adminService';

const AdminSystem = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const loadSystemStatus = async () => {
    try {
      setChecking(true);
      const response = await getSystemStatus();
      setSystemStatus(response || null);
    } catch (err) {
      console.error('Error checking system status:', err);
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  useEffect(() => {
    loadSystemStatus();
  }, []);

  if (loading) {
    return <SystemSkeleton />;
  }

  const isAllHealthy = systemStatus && [
    systemStatus.backendStatus,
    systemStatus.databaseStatus,
    systemStatus.razorpayStatus
  ].every((st) => ['UP', 'ACTIVE', 'CONNECTED'].includes(String(st || '').toUpperCase()));

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
              System Monitoring
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Monitor infrastructure health and operational availability of core services.
            </p>
          </div>

          <button
            onClick={loadSystemStatus}
            disabled={checking}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-stone-50 active:bg-stone-100 disabled:opacity-60 border border-stone-200 text-slate-700 text-sm font-semibold rounded-xl shadow-2xs transition cursor-pointer self-start sm:self-auto"
          >
            <svg
              className={`w-4 h-4 text-slate-500 ${checking ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{checking ? 'Checking Status...' : 'Refresh Status'}</span>
          </button>
        </div>

        {systemStatus ? (
          <>
            {/* OVERVIEW BANNER */}
            <div
              className={`p-4 rounded-2xl border flex items-center gap-3 transition-colors ${
                isAllHealthy
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/60 border-amber-200 text-amber-900'
              }`}
            >
              <span className="relative flex h-3 w-3 shrink-0">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isAllHealthy ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    isAllHealthy ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                ></span>
              </span>
              <div className="text-sm font-medium">
                {isAllHealthy
                  ? 'All core services and integrations are operating normally.'
                  : 'One or more services may be experiencing downtime or degradation.'}
              </div>
            </div>

            {/* SERVICES CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <ServiceCard
                title="Backend Service"
                subtitle="Primary API microservice API Gateway"
                status={systemStatus.backendStatus}
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"
                  />
                }
              />

              <ServiceCard
                title="Database"
                subtitle="Main relational data store cluster"
                status={systemStatus.databaseStatus}
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 2.21 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                  />
                }
              />

              <ServiceCard
                title="Payment Service"
                subtitle="Razorpay payment gateway API integration"
                status={systemStatus.razorpayStatus}
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                }
              />
            </div>

            {/* LAST CHECKED FOOTER CARD */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <strong className="text-slate-700 font-semibold">Last Checked: </strong>
                  {systemStatus.activeTimestamp
                    ? new Date(systemStatus.activeTimestamp).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })
                    : 'N/A'}
                </span>
              </div>
              <span className="text-slate-400 text-2xs uppercase tracking-wider font-semibold">
                Auto Health-Check Active
              </span>
            </div>
          </>
        ) : (
          /* EMPTY / UNAVAILABLE STATE */
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center shadow-2xs">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              System status information is unavailable
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Unable to reach the health-check service. Please verify your connection or try refreshing again.
            </p>
            <button
              onClick={loadSystemStatus}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Retry Check
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

/* SERVICE CARD COMPONENT */
const ServiceCard = ({ title, subtitle, status, icon }) => {
  const value = String(status || 'UNKNOWN').toUpperCase();
  const healthy = ['UP', 'ACTIVE', 'CONNECTED'].includes(value);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <div className="p-2.5 bg-stone-50 border border-stone-100 rounded-xl text-slate-600 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {icon}
          </svg>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between border-t border-stone-100">
        <span className="text-xs text-slate-500 font-medium">Status</span>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            healthy
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              healthy ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          ></span>
          {value.replace(/_/g, ' ')}
        </span>
      </div>
    </div>
  );
};

/* SKELETON LOADING COMPONENT */
const SystemSkeleton = () => (
  <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-52 bg-stone-200 rounded-md"></div>
          <div className="h-4 w-72 bg-stone-200 rounded-md"></div>
        </div>
        <div className="h-9 w-32 bg-stone-200 rounded-xl"></div>
      </div>

      {/* Banner Skeleton */}
      <div className="h-12 bg-stone-200/60 rounded-2xl w-full"></div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-36 bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-stone-200 rounded-md"></div>
                <div className="h-3 w-40 bg-stone-200 rounded-md"></div>
              </div>
              <div className="h-10 w-10 bg-stone-100 rounded-xl"></div>
            </div>
            <div className="h-6 w-full bg-stone-100 rounded-md pt-2"></div>
          </div>
        ))}
      </div>

      {/* Footer Skeleton */}
      <div className="h-12 bg-white border border-stone-200 rounded-2xl"></div>

    </div>
  </div>
);

export default AdminSystem;