import { useEffect, useState } from "react";
import {
  getPendingProducts,
  approveProduct,
  rejectProduct,
} from "../../api/adminApi";

export default function ProductApproval() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const response = await getPendingProducts();
      setProducts(response.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleApprove(id) {
    await approveProduct(id);
    loadProducts();
  }

  async function handleReject(id) {
    await rejectProduct(id);
    loadProducts();
  }

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes pa-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .pa-fade-up { animation: pa-fade-up .5s cubic-bezier(.22, 1, .36, 1) both; }
      `}</style>

      {/* ===== HEADER ===== */}
      <div className="pa-fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">
            Governance
          </p>
          <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Pending Product Approvals
          </h1>
          <p className="mt-1.5 text-[14px] text-stone-500">
            Review vendor submissions before they go live on the marketplace.
          </p>
        </div>

        {products.length > 0 && (
          <span className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] font-semibold text-amber-800">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            {products.length} awaiting review
          </span>
        )}
      </div>

      {/* ===== APPROVAL TABLE ===== */}
      <div
        className="pa-fade-up overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]"
        style={{ animationDelay: "100ms" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[14px] text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Vendor</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Status</th>
                <th className="w-56 px-5 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {products.map((product) => (
                <tr key={product.id} className="transition hover:bg-stone-50/40">
                  <td className="px-5 py-4">
                    <span className="font-['Fraunces',serif] text-[15px] font-semibold text-stone-900">
                      {product.name}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
                        {(product.vendor || "?").charAt(0).toUpperCase()}
                      </span>
                      <span className="text-stone-700">{product.vendor}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-600">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-['Fraunces',serif] text-[15px] font-semibold text-stone-900 tabular-nums">
                    ₹{product.price}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-amber-700 ring-1 ring-amber-600/15">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {product.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleApprove(product.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-[13px] font-semibold text-white shadow-sm shadow-emerald-800/20 transition-all hover:bg-emerald-800 active:scale-[0.98]"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(product.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-rose-700 transition-all hover:bg-rose-50 active:scale-[0.98]"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center">
                    <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.59 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.59a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.59-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.59a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                      </svg>
                    </span>
                    <p className="font-['Fraunces',serif] text-[15px] font-semibold text-stone-900">
                      No pending products.
                    </p>
                    <p className="mt-0.5 text-[12px] text-stone-500">
                      You're all caught up. New submissions will appear here.
                    </p>
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