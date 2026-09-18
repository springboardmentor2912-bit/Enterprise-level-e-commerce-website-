import React, { useEffect, useMemo, useState } from 'react';
import {
  getAllReturnRequests,
  approveReturn,
  rejectReturn,
} from '../../services/Returnservice';

const STATUS_STYLES = {
  REQUESTED: 'bg-amber-50 text-amber-700 border-amber-200',
  APPROVED: 'bg-blue-50 text-blue-700 border-blue-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  QC_PENDING: 'bg-violet-50 text-violet-700 border-violet-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const STATUS_LABELS = {
  REQUESTED: 'Awaiting Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  QC_PENDING: 'At Warehouse — Awaiting QC',
  COMPLETED: 'Completed',
};

const TABS = [
  { key: 'REQUESTED', label: 'Awaiting Review' },
  { key: 'QC_PENDING', label: 'Awaiting QC' },
  { key: 'ALL', label: 'All Requests' },
];

const AdminReturns = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [activeTab, setActiveTab] = useState('REQUESTED');

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllReturnRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load return requests:', err);
      setError('Unable to load return requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    if (activeTab === 'ALL') return requests;
    return requests.filter((r) => r.status === activeTab);
  }, [requests, activeTab]);

  const counts = useMemo(() => {
    return {
      REQUESTED: requests.filter((r) => r.status === 'REQUESTED').length,
      QC_PENDING: requests.filter((r) => r.status === 'QC_PENDING').length,
      ALL: requests.length,
    };
  }, [requests]);

 
const handleApprove = async (id) => {

  setBusyId(id);
  setError('');

  try {

    const updated = await approveReturn(id, '');

    setRequests((prev) =>
      prev.map((r) => (r.id === id ? updated : r))
    );

  } catch (err) {

    const message =
      typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to approve this return.';

    setError(message);

  } finally {

    setBusyId(null);

  }
};


  const handleReject = async (id) => {
    const note = window.prompt('Reason for rejecting this return (optional):') || '';
    setBusyId(id);
    setError('');
    try {
      const updated = await rejectReturn(id, note);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      setError(err.response?.data || 'Failed to reject this return.');
    } finally {
      setBusyId(null);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return '\u2014';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '\u2014';
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
            Returns &amp; Quality Control
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review return requests and route approved ones to the assigned warehouse. Physical inspection (QC) is handled by that warehouse's own staff.
          </p>
        </div>

        <div className="flex gap-2 border-b border-stone-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${
                activeTab === tab.key
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label} {counts[tab.key] > 0 && `(${counts[tab.key]})`}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200/80 text-rose-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl py-16 text-center text-slate-500">
              Nothing here right now.
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs text-slate-400 font-mono">Order #{req.orderId}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[req.status] || 'bg-stone-100 text-slate-600 border-stone-200'}`}>
                        {STATUS_LABELS[req.status] || req.status}
                      </span>
                      {req.assignedWarehouseName && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-slate-600">
                          📦 {req.assignedWarehouseName}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-slate-900">{req.productName}</p>
                    <p className="text-sm text-slate-500">₹{req.lineTotal}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Requested {formatDateTime(req.requestedAt)}
                    </p>
                  </div>
                </div>

                <div className="bg-stone-50 rounded-xl p-3 text-sm text-slate-700 mb-3">
                  <span className="font-semibold text-slate-500 text-xs uppercase tracking-wide block mb-1">
                    Customer's reason
                  </span>
                  {req.reason}
                </div>

                {req.resolutionNote && (
                  <div className="text-xs text-slate-500 mb-2">
                    <span className="font-semibold">Note:</span> {req.resolutionNote}
                  </div>
                )}

                {req.qcResult && (
                  <div className="text-xs text-slate-500 mb-2">
                    <span className="font-semibold">QC result:</span>{' '}
                    <span className={req.qcResult === 'ACCEPTED' ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                      {req.qcResult === 'ACCEPTED' ? 'Accepted — restocked' : 'Damaged — quarantined'}
                    </span>
                    {req.qcNote && <span> — {req.qcNote}</span>}
                  </div>
                )}

                {req.refund && (
                  <div className="mb-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      req.refund.status === 'PROCESSED' ? 'bg-emerald-50 text-emerald-700'
                        : req.refund.status === 'FAILED' ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      Refund: {req.refund.status}
                    </span>
                  </div>
                )}

                {req.status === 'REQUESTED' && (
                  <div className="flex gap-2 pt-2 border-t border-stone-100">
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={busyId === req.id}
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white transition disabled:opacity-60 cursor-pointer"
                    >
                      {busyId === req.id ? 'Processing…' : 'Approve — Route to Warehouse'}
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={busyId === req.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium border border-rose-200 text-rose-600 hover:bg-rose-50 transition disabled:opacity-60 cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {req.status === 'QC_PENDING' && (
                  <div className="pt-2 border-t border-stone-100 text-xs text-slate-500">
                    Awaiting inspection by {req.assignedWarehouseName || 'the assigned warehouse'}'s staff.
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-64 bg-stone-200 rounded-md"></div>
        <div className="h-4 w-96 bg-stone-200 rounded-md"></div>
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-stone-200 rounded-2xl"></div>
        ))}
      </div>
    </div>
  </div>
);

export default AdminReturns;