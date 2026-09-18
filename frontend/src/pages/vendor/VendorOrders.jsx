import { useEffect, useState } from "react";
import { getVendorOrders, updateOrderStatus, approveRefund } from "../../api/vendorApi";

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await getVendorOrders();
      const rawOrders = res.data || [];

      const rows = [];
      for (const order of rawOrders) {
        if (order.items && order.items.length > 0) {
          for (const item of order.items) {
            rows.push({
              orderId: order.orderId,
              orderDate: order.orderDate,
              status: order.status,
              customerName: order.customerName,
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal,
              originalPrice: item.originalPrice,          
              discountPercentage: item.discountPercentage, 
              couponCode: order.couponCode,                
              couponDiscount: order.discountAmount,
              fulfillmentStatus: item.fulfillmentStatus || 'PENDING',
            });
          }
        } else {
          rows.push({
            orderId: order.orderId,
            orderDate: order.orderDate,
            status: order.status,
            customerName: order.customerName,
            productName: "(no items)",
            quantity: 0,
            price: 0,
            subtotal: order.totalAmount || 0,
            originalPrice: 0,
            discountPercentage: 0,
            couponCode: order.couponCode,
            couponDiscount: order.discountAmount,
            fulfillmentStatus: 'PENDING',
          });
        }
      }

      setOrders(rows);
    } catch (e) {
      console.error("Failed to load orders:", e);
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(orderId, status) {
    setSavingKey(orderId + status);
    try {
      if (status === "REFUNDED") {
        await approveRefund(orderId);
      } else {
        await updateOrderStatus(orderId, status);
      }
      await load();
    } catch (e) {
      alert("Failed to update order: " + (e.response?.data?.message || e.message));
    } finally {
      setSavingKey(null);
    }
  }

  function WarehouseBadge({ status }) {
    const colors = {
      ALLOCATED: "bg-amber-50 text-amber-700 ring-amber-600/15",
      PICKED: "bg-blue-50 text-blue-700 ring-blue-600/15",
      PACKED: "bg-indigo-50 text-indigo-700 ring-indigo-600/15",
      READY_FOR_SHIPMENT: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
      PENDING: "bg-stone-100 text-stone-600 ring-stone-500/15",
    };
    return (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${colors[status] || colors.PENDING}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  }

  function StatusBadge({ status }) {
    const colors = {
      PENDING: "bg-amber-50 text-amber-700 ring-amber-600/15",
      CONFIRMED: "bg-blue-50 text-blue-700 ring-blue-600/15",
      SHIPPED: "bg-indigo-50 text-indigo-700 ring-indigo-600/15",
      DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
      CANCELLED: "bg-rose-50 text-rose-700 ring-rose-600/15",
      REJECTED: "bg-rose-50 text-rose-700 ring-rose-600/15",
      RETURN_REQUESTED: "bg-amber-50 text-amber-700 ring-amber-600/15",
      REFUNDED: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    };
    return (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ring-1 ${colors[status] || "bg-stone-100 text-stone-600"}`}>
        {status}
      </span>
    );
  }

  function Actions({ row }) {
    const busy = savingKey !== null;

    // Terminal states - no actions needed
    if (row.status === "DELIVERED" || row.status === "CANCELLED" || row.status === "REFUNDED") {
      return <span className="text-[12px] text-stone-400">—</span>;
    }

    // Check if the warehouse has already done its job
    const isWarehouseDone = 
      row.fulfillmentStatus === "READY_FOR_SHIPMENT" || 
      row.fulfillmentStatus === "SHIPPED" || 
      row.status === "SHIPPED";

    if (row.status === "PENDING") {
      return (
        <div className="flex justify-end gap-2">
          <button disabled={busy} onClick={() => changeStatus(row.orderId, "CONFIRMED")} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
            Approve
          </button>
          <button disabled={busy} onClick={() => changeStatus(row.orderId, "REJECTED")} className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">
            Reject
          </button>
        </div>
      );
    }

    // If CONFIRMED, but the warehouse hasn't finished yet
    if (row.status === "CONFIRMED" && !isWarehouseDone) {
      return (
        <div className="flex flex-col items-end gap-1">
          <span className="text-[11px] text-stone-500">Waiting for Warehouse...</span>
          <button disabled className="rounded-lg bg-stone-100 px-3 py-1.5 text-[12px] font-semibold text-stone-400 cursor-not-allowed border border-stone-200">
            Mark Shipped (Handled by Warehouse)
          </button>
        </div>
      );
    }

    // If the warehouse is done (or main status is SHIPPED), let the Vendor mark it Delivered
    if (isWarehouseDone) {
      return (
        <button disabled={busy} onClick={() => changeStatus(row.orderId, "DELIVERED")} className="rounded-lg bg-emerald-700 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
          Mark Delivered
        </button>
      );
    }

    // 🆕 FIXED: Vendor has read-only visibility for returns. Admin handles the refund.
    if (row.status === "RETURN_REQUESTED") {
      return (
        <div className="flex flex-col items-end gap-1">
          <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase ring-1 ring-amber-600/15 text-amber-700">
            Return Requested
          </span>
          <span className="text-[11px] text-stone-500">Admin will process refund</span>
        </div>
      );
    }

    return <span className="text-[12px] text-stone-400">—</span>;
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-stone-500">Loading orders...</div>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Sales</p>
        <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900">
          Incoming Orders
        </h1>
        <p className="mt-1.5 text-[14px] text-stone-500">Approve, ship and deliver customer orders.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Qty</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Coupon</th> 
                <th className="px-5 py-3">Warehouse Status</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((row, i) => (
                <tr key={i} className="hover:bg-stone-50/40">
                  <td className="px-5 py-4 font-semibold text-stone-900">#{row.orderId}</td>
                  <td className="px-5 py-4 text-stone-600">{row.customerName}</td>
                  <td className="px-5 py-4 text-stone-600">{row.productName}</td>
                  <td className="px-5 py-4 text-stone-600">{row.quantity}</td>
                  
                  <td className="px-5 py-4">
                    <span className="font-semibold text-stone-900">₹{row.subtotal}</span>
                    {(row.discountPercentage || 0) > 0 && (
                      <span className="ml-1.5 text-[12px] text-stone-400 line-through">
                        ₹{Number(row.originalPrice) * row.quantity}
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    {row.couponCode ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-600/15">
                        🎟️ {row.couponCode} (−₹{row.couponDiscount})
                      </span>
                    ) : (
                      <span className="text-[12px] text-stone-400">—</span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <WarehouseBadge status={row.fulfillmentStatus} />
                  </td>

                  <td className="px-5 py-4"><StatusBadge status={row.status} /></td>
                  <td className="px-5 py-4 text-right"><Actions row={row} /></td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-5 py-16 text-center text-stone-500">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}