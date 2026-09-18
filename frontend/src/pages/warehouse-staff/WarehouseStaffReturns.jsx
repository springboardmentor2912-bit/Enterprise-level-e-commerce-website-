import React, { useEffect, useState } from 'react';
import { getMyProfile, getMyReturnsForQC, performQualityCheck } from '../../services/warehouseStaffService';

const WarehouseStaffReturns = () => {
  const [warehouseName, setWarehouseName] = useState('');
  const [notAssigned, setNotAssigned] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError('');
      const profile = await getMyProfile();
      if (typeof profile === 'string' || !profile?.warehouseId) {
        setNotAssigned(true);
        return;
      }
      setWarehouseName(profile.warehouseName || '');
      const data = await getMyReturnsForQC();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load returns for QC:', err);
      setError('Unable to load your warehouse\u2019s return QC inbox.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleQc = async (id, result) => {
    const label = result === 'ACCEPTED' ? 'accept and restock' : 'mark as damaged/quarantined';
    if (!window.confirm(`Confirm: ${label} this item? The customer will be refunded either way.`)) return;
    const note = window.prompt('QC note (optional):') || '';
    setBusyId(id);
    setError('');
    try {
      await performQualityCheck(id, result, note);
      // Once QC is recorded the request leaves the pending-QC inbox.
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.response?.data || 'Failed to record QC result.');
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

  if (notAssigned) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center text-slate-500">
            <p className="font-semibold text-slate-900 mb-1">No warehouse assigned yet</p>
            <p className="text-sm">Ask an administrator to assign your account to a warehouse first.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
            Returns &amp; Quality Control {warehouseName && `— ${warehouseName}`}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Items routed back to your warehouse after admin approval. Inspect each one, then accept & restock, or quarantine it as damaged.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200/80 text-rose-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl py-16 text-center text-slate-500">
              Nothing awaiting QC right now.
            </div>
          ) : (
            requests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs text-slate-400 font-mono">Order #{req.orderId}</span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-violet-50 text-violet-700 border-violet-200">
                        Awaiting QC
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900">{req.productName}</p>
                    <p className="text-sm text-slate-500">\u20b9{req.lineTotal}</p>
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
                    <span className="font-semibold">Admin note:</span> {req.resolutionNote}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => handleQc(req.id, 'ACCEPTED')}
                    disabled={busyId === req.id}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition disabled:opacity-60 cursor-pointer"
                  >
                    {busyId === req.id ? 'Processing\u2026' : 'Accept — Restock'}
                  </button>
                  <button
                    onClick={() => handleQc(req.id, 'DAMAGED')}
                    disabled={busyId === req.id}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-rose-200 text-rose-600 hover:bg-rose-50 transition disabled:opacity-60 cursor-pointer"
                  >
                    Damaged — Quarantine
                  </button>
                </div>
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
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-stone-200 rounded-2xl"></div>
        ))}
      </div>
    </div>
  </div>
);

export default WarehouseStaffReturns;
