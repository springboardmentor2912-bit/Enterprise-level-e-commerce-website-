import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { setCustomerOrders, setOrderLoading, updateCustomerOrder } from '../store/slices/orderSlice';
import {
  Package, Clock, Truck, CheckCircle2, MapPin, Store,
  RefreshCw, RotateCcw, Banknote, ShieldCheck, CircleDot, CheckCheck,
  X, AlertTriangle, ChevronDown, Loader2
} from 'lucide-react';

import { getErrorMessage } from '../api/errorUtils';

// Full order status pipeline
const STATUS_STEPS = [
  { key: 'PENDING',    label: 'Ordered',    icon: Package,      color: 'text-slate-400',   bg: 'bg-slate-700' },
  { key: 'CONFIRMED',  label: 'Confirmed',  icon: CheckCircle2, color: 'text-indigo-400',  bg: 'bg-indigo-600' },
  { key: 'PROCESSING', label: 'Processing', icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500' },
  { key: 'SHIPPED',    label: 'Shipped',    icon: Truck,        color: 'text-blue-400',    bg: 'bg-blue-600' },
  { key: 'DELIVERED',  label: 'Delivered',  icon: CheckCheck,   color: 'text-emerald-400', bg: 'bg-emerald-600' },
];

const EXCEPTION_STATUSES = {
  RETURNED:  { label: 'Returned',  icon: RotateCcw,  color: 'text-orange-400', bg: 'bg-orange-600/10 border border-orange-500/30' },
  REFUNDED:  { label: 'Refunded',  icon: Banknote,   color: 'text-teal-400',   bg: 'bg-teal-600/10 border border-teal-500/30' },
  CANCELLED: { label: 'Cancelled', icon: CircleDot,  color: 'text-rose-400',   bg: 'bg-rose-600/10 border border-rose-500/30' },
};

const RETURN_REASONS = [
  'Product is damaged or defective',
  'Wrong product received',
  'Product does not match description',
  'Changed my mind',
  'Better price available elsewhere',
  'Quality is not as expected',
  'Missing parts or accessories',
  'Other',
];

const RETURN_STATUS_LABELS = {
  RETURN_REQUESTED: { label: 'Return Requested',  color: 'text-amber-400',   bg: 'bg-amber-500/10 border border-amber-500/30' },
  RETURN_APPROVED:  { label: 'Return Approved',   color: 'text-blue-400',    bg: 'bg-blue-500/10 border border-blue-500/30' },
  RETURN_REJECTED:  { label: 'Return Rejected',   color: 'text-rose-400',    bg: 'bg-rose-500/10 border border-rose-500/30' },
  PRODUCT_RETURNED: { label: 'Product Returned',  color: 'text-purple-400',  bg: 'bg-purple-500/10 border border-purple-500/30' },
  RETURN_RECEIVED:  { label: 'Return Received',   color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border border-indigo-500/30' },
  RETURN_ACCEPTED:  { label: 'Return Accepted',   color: 'text-cyan-400',    bg: 'bg-cyan-500/10 border border-cyan-500/30' },
  REFUND_INITIATED: { label: 'Refund Initiated',  color: 'text-violet-400',  bg: 'bg-violet-500/10 border border-violet-500/30' },
  REFUNDED:         { label: 'Refunded ✓',        color: 'text-teal-400',    bg: 'bg-teal-500/10 border border-teal-500/30' },
  REFUND_FAILED:    { label: 'Refund Failed',      color: 'text-rose-400',    bg: 'bg-rose-500/10 border border-rose-500/30' },
};

const getStatusBadge = (status) => {
  const exception = EXCEPTION_STATUSES[status];
  if (exception) {
    const Icon = exception.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${exception.bg} ${exception.color}`}>
        <Icon className="w-3.5 h-3.5 mr-1" /> {exception.label}
      </span>
    );
  }
  const step = STATUS_STEPS.find(s => s.key === status);
  if (!step) return null;
  const Icon = step.icon;
  const colorMap = {
    PENDING: 'bg-slate-700/50 text-slate-300 border border-slate-600',
    CONFIRMED: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
    PROCESSING: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    SHIPPED: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
    DELIVERED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colorMap[status] || ''}`}>
      <Icon className="w-3.5 h-3.5 mr-1" /> {step.label}
    </span>
  );
};

const ShipmentTrackingWidget = ({ orderId }) => {
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchShipment = async () => {
      try {
        const res = await axiosClient.get(`/shipments/order/${orderId}`);
        if (isMounted) setShipment(res.data);
      } catch (err) {
        if (isMounted) setShipment(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchShipment();
    return () => { isMounted = false; };
  }, [orderId]);

  if (loading || !shipment) return null;

  const STAGES = [
    { key: 'SHIPMENT_CREATED', label: 'Manifested' },
    { key: 'SHIPPED',          label: 'Shipped' },
    { key: 'IN_TRANSIT',       label: 'In Transit' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED',        label: 'Delivered' },
  ];

  const currentIdx = STAGES.findIndex(s => s.key === shipment.status);

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 text-xs">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">{shipment.carrier}</span>
          <span className="font-mono text-[11px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
            {shipment.trackingId}
          </span>
        </div>
        {shipment.currentLocation && (
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-indigo-400" />
            <span>{shipment.currentLocation}</span>
          </span>
        )}
      </div>

      {/* Interactive tracking pipeline */}
      <div className="flex items-center gap-0 overflow-x-auto py-1">
        {STAGES.map((stg, idx) => {
          const isDone = idx < currentIdx;
          const isActive = idx === currentIdx;
          return (
            <React.Fragment key={stg.key}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isActive
                    ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400/40 font-black'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {idx + 1}
                </div>
                <span className={`text-[9px] mt-1 font-semibold whitespace-nowrap ${
                  isDone ? 'text-emerald-400' : isActive ? 'text-cyan-400 font-bold' : 'text-slate-600'
                }`}>
                  {stg.label}
                </span>
              </div>
              {idx < STAGES.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 min-w-[1rem] ${idx < currentIdx ? 'bg-emerald-600' : 'bg-slate-800'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {shipment.trackingNotes && (
        <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
          <strong className="text-slate-300">Latest Update:</strong> {shipment.trackingNotes}
        </p>
      )}
    </div>
  );
};

const getNormalizedStatusIndex = (status) => {
  if (!status) return -1;
  const s = status.toUpperCase();
  switch (s) {
    case 'PENDING':
    case 'ORDERED':
      return 0;
    case 'CONFIRMED':
      return 1;
    case 'WAREHOUSE_ALLOCATED':
    case 'PROCESSING':
    case 'READY_FOR_SHIPPING':
      return 2;
    case 'SHIPPED':
      return 3;
    case 'DELIVERED':
      return 4;
    default:
      return -1;
  }
};

const OrderTimeline = ({ status }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <CircleDot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-rose-300 text-sm">Order Status: CANCELLED</h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              This order has been cancelled and item stock has been restored to product inventory in PostgreSQL.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-rose-600/20 text-rose-400 border border-rose-500/40">
          CANCELLED
        </span>
      </div>
    );
  }

  if (status === 'RETURNED') {
    return (
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-orange-300 text-sm">Order Status: RETURNED</h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              This order has been returned.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-orange-600/20 text-orange-400 border border-orange-500/40">
          RETURNED
        </span>
      </div>
    );
  }

  if (status === 'REFUNDED') {
    return (
      <div className="bg-teal-500/10 border border-teal-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Banknote className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-teal-300 text-sm">Order Status: REFUNDED</h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Refund has been issued and will be credited within 5-7 business days.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-teal-600/20 text-teal-400 border border-teal-500/40">
          REFUNDED
        </span>
      </div>
    );
  }

  const currentIdx = getNormalizedStatusIndex(status);

  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2">
      {STATUS_STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isDone = currentIdx >= 0 && idx < currentIdx;
        const isActive = currentIdx >= 0 && idx === currentIdx;

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  isDone
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-950/40'
                    : isActive
                    ? `${step.bg} border-white ring-4 ring-indigo-500/40 scale-110 shadow-lg text-white font-black`
                    : 'bg-slate-800/80 border-slate-700/70 text-slate-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                )}
              </div>
              <span
                className={`text-[11px] mt-1.5 font-semibold whitespace-nowrap ${
                  isDone
                    ? 'text-emerald-400 font-bold'
                    : isActive
                    ? `${step.color} font-extrabold scale-105`
                    : 'text-slate-500 font-normal'
                }`}
              >
                {step.label}
              </span>
            </div>

            {idx < STATUS_STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1.5 min-w-[2rem] transition-colors ${
                  currentIdx >= 0 && idx < currentIdx ? 'bg-emerald-500' : 'bg-slate-700/60'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Return Modal ──────────────────────────────────────────────────────────────
const ReturnModal = ({ item, orderId, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const maxQty = item.quantity || 1;
  const finalReason = reason === 'Other' ? customReason : reason;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!finalReason.trim()) {
      setError('Please select or enter a return reason.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await axiosClient.post(`/returns/request/${item.id}`, {
        quantity,
        reason: finalReason,
      });
      onSuccess('Return request submitted successfully! Our team will review it within 1-2 business days.');
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to submit return request.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <RotateCcw className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Request Return</h2>
              <p className="text-xs text-slate-400 line-clamp-1">{item.product?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product info */}
        <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
          <img
            src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&auto=format&fit=crop&q=80'}
            alt={item.product?.name}
            className="w-12 h-12 rounded-lg object-cover border border-slate-800"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white line-clamp-1">{item.product?.name}</p>
            <p className="text-xs text-slate-400">Ordered qty: {maxQty} · ₹{Number(item.priceAtPurchase).toFixed(2)} each</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Return Quantity</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold flex items-center justify-center hover:bg-slate-700 transition cursor-pointer"
              >−</button>
              <span className="text-lg font-black text-white w-8 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold flex items-center justify-center hover:bg-slate-700 transition cursor-pointer"
              >+</button>
              <span className="text-xs text-slate-400">of {maxQty}</span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Return Reason</label>
            <div className="relative">
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 pr-9 focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
              >
                <option value="">— Select a reason —</option>
                {RETURN_REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {reason === 'Other' && (
              <textarea
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                placeholder="Please describe your reason..."
                rows={3}
                required
                className="mt-2 w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-orange-500 resize-none"
              />
            )}
          </div>

          {/* Refund estimate */}
          {reason && (
            <div className="p-3 bg-teal-500/5 border border-teal-500/20 rounded-xl">
              <p className="text-xs text-slate-400">Estimated refund amount</p>
              <p className="text-lg font-black text-teal-400">
                ₹{(Number(item.priceAtPurchase) * quantity).toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-500">Credited within 5-7 business days upon approval</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-300">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !reason}
              className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
              {submitting ? 'Submitting...' : 'Submit Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Cancel Order Modal ────────────────────────────────────────────────────────
const CancelOrderModal = ({ order, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  const handleConfirmCancel = async () => {
    setCancelling(true);
    setError('');
    try {
      const res = await axiosClient.post(`/orders/${order.id}/cancel`);
      if (res.data) {
        dispatch(updateCustomerOrder(res.data));
      }
      onSuccess(`Order #${order.id} has been cancelled successfully! Item stock quantity restored.`);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to cancel order. Please try again.'));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Cancel Order #{order.id}</h2>
              <p className="text-xs text-slate-400">Confirm order cancellation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
          <p className="font-semibold text-slate-200">
            Are you sure you want to cancel this order?
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Order status will be saved as <strong className="text-rose-400">CANCELLED</strong> in PostgreSQL.</li>
            <li>Cancelled item quantity will automatically be restored to product stock inventory.</li>
          </ul>
          <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white">
            <span>Order Total:</span>
            <span className="text-indigo-400">₹{Number(order.totalAmount).toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-rose-300">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={cancelling}
            className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-700 transition cursor-pointer"
          >
            Keep Order
          </button>
          <button
            type="button"
            onClick={handleConfirmCancel}
            disabled={cancelling}
            className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Item Return Status Badge ──────────────────────────────────────────────────
const ReturnStatusBadge = ({ returnInfo }) => {
  if (!returnInfo) return null;
  const cfg = RETURN_STATUS_LABELS[returnInfo.returnStatus];
  if (!cfg) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
      <RotateCcw className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const OrdersPage = () => {
  const dispatch = useDispatch();
  const { customerOrders, loading } = useSelector((state) => state.order);

  // Map: orderItemId -> return info (fetched from /returns/my)
  const [returnMap, setReturnMap] = useState({});
  const [returnModal, setReturnModal] = useState(null); // { item, orderId }
  const [cancelModalOrder, setCancelModalOrder] = useState(null); // order object
  const [successMsg, setSuccessMsg] = useState('');
  const [fetchError, setFetchError] = useState('');

  const fetchOrders = async () => {
    dispatch(setOrderLoading(true));
    setFetchError('');
    try {
      const res = await axiosClient.get('/orders/history');
      dispatch(setCustomerOrders(res.data));
    } catch (err) {
      setFetchError(getErrorMessage(err, 'Failed to load order history.'));
    } finally {
      dispatch(setOrderLoading(false));
    }
  };

  const fetchMyReturns = async () => {
    try {
      const res = await axiosClient.get('/returns/my');
      const map = {};
      res.data.forEach(r => {
        map[r.orderItemId] = r;
      });
      setReturnMap(map);
    } catch (err) {
      // Non-critical: customer may not have any returns yet
      console.warn('Could not load return statuses', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchMyReturns();
  }, []);

  const handleReturnSuccess = (msg) => {
    setSuccessMsg(msg);
    fetchOrders();
    fetchMyReturns();
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  // Determine if an item is eligible for return
  const canRequestReturn = (order, item) => {
    if (order.status !== 'DELIVERED' && order.status !== 'RETURNED') return false;
    const existingReturn = returnMap[item.id];
    if (existingReturn) return false; // already has a return
    return true;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
              <Package className="w-7 h-7 mr-3 text-indigo-400" /> My Orders
            </h1>
            <p className="text-xs text-slate-400">Track all your orders with live status updates</p>
          </div>
          <button
            onClick={() => { fetchOrders(); fetchMyReturns(); }}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Error Message */}
        {fetchError && (
          <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <p className="text-sm text-rose-300 font-semibold">{fetchError}</p>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="flex items-start gap-3 p-4 bg-teal-500/10 border border-teal-500/30 rounded-2xl">
            <CheckCheck className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-teal-300 font-semibold">{successMsg}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 mt-2">Loading order history...</p>
          </div>
        ) : customerOrders.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Package className="w-16 h-16 text-slate-700 mx-auto" />
            <h2 className="text-xl font-bold text-white">No orders placed yet</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Once you checkout items from your cart, your order tracking timeline will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {customerOrders.map((order) => (
              <div
                key={order.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 hover:border-slate-700 transition-all"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-extrabold text-lg text-white">Order #{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-left sm:text-right">
                    {['PENDING', 'ORDERED', 'CONFIRMED', 'WAREHOUSE_ALLOCATED', 'PROCESSING', 'READY_FOR_SHIPPING'].includes(order.status?.toUpperCase()) && (
                      <button
                        onClick={() => setCancelModalOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel Order
                      </button>
                    )}
                    <div>
                      <span className="text-xs text-slate-400 block">Order Total</span>
                      <span className="text-2xl font-black text-indigo-400">
                        ₹{Number(order.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Delivery Timeline
                  </h3>
                  <OrderTimeline status={order.status} />
                </div>

                {/* Live Shipment & Carrier Tracking */}
                <ShipmentTrackingWidget orderId={order.id} />

                {/* Delivery Address */}
                <div className="flex items-start text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <MapPin className="w-4 h-4 mr-2 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-200">Delivery to:</strong> {order.shippingAddress}
                  </span>
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Items</h3>
                  <div className="divide-y divide-slate-800/60 border border-slate-800/80 rounded-2xl bg-slate-950/40 overflow-hidden">
                    {order.items.map((item) => {
                      const priceAtPurchase = Number(item.priceAtPurchase || 0);
                      const qty = item.quantity || 1;
                      const existingReturn = returnMap[item.id];
                      const eligible = canRequestReturn(order, item);

                      return (
                        <div key={item.id} className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={
                                  item.product?.images && item.product.images.length > 0
                                    ? item.product.images[0]
                                    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'
                                }
                                alt={item.product?.name}
                                className="w-12 h-12 rounded-lg object-cover bg-slate-900 border border-slate-800"
                              />
                              <div>
                                <h4 className="text-sm font-bold text-white line-clamp-1">{item.product?.name}</h4>
                                <div className="flex items-center text-[11px] text-slate-400 gap-1">
                                  <Store className="w-3 h-3 text-purple-400" />
                                  <span>{item.vendor?.businessName || 'Verified Merchant'}</span>
                                </div>
                                {item.product?.category?.name && (
                                  <span className="text-[10px] text-indigo-400">{item.product.category.name}</span>
                                )}
                              </div>
                            </div>

                            <div className="text-right text-xs flex-shrink-0 flex flex-col items-end gap-1">
                              <span className="text-slate-400 block">
                                {qty} × ₹{priceAtPurchase.toFixed(2)}
                              </span>
                              <span className="font-extrabold text-white text-sm">
                                ₹{(qty * priceAtPurchase).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Return section */}
                          <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              {existingReturn && (
                                <ReturnStatusBadge returnInfo={existingReturn} />
                              )}
                              {existingReturn?.refundAmount && (
                                <span className="text-[10px] text-teal-400">
                                  Refund: ₹{Number(existingReturn.refundAmount).toFixed(2)}
                                </span>
                              )}
                              {existingReturn?.refundFailureReason && (
                                <span className="text-[10px] text-rose-400 max-w-xs truncate" title={existingReturn.refundFailureReason}>
                                  ⚠ {existingReturn.refundFailureReason}
                                </span>
                              )}
                            </div>

                            {eligible && (
                              <button
                                onClick={() => setReturnModal({ item, orderId: order.id })}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600/10 border border-orange-500/30 text-orange-400 text-[11px] font-bold rounded-xl hover:bg-orange-600/20 transition cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Return Item
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shield/Protected footer */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Protected by ShopStack Buyer Protection · Returns eligible within 7 days of order</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Return Modal */}
      {returnModal && (
        <ReturnModal
          item={returnModal.item}
          orderId={returnModal.orderId}
          onClose={() => setReturnModal(null)}
          onSuccess={handleReturnSuccess}
        />
      )}

      {/* Cancel Order Modal */}
      {cancelModalOrder && (
        <CancelOrderModal
          order={cancelModalOrder}
          onClose={() => setCancelModalOrder(null)}
          onSuccess={handleReturnSuccess}
        />
      )}
    </div>
  );
};

export default OrdersPage;
