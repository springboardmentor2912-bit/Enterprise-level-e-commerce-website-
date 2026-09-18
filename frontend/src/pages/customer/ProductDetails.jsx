import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getProductById,
  addToCart,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../../api/customerApi";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      setLoading(true);
      const [prodRes, wishRes] = await Promise.all([
        getProductById(id),
        getWishlist(),
      ]);
      setProduct(prodRes.data);
      setInWishlist(
        (wishRes.data || []).some((w) => w.productId === Number(id))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToCart() {
    try {
      await addToCart(product.id);
      window.dispatchEvent(new Event("cart-updated"));
      alert("Added to cart successfully!");
    } catch (e) {
      console.error("Cart Error:", e);
      const status = e.response?.status || "Network";
      const msg = e.response?.data || e.message;
      alert(`❌ Cart Error (Status ${status})\n\nBackend says: ${msg}`);
    }
  }

  async function handleToggleWishlist() {
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
        setInWishlist(false);
      } else {
        await addToWishlist(product.id);
        setInWishlist(true);
      }
      window.dispatchEvent(new Event("cart-updated"));
    } catch (e) {
      console.error("Wishlist Error:", e);
      const status = e.response?.status || "Network";
      const msg = e.response?.data || e.message;
      alert(`❌ Wishlist Error (Status ${status})\n\nBackend says: ${msg}`);
    }
  }

  if (loading)
    return (
      // 🆕 Changed to bg-white
      <div className="flex min-h-[70vh] items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-[14px] font-medium text-stone-500">Loading product...</p>
        </div>
      </div>
    );

  if (!product)
    return (
      // 🆕 Changed to bg-white
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-6">
        <span className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </span>
        <h2 className="font-['Fraunces',serif] text-2xl font-semibold text-stone-900">
          Product not found
        </h2>
        <p className="mt-1 text-sm text-stone-500">This item may have been removed.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 rounded-xl bg-emerald-800 px-5 py-2.5 text-[14px] font-semibold text-white shadow-lg shadow-emerald-800/20 transition hover:bg-emerald-900"
        >
          Go back
        </button>
      </div>
    );

  const discount = product?.discountPercentage || 0;
  const finalPrice =
    discount > 0
      ? Math.round(Number(product.price) * (1 - discount / 100))
      : Number(product.price);

  return (
    // 🆕 Changed to bg-white
    <div className="min-h-screen bg-white font-['Manrope',sans-serif]">
      <style>{`
        @keyframes pd-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .pd-fade-up { animation: pd-fade-up .6s cubic-bezier(.22, 1, .36, 1) both; }
      `}</style>

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-10">
        {/* ===== BREADCRUMB ===== */}
        <nav
          aria-label="Breadcrumb"
          className="pd-fade-up mb-6 flex items-center gap-1.5 text-[13px] text-stone-500"
        >
          <Link to="/" className="transition hover:text-emerald-800">
            Home
          </Link>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5 text-stone-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
          {product.category && (
            <>
              <span className="capitalize text-stone-500">{product.category}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5 text-stone-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </>
          )}
          <span className="max-w-[12rem] truncate font-medium text-stone-800 sm:max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* ===== MAIN GRID ===== */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
          {/* ---------- IMAGE ---------- */}
          <div
            className="pd-fade-up relative overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-[0_24px_60px_-24px_rgba(6,35,31,0.22)]"
            style={{ animationDelay: "80ms" }}
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
              />
            </div>

            {product.category && (
              <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-stone-700 shadow-sm backdrop-blur">
                {product.category}
              </span>
            )}

            {discount > 0 && (
              <span className="absolute right-5 top-5 rounded-full bg-emerald-700 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-emerald-900/30">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* ---------- INFO ---------- */}
          <div
            className="pd-fade-up flex flex-col"
            style={{ animationDelay: "160ms" }}
          >
            <h1 className="font-['Fraunces',serif] text-3xl font-semibold leading-[1.1] tracking-tight text-stone-900 sm:text-4xl lg:text-[2.6rem]">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.003 3.003 0 003.75-.611A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.003 3.003 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.355 2.25h15.29L21.85 6.514a3.002 3.002 0 01-.591 4.718" />
                </svg>
              </span>
              <span className="text-stone-500">Sold by</span>
              <span className="font-semibold text-stone-800">
                {product.vendor}
              </span>
            </div>

            <div className="mt-7 flex flex-wrap items-baseline gap-3">
              <span className="font-['Fraunces',serif] text-5xl font-semibold tracking-tight text-emerald-800 tabular-nums">
                ₹{finalPrice}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-xl text-stone-400 line-through tabular-nums">
                    ₹{product.price}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.08em] text-emerald-700 ring-1 ring-emerald-600/15">
                    {discount}% OFF
                  </span>
                </>
              )}
              <span className="text-sm text-stone-400">incl. of all taxes</span>
            </div>

            {discount > 0 && (
              <p className="mt-2 text-[13px] font-semibold text-emerald-700">
                You save ₹{Number(product.price) - finalPrice} on this item!
              </p>
            )}

            <div className="mt-5 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  product.stock > 0
                    ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    : "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                }`}
              />
              <span
                className={`text-[13px] font-semibold ${
                  product.stock > 0 ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {product.stock > 0
                  ? `In Stock: ${product.stock} available`
                  : "Out of Stock"}
              </span>
            </div>

            <div className="mt-8 border-t border-stone-200 pt-6">
              <h2 className="text-[12px] font-bold uppercase tracking-[0.16em] text-stone-500">
                About this item
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-stone-600">
                {product.description}
              </p>
            </div>

            <div className="mt-auto pt-8">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-emerald-800/25 transition-all duration-200 hover:bg-emerald-900 hover:shadow-xl hover:shadow-emerald-900/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none disabled:hover:bg-stone-300"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138m-14.64 0h14.64M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  Add to Cart
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>

                <button
                  onClick={handleToggleWishlist}
                  className={`group flex items-center justify-center gap-2 rounded-xl border-2 px-6 py-3.5 text-[15px] font-semibold transition-all duration-200 active:scale-[0.99] ${
                    inWishlist
                      ? "border-rose-500 bg-rose-500 text-white hover:bg-rose-600"
                      : "border-stone-300 bg-white text-stone-700 hover:border-rose-500 hover:text-rose-600"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill={inWishlist ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  {inWishlist ? "Wishlisted" : "Wishlist"}
                </button>
              </div>

              <button
                onClick={() => navigate(-1)}
                className="mt-6 flex items-center gap-1.5 text-[13px] font-semibold text-stone-600 transition hover:text-emerald-800"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back
              </button>
            </div>
          </div>
        </div>

        {/* ===== TRUST STRIP ===== */}
        <div
          className="pd-fade-up mt-16 rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8"
          style={{ animationDelay: "240ms" }}
        >
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              {
                icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.558 0 1.014-.456 1.014-1.014v-3.972c0-.558-.456-1.014-1.014-1.014h-15.27C3.456 12.75 3 13.206 3 13.764v3.972C3 18.294 3.456 18.75 4.014 18.75h1.125M18 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.558 0 1.014-.456 1.014-1.014v-3.972c0-.558-.456-1.014-1.014-1.014h-15.27",
                label: "Free shipping",
                hint: "On orders over ₹499",
              },
              {
                icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
                label: "Secure checkout",
                hint: "256-bit SSL encryption",
              },
              {
                icon: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99",
                label: "Easy returns",
                hint: "7-day hassle-free",
              },
              {
                icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
                label: "24/7 support",
                hint: "We're always here",
              },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-start gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-stone-900">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[12px] text-stone-500">
                    {item.hint}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}