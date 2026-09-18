import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import {
  ShoppingBag, Truck, CheckCircle2, Clock, MapPin, RefreshCw,
  DollarSign, RotateCcw, Banknote, Package, ChevronDown, AlertTriangle
} from 'lucide-react';
import { getErrorMessage } from '../api/errorUtils';

const STATUS_OPTIONS = [
  { value: 'CONFIRMED',  label: 'Confirm',   className: 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 border border-indigo-500/30' },
  { value: 'PROCESSING', label: 'Processing', className: 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/40 border border-amber-500/30' },
  { value: 'SHIPPED',    label: 'Mark Shipped', className: 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 border border-blue-500/30' },
  { value: 'DELIVERED',  label: 'Delivered',  className: 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 border border-emerald-500/30' },
  { value: 'RETURNED',   label: 'Return',     className: 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/40 border border-orange-500/30' },
  { value: 'REFUNDED',   label: 'Refund',     className: 'bg-teal-500/20 text-teal-300 hover:bg-teal-500/40 border border-teal-500/30' },
];

const STATUS_BADGE_MAP = {
  PENDING:    'bg-slate-700/50 text-slate-300 border border-slate-600',
  CONFIRMED:  'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30',
  PROCESSING: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  SHIPPED:    'bg-blue-500/10 text-blue-400 border border-blue-500/30',
  DELIVERED:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  CANCELLED:  'bg-rose-500/10 text-rose-400 border border-rose-500/30',
  RETURNED:   'bg-orange-500/10 text-orange-400 border border-orange-500/30',
  REFUNDED:   'bg-teal-500/10 text-teal-400 border border-teal-500/30',
};

const VendorOrdersPage = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  const vendorHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('shopstack_vendor_token')}`,
    },
  };

  const fetchVendorOrders = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axiosClient.get('/vendor/orders', vendorHeaders);
      setSalesOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch vendor sales orders', err);
      setErrorMsg(getErrorMessage(err, 'Failed to load sales orders. Please try refreshing.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  // FIXED: use item.orderId (not item.id) to update the correct Order record
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (!orderId) {
      showMessage('Cannot update: order ID not found for this item.');
      return;
    }
    try {
      await axiosClient.put(`/orders/${orderId}/status`, { status: newStatus }, vendorHeaders);
      showMessage(`Order #${orderId} status updated to ${newStatus}!`);
      fetchVendorOrders();
    } catch (err) {
      showMessage(getErrorMessage(err, 'Failed to update order status.'));
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
              <ShoppingBag className="w-7 h-7 mr-3 text-purple-400" /> Merchant Sales Orders
            </h1>
            <p className="text-xs text-slate-400">Monitor customer purchases and update fulfillment status</p>
          </div>
          <button
            onClick={fetchVendorOrders}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 transition-all cursor-pointer"
            title="Refresh Sales"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Message Toast */}
        {message && (
          <div className="bg-purple-500/20 border border-purple-500/40 text-purple-300 p-4 rounded-2xl text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 mt-2">Loading sales order activity...</p>
          </div>
        ) : salesOrders.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto" />
            <h2 className="text-xl font-bold text-white">No sales orders received yet</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When customers purchase items from your store, the order line items will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[800px]">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4">Item Details</th>
                    <th className="p-4">Order #</th>
                    <th className="p-4">Qty</th>
                    <th className="p-4">Unit Price</th>
                    <th className="p-4">Subtotal</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {salesOrders.map((item) => {
                    const orderId = item.orderId;
                    const orderStatus = item.orderStatus || 'PENDING';
                    const unitPrice = Number(item.priceAtPurchase || 0);
                    const subtotal = unitPrice * (item.quantity || 1);

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Item Details */}
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                item.product?.images && item.product.images.length > 0
                                  ? item.product.images[0]
                                  : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'
                              }
                              alt={item.product?.name}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white line-clamp-1">{item.product?.name}</div>
                              <div className="text-xs text-slate-400">{item.product?.brand || ''}</div>
                              <div className="text-[11px] text-purple-400 font-semibold mt-0.5">
                                Order Item #{item.id}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Order # */}
                        <td className="p-4">
                          <span className="font-bold text-indigo-300">#{orderId || '—'}</span>
                        </td>

                        {/* Quantity */}
                        <td className="p-4 font-bold text-slate-200">{item.quantity} units</td>

                        {/* Unit Price */}
                        <td className="p-4 text-slate-300">₹{unitPrice.toFixed(2)}</td>

                        {/* Subtotal */}
                        <td className="p-4 font-black text-indigo-400">₹{subtotal.toFixed(2)}</td>

                        {/* Status Badge */}
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_BADGE_MAP[orderStatus] || ''}`}>
                            {orderStatus}
                          </span>
                        </td>

                        {/* Status Update Buttons */}
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1 justify-end">
                            {STATUS_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => handleUpdateOrderStatus(orderId, opt.value)}
                                disabled={orderStatus === opt.value}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${opt.className}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOrdersPage;
