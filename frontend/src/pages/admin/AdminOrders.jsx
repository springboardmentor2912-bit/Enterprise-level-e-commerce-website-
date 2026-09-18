import React, { useEffect, useState } from 'react';
import { getAdminOrders, markOrderItemDelivered } from '../../services/adminService';
import {
  getAllocationsForOrder,
  getStockForProduct,
  manuallyAllocateOrderItem,
} from '../../services/warehouseService';

const STATUS_STYLES = {
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-indigo-50 text-indigo-700 border-indigo-200",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
  RETURNED: "bg-orange-50 text-orange-700 border-orange-200",
  REFUNDED: "bg-slate-100 text-slate-700 border-slate-200",
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [allocationsByOrder, setAllocationsByOrder] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [deliveringItemId, setDeliveringItemId] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const data = await getAdminOrders();
      const list = Array.isArray(data) ? data : [];
      setOrders(list);

      const entries = await Promise.all(
        list.map(async (order) => {
          try {
            const allocations = await getAllocationsForOrder(order.id);
            return [order.id, Array.isArray(allocations) ? allocations : []];
          } catch (err) {
            return [order.id, []];
          }
        })
      );
      setAllocationsByOrder(Object.fromEntries(entries));
    } catch (err) {
      console.error("Failed to load admin orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshOrderAllocations = async (orderId) => {
    try {
      const allocations = await getAllocationsForOrder(orderId);
      setAllocationsByOrder((prev) => ({
        ...prev,
        [orderId]: Array.isArray(allocations) ? allocations : [],
      }));
    } catch (err) {
      console.error("Failed to refresh allocations:", err);
    }
  };

  const handleMarkDelivered = async (itemId) => {
    setDeliveringItemId(itemId);
    try {
      await markOrderItemDelivered(itemId);
      await loadAll();
    } catch (err) {
      alert(err.response?.data || "Failed to mark this item as delivered.");
    } finally {
      setDeliveringItemId(null);
    }
  };

  const rows = orders.flatMap((order) =>
    (order.items || []).map((item) => {
      const allocations = allocationsByOrder[order.id] || [];
      const itemAllocations = allocations.filter(
        (a) => a.orderItemId === item.id && a.status !== 'CANCELLED'
      );
      const allocatedQuantity = itemAllocations.reduce((sum, a) => sum + a.quantity, 0);
      const remaining = Math.max(0, (item.quantity || 0) - allocatedQuantity);
      const warehouseNames = [...new Set(itemAllocations.map((a) => a.warehouseName))];

      return {
        ...item,
        orderId: order.id,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        createdAt: order.createdAt,
        remaining,
        warehouseNames,
      };
    })
  );

  const filteredRows = rows.filter((row) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "NEEDS_ALLOCATION") {
      return row.remaining > 0 && row.status !== "CANCELLED";
    }
    return row.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">Order Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            {orders.length} order(s) · {rows.length} line item(s)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEEDS_ALLOCATION">Needs Allocation</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing (Allocated)</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RETURNED">Returned</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-slate-700 uppercase font-semibold">
              <tr>
                <th className="p-4">Order / Product</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Details</th>
                <th className="p-4">Allocation</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">
                    No order items match this filter.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <OrderItemRow
                    key={row.id}
                    row={row}
                    onAllocated={() => refreshOrderAllocations(row.orderId)}
                    onMarkDelivered={() => handleMarkDelivered(row.id)}
                    delivering={deliveringItemId === row.id}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const OrderItemRow = ({ row, onAllocated, onMarkDelivered, delivering }) => {
  const [showAllocateForm, setShowAllocateForm] = useState(false);
  const [stockOptions, setStockOptions] = useState(null);
  const [loadingStock, setLoadingStock] = useState(false);
  const [warehouseId, setWarehouseId] = useState('');
  const [quantity, setQuantity] = useState(row.remaining);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isTerminal = ['CANCELLED', 'RETURNED', 'REFUNDED'].includes(row.status);
  const needsAllocation = row.remaining > 0 && !isTerminal;

  // Flexible extraction of product ID
  const targetProductId = row.productId || row.product?.id || row.id;

  const openAllocateForm = async () => {
    setShowAllocateForm(true);
    setQuantity(row.remaining);
    setError('');
    
    if (stockOptions !== null) return;
    
    setLoadingStock(true);
    try {
      if (!targetProductId) {
        console.error("No valid product ID found for row:", row);
        setStockOptions([]);
        return;
      }

      const data = await getStockForProduct(targetProductId);
      
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.content)) {
        list = data.content;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      }

      setStockOptions(list);
    } catch (err) {
      console.error("Failed to fetch stock options:", err);
      setStockOptions([]);
    } finally {
      setLoadingStock(false);
    }
  };

  const handleAllocate = async () => {
    if (!warehouseId) {
      setError('Choose a warehouse first.');
      return;
    }
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError('Enter a quantity greater than zero.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await manuallyAllocateOrderItem(row.id, Number(warehouseId), qty);
      setShowAllocateForm(false);
      setStockOptions(null);
      setWarehouseId('');
      await onAllocated();
    } catch (err) {
      setError(err.response?.data || 'Failed to allocate this item.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <tr className="hover:bg-stone-50/50 transition align-top">
      <td className="p-4 font-bold text-slate-900">
        <div>{row.productName}</div>
        <div className="text-2xs font-medium text-slate-400 mt-0.5">Order #{row.orderId}</div>
      </td>
      <td className="p-4 font-medium text-slate-700">
        <div>{row.customerName}</div>
        <div className="text-2xs text-slate-400">{row.customerEmail}</div>
      </td>
      <td className="p-4 font-medium text-slate-700">
        {row.quantity} unit(s) x ₹{row.priceAtPurchase}
      </td>

      <td className="p-4">
        {isTerminal ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-slate-500 border border-stone-200">
            N/A
          </span>
        ) : row.remaining <= 0 ? (
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              &#10003; Allocated
            </span>
            {row.warehouseNames.length > 0 && (
              <div className="text-2xs text-slate-400 mt-1">{row.warehouseNames.join(', ')}</div>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            &#9679; Needs Allocation{row.warehouseNames.length > 0 ? ` (${row.remaining} left)` : ''}
          </span>
        )}
      </td>

      <td className="p-4">
        <span
          className={`px-2.5 py-1 rounded-full font-bold text-[10px] border ${
            STATUS_STYLES[row.status] || "bg-stone-100 text-stone-700"
          }`}
        >
          {row.status}
        </span>
      </td>

      <td className="p-4 text-right">
        {needsAllocation && !showAllocateForm && (
          <button
            type="button"
            onClick={openAllocateForm}
            className="px-3 py-1.5 rounded-lg text-2xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
          >
            Allocate
          </button>
        )}

        {row.status === 'SHIPPED' && (
          <button
            type="button"
            onClick={onMarkDelivered}
            disabled={delivering}
            className="px-3 py-1.5 rounded-lg text-2xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition disabled:opacity-50 cursor-pointer"
          >
            {delivering ? 'Updating...' : 'Mark Delivered'}
          </button>
        )}

        {!needsAllocation && row.status !== 'SHIPPED' && (
          <span className="text-2xs text-stone-400 italic">
            {isTerminal ? 'No action' : 'Handled by warehouse staff'}
          </span>
        )}

        {showAllocateForm && (
          <div className="mt-2 text-left bg-stone-50 border border-stone-200 rounded-xl p-3 w-64 ml-auto space-y-2">
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-2 py-1.5 text-2xs focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="">
                {loadingStock 
                  ? 'Loading warehouses...' 
                  : stockOptions && stockOptions.length === 0 
                    ? 'No warehouses found' 
                    : 'Choose warehouse...'}
              </option>
              {(stockOptions || []).map((s, idx) => {
                const wId = s.warehouseId || s.warehouse?.id || s.id;
                const wName = s.warehouseName || s.warehouse?.name || `Warehouse #${wId}`;
                const avail = s.availableQuantity ?? s.quantity ?? 0;

                return (
                  <option key={wId || idx} value={wId} disabled={avail <= 0}>
                    {wName} ({avail} available)
                  </option>
                );
              })}
            </select>
            <input
              type="number"
              min={1}
              max={row.remaining}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border border-stone-300 rounded-lg px-2 py-1.5 text-2xs focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
            {error && <p className="text-rose-600 text-2xs">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAllocate}
                disabled={submitting}
                className="flex-1 px-3 py-1.5 rounded-lg text-2xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Allocating...' : 'Confirm'}
              </button>
              <button
                type="button"
                onClick={() => setShowAllocateForm(false)}
                className="px-3 py-1.5 rounded-lg text-2xs font-semibold border border-stone-300 text-slate-600 hover:bg-stone-100 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
};

export default AdminOrders;