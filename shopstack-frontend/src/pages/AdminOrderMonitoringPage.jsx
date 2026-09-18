import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  AlertTriangle,
  Filter,
  Eye,
  X,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  ChevronDown,
  Truck,
  MapPin,
  FileText,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { getErrorMessage } from '../api/errorUtils';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_SHIPPING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'];

const statusColor = (status) => {
  switch (status) {
    case 'PENDING': return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
    case 'CONFIRMED': return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
    case 'PROCESSING': return 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30';
    case 'READY_FOR_SHIPPING': return 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30';
    case 'SHIPPED': return 'bg-purple-500/15 text-purple-400 border border-purple-500/30';
    case 'DELIVERED': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
    case 'CANCELLED': return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
    case 'RETURNED': return 'bg-orange-500/15 text-orange-400 border border-orange-500/30';
    case 'REFUNDED': return 'bg-teal-500/15 text-teal-400 border border-teal-500/30';
    default: return 'bg-slate-700 text-slate-300';
  }
};

const SHIPMENT_STAGES = [
  'SHIPMENT_CREATED',
  'SHIPPED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED'
];

const ShipmentManagementPanel = ({ order, onOrderUpdate }) => {
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carrier, setCarrier] = useState('ShopStack Express');
  const [trackingId, setTrackingId] = useState('');
  const [currentLocation, setCurrentLocation] = useState('Bangalore Logistics Hub');
  const [notes, setNotes] = useState('Box packed and manifest prepared.');
  const [creating, setCreating] = useState(false);

  const [targetStatus, setTargetStatus] = useState('');
  const [updateLocation, setUpdateLocation] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchShipment = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/shipments/order/${order.id}`);
      setShipment(res.data);
    } catch (err) {
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipment();
  }, [order.id]);

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');
    try {
      const res = await axiosClient.post(`/shipments/order/${order.id}`, {
        carrier,
        trackingId: trackingId.trim() || undefined,
        currentLocation,
        trackingNotes: notes
      });
      setShipment(res.data);
      setSuccess(`Shipment created successfully! Tracking ID: ${res.data.trackingId}`);
      onOrderUpdate();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create shipment.');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (nextStatus) => {
    if (!shipment) return;
    setUpdating(true);
    setError('');
    setSuccess('');
    try {
      const res = await axiosClient.put(`/shipments/${shipment.id}/status`, {
        status: nextStatus,
        currentLocation: updateLocation || undefined,
        trackingNotes: updateNotes || undefined
      });
      setShipment(res.data);
      setSuccess(`Shipment updated to ${nextStatus}!`);
      setUpdateLocation('');
      setUpdateNotes('');
      onOrderUpdate();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to update shipment status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center">
        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin mx-auto mb-1" />
        <p className="text-xs text-slate-400">Loading shipment status...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Shipment & Delivery Management</h3>
        </div>
        {shipment && (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            {shipment.status}
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {!shipment ? (
        <form onSubmit={handleCreateShipment} className="space-y-3">
          <p className="text-xs text-slate-400">
            Order #{order.id} is ready for dispatch. Generate shipment manifest and carrier tracking ID below.
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Logistics Carrier</label>
              <input
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Tracking ID (Auto-generated if empty)</label>
              <input
                type="text"
                value={trackingId}
                placeholder="e.g. TRK-987654"
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Current Staging Location</label>
              <input
                type="text"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Tracking Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
            {creating ? 'Creating Shipment...' : 'Create & Register Shipment'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Tracking Summary Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-900 p-3.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 block">Tracking ID</span>
              <span className="font-mono font-bold text-cyan-400">{shipment.trackingId}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Carrier</span>
              <span className="font-bold text-white">{shipment.carrier}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Current Location</span>
              <span className="font-semibold text-slate-200">{shipment.currentLocation || 'In Transit Hub'}</span>
            </div>
          </div>

          {/* Timeline steps */}
          <div className="flex items-center justify-between text-[10px] font-bold py-2 border-y border-slate-800/80">
            {SHIPMENT_STAGES.map((stg, idx) => {
              const currentIdx = SHIPMENT_STAGES.indexOf(shipment.status);
              const isPassed = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <div key={stg} className="flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isCurrent ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400/50' :
                    isPassed ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={isCurrent ? 'text-cyan-400' : isPassed ? 'text-emerald-400' : 'text-slate-600'}>
                    {stg.replace('SHIPMENT_', '')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Status Update Controls */}
          {shipment.status !== 'DELIVERED' && (
            <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <p className="text-xs font-bold text-slate-300">Advance Shipment Workflow Stage</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Updated Location (optional)..."
                  value={updateLocation}
                  onChange={(e) => setUpdateLocation(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Tracking Notes (optional)..."
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {SHIPMENT_STAGES.map((nextStg, idx) => {
                  const currentIdx = SHIPMENT_STAGES.indexOf(shipment.status);
                  if (idx <= currentIdx) return null; // cannot move backward
                  return (
                    <button
                      key={nextStg}
                      onClick={() => handleUpdateStatus(nextStg)}
                      disabled={updating}
                      className="flex-1 min-w-[120px] py-2 px-3 bg-cyan-600/15 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 hover:text-white rounded-xl text-xs font-extrabold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      Mark {nextStg.replace('SHIPMENT_', '')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AdminOrderMonitoringPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const fetchOrders = async (status) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = status && status !== 'ALL' ? { status } : {};
      const res = await axiosClient.get('/admin/orders', { params });
      setOrders(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(statusFilter !== 'ALL' ? statusFilter : null);
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      await axiosClient.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update order status.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filtered = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      String(o.id).includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.email?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading Orders...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 text-center max-w-lg space-y-3">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Error Loading Orders</h2>
          <p className="text-xs text-rose-300">{errorMsg}</p>
          <button onClick={() => fetchOrders(statusFilter !== 'ALL' ? statusFilter : null)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
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
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <ShoppingBag className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Order Monitoring</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Monitor and manage all marketplace orders in real-time</p>
          </div>
          <button
            onClick={() => fetchOrders(statusFilter !== 'ALL' ? statusFilter : null)}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  statusFilter === s
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Orders Summary */}
        <p className="text-xs text-slate-400">
          Showing <span className="text-white font-bold">{filtered.length}</span> orders
          {statusFilter !== 'ALL' && <span className="text-amber-400"> — filtered by: {statusFilter}</span>}
        </p>

        {/* Orders Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Update Status</th>
                <th className="py-3 px-3 text-center">Details & Shipping</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-slate-500">No orders found.</td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition-all">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-400">#{o.id}</td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-white">{o.customer?.name || 'N/A'}</p>
                      <p className="text-slate-400 text-[10px]">{o.customer?.email}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[10px]">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <p className="font-bold text-white">₹{Number(o.totalAmount || 0).toFixed(2)}</p>
                      {o.discountAmount > 0 && (
                        <p className="text-[10px] text-rose-400">−₹{Number(o.discountAmount || 0).toFixed(2)} off</p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                        disabled={updatingStatus === o.id}
                        className="bg-slate-800 border border-slate-700 text-slate-200 text-[10px] rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.filter((s) => s !== 'ALL').map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg text-[10px] font-bold hover:bg-indigo-500/20 transition-all cursor-pointer mx-auto"
                      >
                        <Eye className="w-3 h-3" /> View & Ship
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white">Order #{selectedOrder.id}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shipment Management Panel */}
            <ShipmentManagementPanel
              order={selectedOrder}
              onOrderUpdate={() => fetchOrders(statusFilter !== 'ALL' ? statusFilter : null)}
            />

            {/* Customer Info */}
            <div className="bg-slate-950 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Info</p>
              <p className="text-sm font-bold text-white">{selectedOrder.customer?.name}</p>
              <p className="text-xs text-slate-400">{selectedOrder.customer?.email}</p>
              <p className="text-xs text-slate-400">
                Shipping Address: <span className="text-slate-200">{selectedOrder.shippingAddress}</span>
              </p>
              {selectedOrder.couponCode && (
                <p className="text-xs text-amber-400">Coupon used: <span className="font-bold">{selectedOrder.couponCode}</span></p>
              )}
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Items</p>
              <div className="divide-y divide-slate-800">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">{item.product?.name}</p>
                      <p className="text-[10px] text-slate-400">
                        Vendor: {item.vendor?.businessName} · Qty: {item.quantity} · @₹{Number(item.priceAtPurchase).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-amber-400">
                        Commission: {item.commissionRate}% (₹{Number(item.commissionAmount || 0).toFixed(2)}) · Vendor Earning: ₹{Number(item.vendorEarning || 0).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-white flex-shrink-0">
                      ₹{(Number(item.priceAtPurchase) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-slate-950 rounded-2xl p-4 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Gross Amount</span>
                <span className="font-bold text-white">₹{Number(selectedOrder.grossAmount || 0).toFixed(2)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Discount ({selectedOrder.couponCode})</span>
                  <span className="font-bold text-rose-400">−₹{Number(selectedOrder.discountAmount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="font-bold text-white">Total Paid</span>
                <span className="font-black text-emerald-400 text-sm">₹{Number(selectedOrder.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Update Status */}
            <div className="flex items-center gap-3">
              <p className="text-xs text-slate-400">Update Status:</p>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                disabled={updatingStatus === selectedOrder.id}
                className="flex-1 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer disabled:opacity-50"
              >
                {STATUS_OPTIONS.filter((s) => s !== 'ALL').map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderMonitoringPage;
