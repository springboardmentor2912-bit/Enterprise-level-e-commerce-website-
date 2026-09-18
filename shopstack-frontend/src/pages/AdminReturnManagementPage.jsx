import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import {
  RotateCcw, RefreshCw, AlertTriangle, X, CheckCircle, XCircle,
  Package, Search, Filter, User, Store, Warehouse, Banknote,
  ChevronDown, Loader2, Eye, ArrowRight, ShieldCheck, Clock
} from 'lucide-react';
import { getErrorMessage } from '../api/errorUtils';

const RETURN_STATUSES = [
  'ALL',
  'RETURN_REQUESTED',
  'RETURN_APPROVED',
  'RETURN_REJECTED',
  'RETURN_RECEIVED',
  'RETURN_ACCEPTED',
  'REFUND_INITIATED',
  'REFUNDED',
  'REFUND_FAILED',
];

const STATUS_CONFIG = {
  RETURN_REQUESTED: { label: 'Requested',      color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30' },
  RETURN_APPROVED:  { label: 'Approved',        color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/30' },
  RETURN_REJECTED:  { label: 'Rejected',        color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/30' },
  PRODUCT_RETURNED: { label: 'Product Returned',color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/30' },
  RETURN_RECEIVED:  { label: 'Received',        color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/30' },
  RETURN_ACCEPTED:  { label: 'Accepted',        color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border-cyan-500/30' },
  REFUND_INITIATED: { label: 'Refund Initiated',color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/30' },
  REFUNDED:         { label: 'Refunded ✓',      color: 'text-teal-400',    bg: 'bg-teal-500/10 border-teal-500/30' },
  REFUND_FAILED:    { label: 'Refund Failed',   color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/30' },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'text-slate-400', bg: 'bg-slate-700/50 border-slate-600' };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.color}`}>
      <RotateCcw className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
};

// ─── Action panels ──────────────────────────────────────────────────────────────

const ReviewPanel = ({ returnId, onDone, onError }) => {
  const [action, setAction] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!action) return;
    setLoading(true);
    try {
      await axiosClient.put(`/returns/admin/${returnId}/review`, { action, adminNotes: notes });
      onDone(`Return request ${action.toLowerCase()}d successfully.`);
    } catch (err) {
      onError(getErrorMessage(err, 'Action failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
      <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Review Return Request</p>
      <div className="flex gap-2">
        <button
          onClick={() => setAction('APPROVE')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
            action === 'APPROVE'
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" /> Approve
        </button>
        <button
          onClick={() => setAction('REJECT')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
            action === 'REJECT'
              ? 'bg-rose-600 border-rose-500 text-white'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" /> Reject
        </button>
      </div>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Admin notes (optional)..."
        rows={2}
        className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 resize-none"
      />
      <button
        onClick={handleSubmit}
        disabled={!action || loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
        {loading ? 'Processing...' : `Confirm ${action || 'Action'}`}
      </button>
    </div>
  );
};

const RefundPanel = ({ returnItem, onDone, onError }) => {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleRefund = async () => {
    setLoading(true);
    try {
      await axiosClient.post(`/returns/admin/${returnItem.id}/refund`);
      onDone('Refund processed successfully via Razorpay.');
    } catch (err) {
      onError(getErrorMessage(err, 'Refund failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
      <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Initiate Razorpay Refund</p>
      <div className="flex items-center justify-between p-3 bg-teal-500/5 border border-teal-500/20 rounded-xl">
        <div>
          <p className="text-xs text-slate-400">Refund Amount</p>
          <p className="text-xl font-black text-teal-400">₹{Number(returnItem.refundAmount || 0).toFixed(2)}</p>
        </div>
        <Banknote className="w-8 h-8 text-teal-500/40" />
      </div>
      <div className="text-[10px] text-slate-400 space-y-1">
        <p>• Refund will be processed via Razorpay to the original payment method</p>
        <p>• Test mode: instant. Production: 5-7 business days</p>
        <p>• This action cannot be undone</p>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={e => setConfirmed(e.target.checked)}
          className="w-4 h-4 rounded accent-teal-500"
        />
        <span className="text-xs text-slate-300">I confirm initiating this refund</span>
      </label>
      <button
        onClick={handleRefund}
        disabled={!confirmed || loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Banknote className="w-3.5 h-3.5" />}
        {loading ? 'Processing Refund...' : 'Process Refund via Razorpay'}
      </button>
    </div>
  );
};

// ─── Detail Modal ────────────────────────────────────────────────────────────────
const ReturnDetailModal = ({ returnItem, warehouses, onClose, onRefresh }) => {
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDone = (msg) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    onRefresh();
  };
  const handleError = (msg) => {
    setErrorMsg(msg);
    setSuccessMsg('');
  };

  const rs = returnItem.returnStatus;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-white">Return #{returnItem.id}</h2>
              <StatusBadge status={rs} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Order #{returnItem.orderId}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notifications */}
        {successMsg && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <p className="text-xs text-emerald-300 font-semibold">{successMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-rose-300">{errorMsg}</p>
          </div>
        )}

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</p>
            </div>
            <p className="text-sm font-bold text-white">{returnItem.customerName}</p>
            <p className="text-xs text-slate-400">{returnItem.customerEmail}</p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-3.5 h-3.5 text-purple-400" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product</p>
            </div>
            <p className="text-sm font-bold text-white line-clamp-1">{returnItem.productName}</p>
            <p className="text-xs text-slate-400">Vendor: {returnItem.vendorName || '—'}</p>
          </div>
        </div>

        {/* Return Details */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Return Details</p>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-slate-500">Ordered Qty</p>
              <p className="font-bold text-white">{returnItem.orderedQuantity}</p>
            </div>
            <div>
              <p className="text-slate-500">Return Qty</p>
              <p className="font-bold text-orange-400">{returnItem.returnQuantity}</p>
            </div>
            <div>
              <p className="text-slate-500">Price/Unit</p>
              <p className="font-bold text-white">₹{Number(returnItem.priceAtPurchase || 0).toFixed(2)}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500">Return Reason</p>
            <p className="text-sm text-slate-200 mt-0.5">{returnItem.reason}</p>
          </div>
          {returnItem.adminNotes && (
            <div>
              <p className="text-xs text-slate-500">Admin Notes</p>
              <p className="text-sm text-amber-300 mt-0.5">{returnItem.adminNotes}</p>
            </div>
          )}
        </div>

        {/* Refund Info */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <p className="text-slate-500">Refund Amount</p>
            <p className="font-black text-teal-400 text-base">₹{Number(returnItem.refundAmount || 0).toFixed(2)}</p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <p className="text-slate-500">Razorpay Refund ID</p>
            <p className="font-mono text-slate-300 text-[10px] break-all">{returnItem.razorpayRefundId || '—'}</p>
          </div>
        </div>

        {returnItem.refundFailureReason && (
          <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-rose-400">Refund Failure Reason</p>
              <p className="text-xs text-rose-300 mt-0.5">{returnItem.refundFailureReason}</p>
            </div>
          </div>
        )}

        {/* QC Audit Summary (if completed) */}
        {(returnItem.qcResult || returnItem.isUsable !== null || returnItem.damageType) && (
          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Warehouse QC Audit Summary
              </span>
              <span className={`px-2.5 py-0.5 rounded-md font-extrabold text-[10px] ${
                returnItem.qcResult === 'PASSED' || returnItem.isUsable === true ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                returnItem.qcResult === 'DAMAGED' || returnItem.isUsable === false ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                QC RESULT: {returnItem.qcResult || (returnItem.isUsable ? 'PASSED' : 'DAMAGED')}
              </span>
            </div>

            {returnItem.qcResult === 'DAMAGED' && (
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-950 rounded-lg text-[11px]">
                <div>
                  <span className="text-slate-500 block">Damage Type</span>
                  <span className="font-bold text-amber-400">{returnItem.damageType || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Damage Responsibility</span>
                  <span className={`font-bold ${returnItem.damageResponsibility === 'CUSTOMER' ? 'text-rose-400' : 'text-cyan-400'}`}>
                    {returnItem.damageResponsibility || 'UNKNOWN'}
                  </span>
                </div>
              </div>
            )}

            {returnItem.damageDescription && (
              <p className="text-slate-300 italic text-[11px]">
                QC Remarks: "{returnItem.damageDescription}"
              </p>
            )}

            <div className="text-[10px] text-slate-500 flex justify-between border-t border-slate-800 pt-2">
              <span>QC Inspector: <strong className="text-slate-400">{returnItem.qcStaffName || returnItem.qcStaffEmail || 'Warehouse Staff'}</strong></span>
              <span>Date: {returnItem.qcDate ? new Date(returnItem.qcDate).toLocaleString('en-IN') : 'N/A'}</span>
            </div>
          </div>
        )}

        {/* Action Panels — shown based on current status */}
        {rs === 'RETURN_REQUESTED' && (
          <ReviewPanel returnId={returnItem.id} onDone={handleDone} onError={handleError} />
        )}

        {rs === 'RETURN_APPROVED' && (
          <div className="flex items-start gap-3 p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs">
            <Warehouse className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-300">Return Routed to Warehouse Intake</p>
              <p className="text-blue-200/80 text-[11px] mt-0.5">
                Assigned Warehouse: <strong className="text-white">{returnItem.assignedWarehouseName || 'Order Warehouse'}</strong>.
                Awaiting physical product arrival & Quality Control (QC) inspection by assigned Warehouse Staff. Admin does not perform QC.
              </p>
            </div>
          </div>
        )}

        {rs === 'RETURN_ACCEPTED' && (
          <RefundPanel returnItem={returnItem} onDone={handleDone} onError={handleError} />
        )}

        {rs === 'REFUND_FAILED' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300">Refund failed. You can retry the refund below.</span>
            </div>
            <RefundPanel returnItem={returnItem} onDone={handleDone} onError={handleError} />
          </div>
        )}

        {(rs === 'REFUNDED' || rs === 'RETURN_REJECTED') && (
          <div className={`flex items-center gap-2 p-3 rounded-xl text-xs ${
            rs === 'REFUNDED'
              ? 'bg-teal-500/10 border border-teal-500/30 text-teal-400'
              : 'bg-slate-800/60 border border-slate-700 text-slate-400'
          }`}>
            {rs === 'REFUNDED' ? <ShieldCheck className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span className="font-semibold">
              {rs === 'REFUNDED' ? 'This return has been fully processed and refunded.' : 'This return request has been rejected. No further action needed.'}
            </span>
          </div>
        )}

        <div className="text-[10px] text-slate-600 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Submitted {new Date(returnItem.createdAt).toLocaleString('en-IN')}
          {returnItem.updatedAt !== returnItem.createdAt && ` · Updated ${new Date(returnItem.updatedAt).toLocaleString('en-IN')}`}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminReturnManagementPage = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [warehouses, setWarehouses] = useState([]);

  const fetchReturns = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axiosClient.get('/returns/admin/all');
      setReturns(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load return requests.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await axiosClient.get('/admin/warehouses');
      setWarehouses(res.data.filter(w => w.status === 'ACTIVE'));
    } catch {
      // non-critical
    }
  };

  useEffect(() => {
    fetchReturns();
    fetchWarehouses();
  }, []);

  const handleModalRefresh = async () => {
    await fetchReturns();
    // Refresh the selected return with latest data
    if (selectedReturn) {
      try {
        const res = await axiosClient.get(`/returns/admin/${selectedReturn.id}`);
        setSelectedReturn(res.data);
      } catch {}
    }
  };

  const filtered = returns.filter(r => {
    const matchStatus = statusFilter === 'ALL' || r.returnStatus === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      String(r.id).includes(q) ||
      String(r.orderId).includes(q) ||
      r.customerName?.toLowerCase().includes(q) ||
      r.customerEmail?.toLowerCase().includes(q) ||
      r.productName?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // Summary counts
  const counts = RETURN_STATUSES.slice(1).reduce((acc, s) => {
    acc[s] = returns.filter(r => r.returnStatus === s).length;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading Return Requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <RotateCcw className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Return Management</h1>
                <p className="text-xs text-slate-400 mt-0.5">Review, approve, and process customer returns & refunds</p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchReturns}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-orange-400" /> Refresh
          </button>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
            <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5" />
            <p className="text-sm text-rose-300">{errorMsg}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Pending Review', key: 'RETURN_REQUESTED', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
            { label: 'Approved', key: 'RETURN_APPROVED', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'Awaiting Refund', key: 'RETURN_ACCEPTED', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
            { label: 'Refunded', key: 'REFUNDED', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20' },
          ].map(card => (
            <button
              key={card.key}
              onClick={() => setStatusFilter(card.key)}
              className={`p-4 rounded-2xl border text-left hover:scale-[1.02] transition cursor-pointer ${card.bg} ${statusFilter === card.key ? 'ring-2 ring-offset-1 ring-offset-slate-950 ring-current' : ''}`}
            >
              <p className={`text-2xl font-black ${card.color}`}>{counts[card.key] || 0}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">{card.label}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1 flex-shrink-0">
            {['ALL', 'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_ACCEPTED', 'REFUNDED', 'RETURN_REJECTED', 'REFUND_FAILED'].map(s => {
              const cfg = s === 'ALL' ? { label: 'All', color: 'text-slate-300' } : STATUS_CONFIG[s];
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    statusFilter === s
                      ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                      : 'text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {s === 'ALL' ? 'All' : cfg?.label || s}
                  {s !== 'ALL' && counts[s] > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded-full text-[9px]">{counts[s]}</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, customer, or product..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-orange-500 transition"
            />
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Showing <span className="text-white font-bold">{filtered.length}</span> of <span className="text-white font-bold">{returns.length}</span> return requests
        </p>

        {/* Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Return ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Product</th>
                <th className="py-3 px-3">Order</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-3 text-right">Refund Amt</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Date</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center">
                    <RotateCcw className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No return requests found.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="py-3 px-3 font-mono font-bold text-orange-400">#{r.id}</td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-white">{r.customerName || 'N/A'}</p>
                      <p className="text-slate-400 text-[10px]">{r.customerEmail}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-white line-clamp-1 max-w-[150px]">{r.productName}</p>
                      <p className="text-slate-400 text-[10px]">{r.vendorName}</p>
                    </td>
                    <td className="py-3 px-3 font-mono text-indigo-400">#{r.orderId}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-orange-400 font-bold">{r.returnQuantity}</span>
                      <span className="text-slate-500"> / {r.orderedQuantity}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-teal-400">₹{Number(r.refundAmount || 0).toFixed(2)}</td>
                    <td className="py-3 px-3 text-center">
                      <StatusBadge status={r.returnStatus} />
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400 text-[10px]">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedReturn(r)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-lg text-[10px] font-bold hover:bg-orange-500/20 transition cursor-pointer mx-auto"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReturn && (
        <ReturnDetailModal
          returnItem={selectedReturn}
          warehouses={warehouses}
          onClose={() => setSelectedReturn(null)}
          onRefresh={handleModalRefresh}
        />
      )}
    </div>
  );
};

export default AdminReturnManagementPage;
