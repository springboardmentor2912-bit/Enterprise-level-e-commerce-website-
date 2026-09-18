import { useEffect, useState } from "react";
import { getWarehouseOrders } from "../../api/warehouseApi"; // Assume this fetches orders with items
import api from "../../api/axios";

export default function WarehouseOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try { 
      const res = await getWarehouseOrders(); 
      setOrders(res.data || []); 
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleAction(orderItemId, action) {
    setBusyId(orderItemId);
    try { 
      await api.post(`/warehouse/fulfillment/${orderItemId}/${action}`); 
      await load(); 
    } catch (e) { 
      alert(e.response?.data?.message || "Action failed"); 
    } finally { 
      setBusyId(null); 
    }
  }

  if (loading) return <div className="p-10 text-center text-stone-500">Loading assigned orders...</div>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">Fulfillment</p>
        <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900">Warehouse Operations</h1>
        <p className="mt-1.5 text-[14px] text-stone-500">Pick, pack, and prepare orders for shipment.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Qty</th>
                <th className="px-5 py-3">Fulfillment Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.flatMap(o => o.items.map(item => ({ ...item, orderId: o.orderId, orderDate: o.orderDate }))).map((item, idx) => (
                <tr key={`${item.orderId}-${idx}`} className="hover:bg-stone-50/40">
                  <td className="px-5 py-4 font-semibold text-stone-900">#{item.orderId}</td>
                  <td className="px-5 py-4 text-stone-600">{item.productName}</td>
                  <td className="px-5 py-4 text-stone-600">{item.quantity}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={item.fulfillmentStatus} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {item.fulfillmentStatus === "ALLOCATED" && (
                        <button disabled={busyId === item.id} onClick={() => handleAction(item.id, "pick")}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                          Pick
                        </button>
                      )}
                      {item.fulfillmentStatus === "PICKED" && (
                        <button disabled={busyId === item.id} onClick={() => handleAction(item.id, "pack")}
                          className="rounded-lg bg-amber-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-amber-700 disabled:opacity-50">
                          Pack
                        </button>
                      )}
                      {item.fulfillmentStatus === "PACKED" && (
                        <button disabled={busyId === item.id} onClick={() => handleAction(item.id, "ready")}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                          Ready for Shipment
                        </button>
                      )}
                      {item.fulfillmentStatus === "READY_FOR_SHIPMENT" && (
                        <span className="text-[12px] font-semibold text-emerald-700">✅ Shipped</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan="5" className="px-5 py-16 text-center text-stone-500">No orders assigned to your warehouse.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    ALLOCATED: "bg-blue-50 text-blue-700 ring-blue-600/15",
    PICKED: "bg-amber-50 text-amber-700 ring-amber-600/15",
    PACKED: "bg-purple-50 text-purple-700 ring-purple-600/15",
    READY_FOR_SHIPMENT: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ring-1 ${styles[status] || "bg-stone-100"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}