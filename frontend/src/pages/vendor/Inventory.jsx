import { useEffect, useState } from "react";
import { getVendorProducts, updateStock, updateDiscount } from "../../api/vendorApi";

export default function VendorInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const res = await getVendorProducts();
      setProducts(res.data || []);
    } catch (e) {
      console.error("Failed to load inventory:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleStockUpdate(productId, currentStock) {
    const newStock = prompt(`Update stock for this product:`, currentStock);
    if (newStock !== null && !isNaN(newStock) && parseInt(newStock) >= 0) {
      try {
        await updateStock(productId, parseInt(newStock));
        alert("Stock updated successfully!");
        load();
      } catch (e) {
        alert(e.response?.data?.message || "Failed to update stock.");
      }
    } else if (newStock !== null) {
      alert("Please enter a valid number.");
    }
  }

  async function handleDiscountUpdate(productId, currentDiscount) {
    const newDiscount = prompt(`Update discount percentage (0-100):`, currentDiscount || 0);
    if (newDiscount !== null && !isNaN(newDiscount)) {
      const discountVal = parseInt(newDiscount);
      if (discountVal >= 0 && discountVal <= 100) {
        try {
          await updateDiscount(productId, discountVal);
          alert("Discount updated successfully!");
          load();
        } catch (e) {
          alert(e.response?.data?.message || "Failed to update discount.");
        }
      } else {
        alert("Discount must be between 0 and 100.");
      }
    }
  }

  if (loading) return <div className="p-10 text-center text-stone-500">Loading inventory...</div>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Catalog</p>
        <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900">My Inventory</h1>
        <p className="mt-1.5 text-[14px] text-stone-500">Manage your product stock levels and active discounts.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                <th className="px-5 py-3">Product Name</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Discount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/40">
                  <td className="px-5 py-4 font-semibold text-stone-900">{p.name}</td>
                  <td className="px-5 py-4 text-stone-600 tabular-nums">₹{p.price}</td>
                  <td className="px-5 py-4 text-stone-600 tabular-nums">{p.stock}</td>
                  <td className="px-5 py-4 text-stone-600 tabular-nums">
                    {p.discountPercentage > 0 ? (
                      <span className="font-semibold text-amber-700">{p.discountPercentage}%</span>
                    ) : (
                      <span className="text-stone-400">None</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ring-1 ${
                      p.stock > 0 ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15" : "bg-rose-50 text-rose-700 ring-rose-600/15"
                    }`}>
                      {p.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleStockUpdate(p.id, p.stock)}
                        className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-stone-700 transition hover:bg-stone-50"
                      >
                        Update Stock
                      </button>
                      <button 
                        onClick={() => handleDiscountUpdate(p.id, p.discountPercentage)}
                        className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-amber-700 transition hover:bg-amber-50"
                      >
                        Update Discount
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-stone-500">No products in inventory.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}