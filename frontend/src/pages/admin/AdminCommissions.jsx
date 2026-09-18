import React, { useEffect, useMemo, useState } from 'react';
import {
  getAdminCommissions,
  getAdminCommissionDetails,
} from '../../services/adminService';

const STATUS_STYLES = {
  CONFIRMED: 'bg-amber-50 text-amber-700 border-amber-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const AdminCommissions = () => {
  const [summary, setSummary] = useState([]);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = async () => {
    try {
      setLoading(true);
      setError('');
      const [summaryRes, detailsRes] = await Promise.all([
        getAdminCommissions(),
        getAdminCommissionDetails(),
      ]);
      setSummary(Array.isArray(summaryRes) ? summaryRes : []);
      setDetails(Array.isArray(detailsRes) ? detailsRes : []);
    } catch (err) {
      console.error('Failed to fetch admin commissions:', err);
      setError('Unable to load commission information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const totalCommission = useMemo(() => {
    return summary.reduce(
      (total, item) => total + Number(item?.totalCommissionEarned || 0),
      0
    );
  }, [summary]);

  const totalVendorPayout = useMemo(() => {
    return details.reduce((total, item) => {
      if (item?.status === 'CANCELLED') return total;
      return total + Number(item?.vendorAmount || 0);
    }, 0);
  }, [details]);

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
              Commission Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Monitor vendor sales performance and earned marketplace commissions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-3 bg-emerald-50 border border-emerald-200/80 px-4 py-3 rounded-xl shadow-2xs">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <span className="text-2xs font-medium text-emerald-800 uppercase tracking-wider block">
                  Total Commission Earned
                </span>
                <span className="text-lg font-bold text-emerald-900">
                  {formatCurrency(totalCommission)}
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-3 bg-stone-100 border border-stone-200 px-4 py-3 rounded-xl shadow-2xs">
              <div className="p-2 bg-stone-200 rounded-lg text-slate-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a4 4 0 00-8 0v2M5 9h14l-1 12H6L5 9z" />
                </svg>
              </div>
              <div>
                <span className="text-2xs font-medium text-slate-600 uppercase tracking-wider block">
                  Owed to Vendors
                </span>
                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(totalVendorPayout)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200/80 text-rose-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* PER-VENDOR SUMMARY */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200">
            <h2 className="text-sm font-semibold text-slate-900">Vendor Summary &amp; Commission</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              A fixed 10% commission is applied to each vendor's applicable sale amount.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-2xs font-semibold uppercase tracking-wider text-slate-500">
                  <th scope="col" className="px-6 py-4">Vendor ID</th>
                  <th scope="col" className="px-6 py-4">Vendor</th>
                  <th scope="col" className="px-6 py-4">Total Sales</th>
                  <th scope="col" className="px-6 py-4">Commission Rate</th>
                  <th scope="col" className="px-6 py-4 text-right">Commission Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm text-slate-700">
                {summary.length > 0 ? (
                  summary.map((commission) => (
                    <tr key={commission.vendorId} className="hover:bg-stone-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        #{commission.vendorId}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {commission.vendorName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {formatCurrency(commission.totalVendorSales)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-stone-100 text-slate-700 border border-stone-200">
                          {Number(commission.commissionPercentage || 0).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-700 text-right">
                        {formatCurrency(commission.totalCommissionEarned)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                      No vendor sales recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PER-ORDER COMMISSION RECORDS */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200">
            <h2 className="text-sm font-semibold text-slate-900">Commission Records by Order</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every stored commission record — one row per vendor per order.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-2xs font-semibold uppercase tracking-wider text-slate-500">
                  <th scope="col" className="px-6 py-4">Order ID</th>
                  <th scope="col" className="px-6 py-4">Vendor</th>
                  <th scope="col" className="px-6 py-4">Sale Amount</th>
                  <th scope="col" className="px-6 py-4">Rate</th>
                  <th scope="col" className="px-6 py-4">Commission</th>
                  <th scope="col" className="px-6 py-4">Vendor Amount</th>
                  <th scope="col" className="px-6 py-4">Date</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm text-slate-700">
                {details.length > 0 ? (
                  details.map((record) => (
                    <tr key={record.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        #{record.orderId}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {record.vendorName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatCurrency(record.saleAmount)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {Number(record.commissionRate || 0).toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-700">
                        {formatCurrency(record.commissionAmount)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {formatCurrency(record.vendorAmount)}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {formatDate(record.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            STATUS_STYLES[record.status] || 'bg-stone-100 text-slate-700 border-stone-200'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                        </svg>
                        <span>No commission records available yet.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

/* LOADING SKELETON COMPONENT */
const LoadingSkeleton = () => (
  <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-stone-200 rounded-md"></div>
          <div className="h-4 w-80 bg-stone-200 rounded-md"></div>
        </div>
        <div className="h-16 w-48 bg-stone-200 rounded-xl"></div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
        <div className="h-8 bg-stone-100 rounded-md w-full"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-stone-50 rounded-md w-full"></div>
        ))}
      </div>
    </div>
  </div>
);

export default AdminCommissions;