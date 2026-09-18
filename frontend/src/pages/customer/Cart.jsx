import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, updateCartQty, removeCartItem, clearCart } from "../../api/customerApi";

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCart(); }, []);

  async function loadCart() {
    try {
      const res = await getCart();
      const data = res.data || {};
      setItems(data.items || []);
      setTotalAmount(data.totalAmount || 0);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      console.error("Failed to load cart:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  const unitPrice = (item) => {
    const d = item.discountPercentage || 0;
    return d > 0 ? Math.round(item.price * (1 - d / 100)) : Number(item.price);
  };

  const originalTotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const finalTotal = items.reduce((s, i) => s + unitPrice(i) * i.quantity, 0);
  const savings = originalTotal - finalTotal;

  async function handleQtyChange(item, delta) {
    const newQty = item.quantity + delta;
    if (newQty < 1) return handleRemove(item.cartId);
    try {
      await updateCartQty(item.cartId, newQty);
      loadCart();
      window.dispatchEvent(new Event("cart-updated"));
    } catch (e) { alert("Failed to update quantity"); }
  }

  async function handleRemove(id) {
    try {
      await removeCartItem(id);
      loadCart();
      window.dispatchEvent(new Event("cart-updated"));
    } catch (e) { alert("Failed to remove item"); }
  }

  async function handleClear() {
    if (!window.confirm("Clear entire cart?")) return;
    try {
      await clearCart();
      loadCart();
      window.dispatchEvent(new Event("cart-updated"));
    } catch (e) { alert("Failed to clear cart"); }
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
          <p className="text-[14px] font-medium text-stone-500">Loading cart...</p>
        </div>
      </div>
    );

  return (
    // 🆕 Changed to bg-white
    <div className="min-h-screen bg-white font-['Manrope',sans-serif]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        {/* ===== HEADER ===== */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              Checkout
            </p>
            <h1 className="mt-2 font-['Fraunces',serif] text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
              Shopping Cart
            </h1>
            <p className="mt-2 text-[15px] text-stone-500">
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-rose-700 transition hover:bg-rose-50"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.05.68-.099 1.022-.148m0 0a48.158 48.158 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Clear Cart
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ===== ITEMS LIST ===== */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.15)]">
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                      <th className="p-4 text-left">Product</th>
                      <th className="p-4 text-left">Price</th>
                      <th className="p-4 text-left">Quantity</th>
                      <th className="p-4 text-left">Total</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.cartId} className="border-b border-stone-100 last:border-0 transition hover:bg-stone-50/40">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={item.imageUrl} alt={item.productName} className="h-14 w-14 rounded-lg object-cover ring-1 ring-stone-200" />
                            <span className="font-['Fraunces',serif] text-[15px] font-semibold text-stone-900">{item.productName}</span>
                          </div>
                        </td>

                        <td className="p-4 text-[14px] text-stone-600">
                          <span className="font-semibold text-stone-900">₹{unitPrice(item)}</span>
                          {(item.discountPercentage || 0) > 0 && (
                            <span className="ml-1.5 text-[12px] text-stone-400 line-through">₹{item.price}</span>
                          )}
                        </td>

                        <td className="p-4">
                          <div className="inline-flex items-center rounded-lg border border-stone-200 bg-stone-50">
                            <button
                              onClick={() => handleQtyChange(item, -1)}
                              className="grid h-8 w-8 place-items-center text-stone-600 transition hover:bg-stone-100"
                            >
                              −
                            </button>
                            <span className="w-10 text-center text-[14px] font-semibold text-stone-900 tabular-nums">{item.quantity}</span>
                            <button
                              onClick={() => handleQtyChange(item, 1)}
                              className="grid h-8 w-8 place-items-center text-stone-600 transition hover:bg-stone-100"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        <td className="p-4 font-['Fraunces',serif] text-[15px] font-semibold text-stone-900 tabular-nums">
                          ₹{unitPrice(item) * item.quantity}
                        </td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleRemove(item.cartId)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-rose-600 transition hover:bg-rose-50"
                            aria-label="Remove"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.05.68-.099 1.022-.148m0 0a48.158 48.158 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-16 text-center">
                          <div className="flex flex-col items-center">
                            <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-stone-100 text-stone-400">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                              </svg>
                            </span>
                            <p className="font-['Fraunces',serif] text-xl font-semibold text-stone-900">Your cart is empty.</p>
                            <p className="mt-1 text-sm text-stone-500">Browse our products and add something you love.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile card stack */}
              <div className="divide-y divide-stone-100 md:hidden">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center p-12 text-center">
                    <p className="font-['Fraunces',serif] text-xl font-semibold text-stone-900">Your cart is empty.</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.cartId} className="flex gap-4 p-4">
                      <img src={item.imageUrl} alt={item.productName} className="h-24 w-24 shrink-0 rounded-xl object-cover ring-1 ring-stone-200" />
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <h3 className="font-['Fraunces',serif] text-[15px] font-semibold text-stone-900 leading-snug">
                            {item.productName}
                          </h3>
                          <button onClick={() => handleRemove(item.cartId)} className="shrink-0 text-rose-600" aria-label="Remove">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.05.68-.099 1.022-.148m0 0a48.158 48.158 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                        <p className="mt-1 text-[13px] text-stone-500">
                          ₹{unitPrice(item)} each
                          {(item.discountPercentage || 0) > 0 && (
                            <span className="ml-1.5 text-stone-400 line-through">₹{item.price}</span>
                          )}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-lg border border-stone-200 bg-stone-50">
                            <button onClick={() => handleQtyChange(item, -1)} className="grid h-8 w-8 place-items-center text-stone-600">−</button>
                            <span className="w-10 text-center text-[14px] font-semibold tabular-nums">{item.quantity}</span>
                            <button onClick={() => handleQtyChange(item, 1)} className="grid h-8 w-8 place-items-center text-stone-600">+</button>
                          </div>
                          <p className="font-['Fraunces',serif] text-lg font-semibold text-stone-900 tabular-nums">
                            ₹{unitPrice(item) * item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ===== ORDER SUMMARY ===== */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.15)]">
              <div className="border-b border-stone-200 bg-stone-50/70 p-5">
                <h2 className="font-['Fraunces',serif] text-xl font-semibold text-stone-900">
                  Order Summary
                </h2>
              </div>

              <div className="p-5">
                <div className="flex justify-between py-2 text-[14px] text-stone-600">
                  <span>Total items</span>
                  <span className="font-semibold text-stone-900 tabular-nums">{totalItems}</span>
                </div>

                <div className="flex justify-between py-2 text-[14px] text-stone-600">
                  <span>Subtotal</span>
                  <span className={`font-semibold tabular-nums ${savings > 0 ? "text-stone-400 line-through" : "text-stone-900"}`}>
                    ₹{originalTotal}
                  </span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between py-2 text-[14px] font-semibold text-emerald-700">
                    <span>Discount savings</span>
                    <span className="tabular-nums">−₹{savings}</span>
                  </div>
                )}

                <div className="flex justify-between py-2 text-[14px] text-stone-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-700">Free</span>
                </div>

                <div className="my-4 h-px w-full bg-stone-200" />

                <div className="flex items-baseline justify-between py-2">
                  <span className="text-[14px] font-semibold text-stone-700">Total</span>
                  <span className="font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 tabular-nums">
                    ₹{finalTotal}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  disabled={items.length === 0}
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-emerald-800/25 transition-all duration-200 hover:bg-emerald-900 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
                >
                  Proceed to Checkout
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 transition-transform group-hover:translate-x-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Secure 256-bit SSL checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}