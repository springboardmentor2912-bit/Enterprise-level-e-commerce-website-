import { useEffect, useState } from "react";
import { getWishlist, addToCart, removeFromWishlist } from "../../api/customerApi";
import { Link } from "react-router-dom";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await getWishlist();
      setItems(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function notifyNavbar() {
    window.dispatchEvent(new Event("cart-updated"));
  }

  async function handleRemove(productId) {
    try {
      await removeFromWishlist(productId);
      load();
      notifyNavbar();
    } catch (e) {
      alert("Failed to remove from wishlist");
    }
  }

  async function handleMoveToCart(productId) {
    try {
      await addToCart(productId);
      await removeFromWishlist(productId);
      load();
      notifyNavbar();
    } catch (e) {
      alert("Failed to move to cart (check stock)");
    }
  }

  if (loading)
    return (
      // 🆕 Changed bg-[#f7f5f1] to bg-white
      <div className="flex min-h-[70vh] items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-[14px] font-medium text-stone-500">Loading wishlist...</p>
        </div>
      </div>
    );

  return (
    // 🆕 Changed bg-[#f7f5f1] to bg-white
    <div className="min-h-screen bg-white font-['Manrope',sans-serif]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-600">
            Saved for later
          </p>
          <h1 className="mt-2 font-['Fraunces',serif] text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            My Wishlist
          </h1>
          <p className="mt-2 text-[15px] text-stone-500">
            {items.length} {items.length === 1 ? "item" : "items"} you love
          </p>
        </div>

        {!loading && items.length === 0 ? (
          //  Changed bg-white/60 to bg-white for consistency
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-16 text-center">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </span>
            <h2 className="font-['Fraunces',serif] text-2xl font-semibold text-stone-900">Your wishlist is empty.</h2>
            <p className="mt-1.5 text-[14px] text-stone-500">
              Tap the heart on products you like to save them here.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-[14px] font-semibold text-white shadow-lg shadow-emerald-800/25 transition hover:bg-emerald-900"
            >
              Start browsing
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <article
                key={item.wishlistId}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.15)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(6,35,31,0.28)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {item.category && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-stone-700 shadow-sm backdrop-blur">
                      {item.category}
                    </span>
                  )}
                  <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
                      <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-2 font-['Fraunces',serif] text-[17px] font-semibold leading-snug tracking-tight text-stone-900">
                    {item.productName}
                  </h3>

                  <p className="mt-2 font-['Fraunces',serif] text-2xl font-semibold tracking-tight text-emerald-800 tabular-nums">
                    ₹{item.price}
                  </p>

                  <div className="mt-auto flex flex-col gap-2 pt-4">
                    <button
                      onClick={() => handleMoveToCart(item.productId)}
                      className="group/btn flex items-center justify-center gap-2 rounded-xl bg-emerald-800 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-emerald-800/20 transition-all hover:bg-emerald-900 active:scale-[0.98]"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138m-14.64 0h14.64M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                      </svg>
                      Move to Cart
                    </button>

                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white py-2 text-[13px] font-semibold text-stone-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.05.68-.099 1.022-.148m0 0a48.158 48.158 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}