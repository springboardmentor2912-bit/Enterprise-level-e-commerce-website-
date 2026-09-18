import { useEffect, useState } from "react";
import api from "../../api/axios";


export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allocatingId, setAllocatingId] = useState(null);

  useEffect(() => { 
    loadOrders();
    loadWarehouses();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const res = await api.get("/admin/orders");
      setOrders(res.data || []);
    } catch (e) {
      console.error("Failed to load orders:", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadWarehouses() {
    try {
      const res = await api.get("/admin/warehouses");
      setWarehouses(res.data || []);
    } catch (e) {
      console.error("Failed to load warehouses:", e);
    }
  }

  async function handleAllocate(orderId, warehouseId) {
    if (!warehouseId) {
      alert("Please select a warehouse first");
      return;
    }
    
    setAllocatingId(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/allocate?warehouseId=${warehouseId}`);
      alert("Order allocated to warehouse successfully!");
      loadOrders();
    } catch (e) {
      alert("Allocation failed: " + (e.response?.data?.message || e.message));
    } finally {
      setAllocatingId(null);
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-amber-50 text-amber-700 ring-amber-600/15",
      CONFIRMED: "bg-blue-50 text-blue-700 ring-blue-600/15",
      SHIPPED: "bg-indigo-50 text-indigo-700 ring-indigo-600/15",
      DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
      CANCELLED: "bg-rose-50 text-rose-700 ring-rose-600/15",
      REFUNDED: "bg-stone-100 text-stone-700 ring-stone-600/15",
    };
    
    const dotColors = {
      PENDING: "bg-amber-500",
      CONFIRMED: "bg-blue-500",
      SHIPPED: "bg-indigo-500",
      DELIVERED: "bg-emerald-500",
      CANCELLED: "bg-rose-500",
      REFUNDED: "bg-stone-500",
    };

    const defaultStyle = "bg-stone-100 text-stone-700 ring-stone-600/10";
    const defaultDot = "bg-stone-500";

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ring-1 ${styles[status] || defaultStyle}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dotColors[status] || defaultDot}`} />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
          <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-[14px] font-medium text-stone-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-['Manrope',sans-serif]">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Operations</p>
        <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Order Management
        </h1>
        <p className="mt-1.5 text-[15px] text-stone-500">
          Allocate pending orders to warehouses and monitor fulfillment status.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/80 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Products</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Warehouse</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((order) => (
                <tr key={order.id} className="group transition-colors hover:bg-stone-50/60">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-stone-900">#{order.id}</p>
                    <p className="mt-0.5 text-[12px] text-stone-500">
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {order.items && order.items.length > 0 ? (
                        <>
                          {order.items.slice(0, 2).map((item, idx) => (
                            <span key={idx} className="text-[13px] font-medium text-stone-800 line-clamp-1" title={item.productName}>
                              {item.productName} <span className="text-stone-400 tabular-nums">× {item.quantity}</span>
                            </span>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-[12px] text-stone-500 italic">+ {order.items.length - 2} more</span>
                          )}
                        </>
                      ) : (
                        <span className="text-[13px] text-stone-400">No items</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-stone-900">{order.customerName || "Unknown"}</p>
                    {order.customerEmail && (
                      <p className="mt-0.5 text-[12px] text-stone-500">{order.customerEmail}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-stone-900 tabular-nums">
                      ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4">
                    {order.warehouse ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.003 3.003 0 003.75-.611A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.003 3.003 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.355 2.25h15.29L21.85 6.514a3.002 3.002 0 01-.591 4.718" />
                        </svg>
                        {order.warehouse.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[12px] font-semibold text-amber-700 ring-1 ring-amber-600/15">
                        Pending Allocation
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {order.status === "PENDING" && !order.warehouse ? (
                      <div className="flex flex-col items-end gap-2">
                        <select 
                          id={`warehouse-${order.id}`}
                          defaultValue=""
                          className="w-40 rounded-lg border border-stone-200 bg-white px-3 py-2 text-[13px] font-medium text-stone-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        >
                          <option value="" disabled>Select Warehouse...</option>
                          {warehouses.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => {
                            const select = document.getElementById(`warehouse-${order.id}`);
                            handleAllocate(order.id, select.value);
                          }}
                          disabled={allocatingId === order.id}
                          className="inline-flex w-40 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-indigo-300"
                        >
                          {allocatingId === order.id ? (
                            "Allocating..."
                          ) : (
                            <>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Allocate
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-stone-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-stone-100 text-stone-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                      </span>
                      <h3 className="font-['Fraunces',serif] text-xl font-semibold text-stone-900">No orders found</h3>
                      <p className="mt-1.5 text-[14px] text-stone-500">
                        New orders will appear here once customers start purchasing.
                      </p>
                    </div>
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