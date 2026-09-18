import { useEffect, useState } from "react";
import {
  getAllProducts,
  enableProduct,
  disableProduct,
} from "../../api/adminApi";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const response = await getAllProducts();
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleEnable(id) {
    try {
      await enableProduct(id);
      loadProducts();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDisable(id) {
    try {
      await disableProduct(id);
      loadProducts();
    } catch (error) {
      console.error(error);
    }
  }

  const activeCount = products.filter((p) => p.active).length;
  const disabledCount = products.length - activeCount;

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes pr-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .pr-fade-up { animation: pr-fade-up .5s cubic-bezier(.22, 1, .36, 1) both; }
      `}</style>

      {/* ===== HEADER ===== */}
      <div className="pr-fade-up">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">
          Catalog Management
        </p>
        <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          All Products
        </h1>
        <p className="mt-1.5 text-[14px] text-stone-500">
          Manage marketplace products and visibility.
        </p>
      </div>

      {/* ===== VISIBILITY SUMMARY (UI-only, derived from products) ===== */}
      <div
        className="pr-fade-up grid grid-cols-3 gap-3 sm:gap-5"
        style={{ animationDelay: "60ms" }}
      >
        <div className="rounded-xl border border-stone-200/80 bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">Total</p>
          <p className="mt-1 font-['Fraunces',serif] text-2xl font-semibold text-stone-900 tabular-nums">
            {products.length}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200/80 bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">Active</p>
          <p className="mt-1 font-['Fraunces',serif] text-2xl font-semibold text-emerald-700 tabular-nums">
            {activeCount}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200/80 bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">Disabled</p>
          <p className="mt-1 font-['Fraunces',serif] text-2xl font-semibold text-rose-700 tabular-nums">
            {disabledCount}
          </p>
        </div>
      </div>

      {/* ===== PRODUCTS TABLE ===== */}
      <div
        className="pr-fade-up overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]"
        style={{ animationDelay: "120ms" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                <th className="px-5 py-3">Image</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Active</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {products.map((product) => (
                <tr key={product.id} className="transition hover:bg-stone-50/40">
                  {/* Image */}
                  <td className="px-5 py-4">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-14 w-14 rounded-lg object-cover ring-1 ring-stone-200"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-stone-100 text-[10px] font-semibold text-stone-400">
                        No Image
                      </div>
                    )}
                  </td>

                  {/* Name */}
                  <td className="px-5 py-4">
                    <span className="font-['Fraunces',serif] text-[15px] font-semibold text-stone-900 leading-snug">
                      {product.name}
                    </span>
                  </td>

                  {/* Vendor */}
                  <td className="px-5 py-4 text-stone-700">
                    {product.vendorName || product.vendor || "-"}
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-600">
                      {product.categoryName || product.category || "-"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-4 font-['Fraunces',serif] text-[15px] font-semibold text-stone-900 tabular-nums">
                    ₹{product.price}
                  </td>

                  {/* Stock */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          (product.stock ?? 0) <= 0
                            ? "bg-rose-500"
                            : (product.stock ?? 0) < 5
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />
                      <span className="text-stone-700 tabular-nums">
                        {product.stock ?? 0}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge status={product.status} />
                  </td>

                  {/* Active */}
                  <td className="px-5 py-4">
                    {product.active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-700 ring-1 ring-emerald-600/15">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-rose-700 ring-1 ring-rose-600/15">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        No
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4">
                    <div className="flex justify-end">
                      {product.active ? (
                        <button
                          onClick={() => handleDisable(product.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-rose-700 transition-all hover:bg-rose-50 active:scale-[0.98]"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          Disable
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnable(product.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm shadow-emerald-800/20 transition-all hover:bg-emerald-800 active:scale-[0.98]"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          Enable
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-5 py-16 text-center">
                    {loading ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative h-10 w-10">
                          <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
                          <div className="absolute inset-0 rounded-full border-4 border-sky-600 border-t-transparent" style={{ animation: "pr-spin 0.9s linear infinite" }} />
                        </div>
                        <p className="text-[14px] font-medium text-stone-500">Loading products...</p>
                      </div>
                    ) : (
                      <>
                        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-stone-100 text-stone-400">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                          </svg>
                        </span>
                        <p className="font-['Fraunces',serif] text-[15px] font-semibold text-stone-900">
                          No products found.
                        </p>
                        <p className="mt-0.5 text-[12px] text-stone-500">
                          Products will appear here once vendors submit them.
                        </p>
                      </>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes pr-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function StatusBadge({ status }) {
  const value = (status || "PENDING").toUpperCase();

  if (value === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-700 ring-1 ring-emerald-600/15">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Approved
      </span>
    );
  }

  if (value === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-rose-700 ring-1 ring-rose-600/15">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-amber-700 ring-1 ring-amber-600/15">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Pending
    </span>
  );
}