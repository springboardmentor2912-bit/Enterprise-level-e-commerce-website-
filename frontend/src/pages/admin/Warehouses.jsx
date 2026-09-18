import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { loadWarehouses(); }, []);

  async function loadWarehouses() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/admin/warehouses");
      setWarehouses(res.data || []);
    } catch (e) {
      console.error("Failed to load warehouses:", e);
      setError(e.response?.data?.message || e.message || "Failed to load warehouses");
    } finally {
      setLoading(false);
    }
  }

  async function viewInventory(warehouse) {
    setSelectedWarehouse(warehouse);
    try {
      const res = await api.get(`/admin/warehouses/${warehouse.id}/inventory`);
      setInventory(res.data || []);
    } catch (e) {
      console.error("Failed to load inventory:", e);
      setInventory([]);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
          <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-[14px] font-medium text-stone-500">Loading warehouses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
        <p className="font-semibold text-rose-700">Error loading warehouses</p>
        <p className="mt-2 text-sm text-rose-600">{error}</p>
        <button 
          onClick={loadWarehouses}
          className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-['Manrope',sans-serif]">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Operations</p>
        <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Warehouse Management
        </h1>
        <p className="mt-1.5 text-[15px] text-stone-500">
          Monitor warehouse allocation, operations, and inventory levels.
        </p>
      </div>

      {/* Warehouse List */}
      {warehouses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-12 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-stone-100 text-stone-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.003 3.003 0 003.75-.611A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.003 3.003 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.355 2.25h15.29L21.85 6.514a3.002 3.002 0 01-.591 4.718" />
            </svg>
          </span>
          <p className="font-medium text-stone-900">No warehouses found</p>
          <p className="mt-1 text-sm text-stone-500">Add warehouses to your database to manage inventory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((w) => (
            <div 
              key={w.id} 
              onClick={() => viewInventory(w)}
              className={`group cursor-pointer rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                selectedWarehouse?.id === w.id 
                  ? "border-emerald-600 bg-emerald-50/50 shadow-md" 
                  : "border-stone-200 bg-white hover:border-emerald-300"
              }`}
            >
              <h3 className="font-['Fraunces',serif] text-xl font-semibold text-stone-900 group-hover:text-emerald-800">
                {w.name}
              </h3>
              <p className="mt-1 text-[13px] text-stone-500">
                {w.city}{w.state ? `, ${w.state}` : ''}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${w.active ? "bg-emerald-500" : "bg-rose-500"}`} />
                <span className="text-[12px] font-semibold uppercase tracking-wider text-stone-600">
                  {w.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inventory Details */}
      {selectedWarehouse && (
        <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]">
          <div className="border-b border-stone-200 bg-stone-50/80 p-5">
            <h2 className="font-['Fraunces',serif] text-xl font-semibold text-stone-900">
              Inventory at <span className="text-emerald-700">{selectedWarehouse.name}</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/50 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Total Stock</th>
                  <th className="px-6 py-4">Allocated (Reserved)</th>
                  <th className="px-6 py-4">Available to Sell</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {inventory.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-stone-500">
                      No inventory currently stored in this warehouse.
                    </td>
                  </tr>
                ) : (
                  inventory.map((inv) => {
                    const totalStock = inv.totalStock ?? inv.total_stock ?? 0;
                    const allocatedStock = inv.allocatedStock ?? inv.allocated_stock ?? 0;
                    const availableStock = totalStock - allocatedStock;
                    const productId = inv.product?.id ?? inv.product_id ?? inv.productId ?? 'N/A';
                    const productName = inv.product?.name ?? inv.product_name ?? `Product #${productId}`;

                    return (
                      <tr key={inv.id} className="transition-colors hover:bg-stone-50/60">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-stone-900">{productName}</p>
                          <p className="mt-0.5 text-[12px] text-stone-500">ID: {productId}</p>
                        </td>
                        <td className="px-6 py-4 font-medium text-stone-900 tabular-nums">{totalStock}</td>
                        <td className="px-6 py-4 font-semibold text-amber-700 tabular-nums">{allocatedStock}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-bold tabular-nums ring-1 ${
                            availableStock <= 5 
                              ? "bg-rose-50 text-rose-700 ring-rose-600/15" 
                              : "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
                          }`}>
                            {isNaN(availableStock) ? 0 : availableStock}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}