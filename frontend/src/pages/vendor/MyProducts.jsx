import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getVendorProducts } from "../../api/vendorApi";

export default function MyProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const response = await getVendorProducts();
      setProducts(response.data);
    } catch (err) {
      console.error(err);
    }
  }

  const getStatusStyle = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "APPROVED")
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dot:bg-emerald-500";
    if (s === "REJECTED")
      return "bg-rose-50 text-rose-700 ring-rose-600/15 dot:bg-rose-500";
    return "bg-amber-50 text-amber-700 ring-amber-600/15 dot:bg-amber-500";
  };

  return (
    <div>
      <style>{`
        @keyframes mp-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .mp-fade-up { animation: mp-fade-up .5s cubic-bezier(.22, 1, .36, 1) both; }
      `}</style>

      <div className="p-6 sm:p-8">
        {/* ===== HEADER ===== */}
        <div className="mp-fade-up mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              Catalog
            </p>
            <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              My Products
            </h1>
            <p className="mt-1.5 text-[14px] text-stone-500">
              {products.length} {products.length === 1 ? "product" : "products"} in your catalog
            </p>
          </div>

          <Link
            to="/vendor/products/add"
            className="group inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-[14px] font-semibold text-white shadow-lg shadow-emerald-800/25 transition-all hover:bg-emerald-900 active:scale-[0.99]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Product
          </Link>
        </div>

        {/* ===== STATUS BREAKDOWN (UI-only, derived from products) ===== */}
        <div
          className="mp-fade-up mb-6 grid grid-cols-3 gap-3 sm:gap-5"
          style={{ animationDelay: "60ms" }}
        >
          <div className="rounded-xl border border-stone-200/80 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">Approved</p>
            <p className="mt-1 font-['Fraunces',serif] text-2xl font-semibold text-emerald-700 tabular-nums">
              {products.filter((p) => (p.status || "").toUpperCase() === "APPROVED").length}
            </p>
          </div>
          <div className="rounded-xl border border-stone-200/80 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">Pending</p>
            <p className="mt-1 font-['Fraunces',serif] text-2xl font-semibold text-amber-700 tabular-nums">
              {products.filter((p) => {
                const s = (p.status || "").toUpperCase();
                return s !== "APPROVED" && s !== "REJECTED";
              }).length}
            </p>
          </div>
          <div className="rounded-xl border border-stone-200/80 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">Rejected</p>
            <p className="mt-1 font-['Fraunces',serif] text-2xl font-semibold text-rose-700 tabular-nums">
              {products.filter((p) => (p.status || "").toUpperCase() === "REJECTED").length}
            </p>
          </div>
        </div>

        {/* ===== PRODUCTS TABLE ===== */}
        <div
          className="mp-fade-up overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]"
          style={{ animationDelay: "120ms" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-[14px] text-left">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-left">Price</th>
                  <th className="px-5 py-3 text-left">Stock</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((product) => {
                  const style = getStatusStyle(product.status);
                  const dotColor =
                    (product.status || "").toUpperCase() === "APPROVED"
                      ? "bg-emerald-500"
                      : (product.status || "").toUpperCase() === "REJECTED"
                      ? "bg-rose-500"
                      : "bg-amber-500";

                  return (
                    <tr
                      key={product.id}
                      className="transition hover:bg-stone-50/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-stone-200"
                            />
                          )}
                          <span className="font-['Fraunces',serif] text-[15px] font-semibold text-stone-900 leading-snug">
                            {product.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-stone-600">
                        {product.category || "-"}
                      </td>

                      <td className="px-5 py-4 font-['Fraunces',serif] text-[15px] font-semibold text-stone-900 tabular-nums">
                        ₹{product.price}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              product.stock <= 0
                                ? "bg-rose-500"
                                : product.stock < 5
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                          />
                          <span className="text-stone-700 tabular-nums">
                            {product.stock}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ring-1 ${style}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {products.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-5 py-16 text-center">
                      <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-stone-100 text-stone-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                      </span>
                      <p className="font-['Fraunces',serif] text-[15px] font-semibold text-stone-900">
                        No products yet
                      </p>
                      <p className="mt-0.5 text-[12px] text-stone-500">
                        Your catalog will appear here after approval.
                      </p>
                      <Link
                        to="/vendor/products/add"
                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-emerald-900"
                      >
                        Add your first product
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}