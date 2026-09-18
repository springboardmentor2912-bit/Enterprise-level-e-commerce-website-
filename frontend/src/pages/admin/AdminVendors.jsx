import React, { useEffect, useMemo, useState } from 'react';
import { getAdminVendors, approveVendor, rejectVendor } from '../../services/adminService';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadVendors = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getAdminVendors();

      setVendors(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Vendor loading error:', err);
      setError('Unable to load vendor information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleApprove = async (vendorId) => {
    setBusyId(vendorId);
    try {
      await approveVendor(vendorId);
      await loadVendors();
    } catch (err) {
      alert(err.response?.data || 'Failed to approve this vendor.');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (vendorId) => {
    if (!window.confirm('Reject this vendor? They will not be able to list products.')) return;
    setBusyId(vendorId);
    try {
      await rejectVendor(vendorId);
      await loadVendors();
    } catch (err) {
      alert(err.response?.data || 'Failed to reject this vendor.');
    } finally {
      setBusyId(null);
    }
  };

  const filteredVendors = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return vendors;

    return vendors.filter(
      (vendor) =>
        String(vendor?.id || '').toLowerCase().includes(value) ||
        String(vendor?.name || '').toLowerCase().includes(value) ||
        String(vendor?.email || '').toLowerCase().includes(value) ||
        String(vendor?.phone || '').toLowerCase().includes(value) ||
        String(vendor?.status || '').toLowerCase().includes(value)
    );
  }, [vendors, search]);

  if (loading) {
    return <VendorsSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 flex items-center justify-center p-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-8 max-w-md w-full text-center shadow-xs">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Failed to Load Vendors</h3>
          <p className="text-xs text-slate-500 mb-6">{error}</p>
          <button
            onClick={loadVendors}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
              Vendor Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View, search, and monitor active marketplace vendor accounts.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50/80 border border-blue-100 text-blue-700 rounded-full text-xs font-semibold self-start sm:self-auto">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0v-4a2 2 0 012-2h2a2 2 0 012 2v4" />
            </svg>
            <span>{vendors.length} Total Vendors</span>
          </div>
        </div>

        {/* MAIN CARD CONTAINER */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
          
          {/* SEARCH BAR BAR */}
          <div className="p-4 sm:p-5 border-b border-stone-100 bg-stone-50/30">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, email, phone or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2 bg-white border border-stone-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* TABLE WRAPPER */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">ID</th>
                  <th className="py-3.5 px-5">Vendor Profile</th>
                  <th className="py-3.5 px-5">Contact Email</th>
                  <th className="py-3.5 px-5">Phone</th>
                  <th className="py-3.5 px-5 text-center">Products</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100 text-sm">
                {filteredVendors.length > 0 ? (
                  filteredVendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="hover:bg-stone-50/50 transition-colors"
                    >
                      <td className="py-4 px-5 text-xs font-mono font-medium text-slate-500">
                        #{vendor.id}
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <Avatar name={vendor.name} />
                          <div>
                            <span className="font-semibold text-slate-900 block leading-tight">
                              {vendor.name || 'N/A'}
                            </span>
                            <span className="text-2xs text-slate-400 font-mono sm:hidden">
                              ID: #{vendor.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-slate-600">
                        {vendor.email ? (
                          <a
                            href={`mailto:${vendor.email}`}
                            className="hover:text-slate-900 hover:underline transition"
                          >
                            {vendor.email}
                          </a>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-slate-600">
                        {vendor.phone || <span className="text-slate-400">N/A</span>}
                      </td>

                      <td className="py-4 px-5 text-center font-medium text-slate-700">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md bg-stone-100 text-xs font-semibold text-slate-700">
                          {vendor.productCount ?? vendor.products?.length ?? 0}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <StatusBadge status={vendor.status || 'ACTIVE'} />
                      </td>

                      <td className="py-4 px-5 text-right">
                        {String(vendor.status).toUpperCase() === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleApprove(vendor.id)}
                              disabled={busyId === vendor.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition disabled:opacity-50 cursor-pointer"
                            >
                              {busyId === vendor.id ? '...' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(vendor.id)}
                              disabled={busyId === vendor.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50 transition disabled:opacity-50 cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400 italic">No action</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 px-4 text-center">
                      <div className="max-w-xs mx-auto space-y-2">
                        <div className="w-10 h-10 bg-stone-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">No vendors found</p>
                        <p className="text-xs text-slate-500">
                          {search
                            ? `No records matching "${search}". Try checking for typos.`
                            : 'There are currently no vendor accounts available.'}
                        </p>
                        {search && (
                          <button
                            onClick={() => setSearch('')}
                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer pt-1 inline-block"
                          >
                            Clear Search Filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          <div className="p-4 border-t border-stone-100 bg-stone-50/30 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Showing <strong className="text-slate-700">{filteredVendors.length}</strong> of{' '}
              <strong className="text-slate-700">{vendors.length}</strong> vendors
            </span>
            <span className="text-slate-400 text-2xs uppercase tracking-wider font-semibold">
              Live Database
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};

/* AVATAR INITIALS COMPONENT */
const Avatar = ({ name }) => {
  const initial = (name || 'V').charAt(0).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
      {initial}
    </div>
  );
};

/* STATUS BADGE COMPONENT */
const StatusBadge = ({ status }) => {
  const value = String(status || 'UNKNOWN').toUpperCase();

  const isHealthy = ['ACTIVE', 'CONNECTED', 'UP', 'APPROVED'].includes(value);
  const isInactive = ['INACTIVE', 'DISCONNECTED', 'DOWN', 'REJECTED'].includes(value);
  const isPending = value === 'PENDING';

  let badgeStyle = 'bg-stone-100 text-slate-700 border-stone-200';
  if (isHealthy) {
    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  } else if (isInactive) {
    badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200/80';
  } else if (isPending) {
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200/80';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-semibold border ${badgeStyle}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isHealthy
            ? 'bg-emerald-500'
            : isInactive
            ? 'bg-rose-500'
            : isPending
            ? 'bg-amber-500'
            : 'bg-slate-400'
        }`}
      />
      {value.replace(/_/g, ' ')}
    </span>
  );
};

/* SKELETON LOADING COMPONENT */
const VendorsSkeleton = () => (
  <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-52 bg-stone-200 rounded-md"></div>
          <div className="h-4 w-72 bg-stone-200 rounded-md"></div>
        </div>
        <div className="h-7 w-28 bg-stone-200 rounded-full"></div>
      </div>

      {/* Main Card Skeleton */}
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden space-y-4 p-5">
        <div className="h-10 max-w-md bg-stone-100 rounded-xl"></div>
        
        <div className="space-y-3 pt-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-stone-50 rounded-xl w-full"></div>
          ))}
        </div>
      </div>

    </div>
  </div>
);

export default AdminVendors;