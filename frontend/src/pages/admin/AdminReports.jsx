import React, { useEffect, useState } from 'react';
import {
  getDashboardSummary,
  getAdminVendors,
  getAdminOrders,
  getAdminCommissions,
  getSystemStatus
} from '../../services/adminService';

const AdminReports = () => {
  const [data, setData] = useState({
    summary: null,
    vendors: [],
    orders: [],
    commissions: [],
    systemStatus: null
  });

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [
        summary,
        vendors,
        orders,
        commissions,
        systemStatus
      ] = await Promise.all([
        getDashboardSummary(),
        getAdminVendors(),
        getAdminOrders(),
        getAdminCommissions(),
        getSystemStatus()
      ]);

      setData({
        summary: summary || null,
        vendors: Array.isArray(vendors) ? vendors : [],
        orders: Array.isArray(orders) ? orders : [],
        commissions: Array.isArray(commissions) ? commissions : [],
        systemStatus: systemStatus || null
      });
    } catch (err) {
      console.error('Report loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const totalCommission = data.commissions.reduce(
    (total, item) => total + Number(item?.totalCommissionEarned || 0),
    0
  );

  const exportReport = () => {
    setExporting(true);

    const report = {
      reportTitle: 'ShopStack Marketplace Business Report',
      generatedAt: new Date().toISOString(),
      summary: data.summary,
      vendors: data.vendors,
      orders: data.orders,
      commissions: data.commissions,
      systemStatus: data.systemStatus
    };

    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `shopstack_business_report_${
      new Date().toISOString().slice(0, 10)
    }.json`;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    setExporting(false);
  };

  if (loading) {
    return <ReportsSkeleton />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
              Business Reports
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review marketplace performance metrics and download complete raw reports.
            </p>
          </div>

          <button
            onClick={exportReport}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            {exporting ? (
              <>
                <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download JSON Report</span>
              </>
            )}
          </button>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Total Sales"
            value={formatCurrency(data.summary?.totalSales)}
            icon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            }
          />
          <MetricCard
            title="Total Orders"
            value={Number(data.summary?.totalOrders || 0).toLocaleString('en-IN')}
            icon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            }
          />
          <MetricCard
            title="Active Vendors"
            value={Number(data.summary?.totalVendors || 0).toLocaleString('en-IN')}
            icon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0v-4a2 2 0 012-2h2a2 2 0 012 2v4" />
            }
          />
          <MetricCard
            title="Total Products"
            value={Number(data.summary?.totalProducts || 0).toLocaleString('en-IN')}
            icon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            }
          />
          <MetricCard
            title="Platform Commission"
            value={formatCurrency(totalCommission)}
            icon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
            }
          />
        </div>

        {/* REPORT BREAKDOWN DETAILS */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-4 font-serif">
            Dataset Summary
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InfoBlock
              label="Vendors Included"
              value={`${data.vendors.length} Records`}
            />
            <InfoBlock
              label="Orders Included"
              value={`${data.orders.length} Records`}
            />
            <InfoBlock
              label="Commission Logs"
              value={`${data.commissions.length} Entries`}
            />
            <InfoBlock
              label="Export Format"
              value="Structured JSON"
            />
          </div>
        </div>

        {/* NOTICE/FOOTER */}
        <div className="flex items-start gap-3 p-4 bg-blue-50/60 border border-blue-100 rounded-xl text-blue-900 text-sm">
          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span className="font-semibold block mb-0.5">Automated Report Generation</span>
            <p className="text-blue-800 text-xs sm:text-sm">
              Downloading this report compiles raw database state containing marketplace high-level summaries, vendor profile details, transaction orders, full commission breakdowns, and underlying microservice health status.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

/* METRIC CARD COMPONENT */
const MetricCard = ({ title, value, icon }) => (
  <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
    <div className="flex items-center justify-between gap-2 mb-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </span>
      <div className="p-2 bg-stone-100/80 rounded-xl text-slate-600 shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icon}
        </svg>
      </div>
    </div>
    <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
      {value}
    </div>
  </div>
);

/* INFO BLOCK COMPONENT */
const InfoBlock = ({ label, value }) => (
  <div className="flex items-center justify-between p-3.5 bg-stone-50/70 border border-stone-100 rounded-xl">
    <span className="text-xs font-medium text-slate-500">{label}</span>
    <span className="text-xs font-bold text-slate-900">{value}</span>
  </div>
);

/* SKELETON LOADING COMPONENT */
const ReportsSkeleton = () => (
  <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-stone-200 rounded-md"></div>
          <div className="h-4 w-72 bg-stone-200 rounded-md"></div>
        </div>
        <div className="h-10 w-40 bg-stone-200 rounded-xl"></div>
      </div>

      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 bg-white border border-stone-200 rounded-2xl p-5 space-y-3">
            <div className="h-4 w-20 bg-stone-200 rounded-md"></div>
            <div className="h-7 w-28 bg-stone-200 rounded-md"></div>
          </div>
        ))}
      </div>

      {/* Dataset Summary Skeleton */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
        <div className="h-5 w-36 bg-stone-200 rounded-md"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-stone-50 rounded-xl"></div>
          ))}
        </div>
      </div>

    </div>
  </div>
);

export default AdminReports;