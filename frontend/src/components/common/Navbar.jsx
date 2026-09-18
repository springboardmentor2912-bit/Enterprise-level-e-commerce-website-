/* ════════════════════════════════════════════════════════════
   FILE 1: Navbar.jsx
   ════════════════════════════════════════════════════════════ */

import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { logout } from "../../redux/authSlice";
import { getCart, getWishlist } from "../../api/customerApi";

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false); // UI-only: mobile menu

  useEffect(() => {
    loadCounts();
    window.addEventListener("cart-updated", loadCounts);
    return () => window.removeEventListener("cart-updated", loadCounts);
  }, []);

  async function loadCounts() {
    try {
      const [cart, wishlist] = await Promise.all([
        getCart(),
        getWishlist(),
      ]);
      const items = cart.data.items || cart.data || [];
      setCartCount(
        Array.isArray(items)
          ? items.reduce((sum, i) => sum + (i.quantity || 1), 0)
          : 0
      );
      setWishlistCount(
        Array.isArray(wishlist.data) ? wishlist.data.length : 0
      );
    } catch (e) {
      console.error(e);
    }
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <>
      {/* Scoped UI animations */}
      <style>{`
        @keyframes nv-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes nv-fade-in { from { opacity: 0; } to { opacity: 1; } }
        .nv-slide-in { animation: nv-slide-in .3s cubic-bezier(.22, 1, .36, 1) both; }
        .nv-fade-in { animation: nv-fade-in .25s ease-out both; }
      `}</style>

      <nav className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          {/* ===== LOGO ===== */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md shadow-emerald-900/20 transition-transform group-hover:scale-[1.03]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </span>
            <span className="font-['Fraunces',serif] text-xl font-semibold tracking-tight text-stone-900">
              ShopStack
            </span>
          </Link>

          {/* ===== DESKTOP LINKS ===== */}
          <div className="hidden items-center gap-1 md:flex">
            <Link
              to="/"
              className="rounded-lg px-3 py-2 text-[14px] font-medium text-stone-700 transition hover:bg-stone-100 hover:text-emerald-800"
            >
              Home
            </Link>

            <Link
              to="/wishlist"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[14px] font-medium text-stone-700 transition hover:bg-stone-100 hover:text-emerald-800"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              Wishlist
              {wishlistCount > 0 && (
                <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[14px] font-medium text-stone-700 transition hover:bg-stone-100 hover:text-emerald-800"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Cart
              {cartCount > 0 && (
                <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-emerald-700 px-1.5 text-[11px] font-bold text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              to="/orders"
              className="rounded-lg px-3 py-2 text-[14px] font-medium text-stone-700 transition hover:bg-stone-100 hover:text-emerald-800"
            >
              Orders
            </Link>

            <Link
              to="/profile"
              className="rounded-lg px-3 py-2 text-[14px] font-medium text-stone-700 transition hover:bg-stone-100 hover:text-emerald-800"
            >
              Profile
            </Link>
            <Link
              to="/addresses"
              className="rounded-lg px-3 py-2 text-[14px] font-medium text-stone-700 transition hover:bg-stone-100 hover:text-emerald-800"
            >
              Addresses
            </Link>

            <div className="mx-2 h-6 w-px bg-stone-200" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3.5 py-2 text-[14px] font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Logout
            </button>
          </div>

          {/* ===== MOBILE TRIGGERS (icons + hamburger) ===== */}
          <div className="flex items-center gap-1 md:hidden">
            <Link
              to="/wishlist"
              className="relative grid h-10 w-10 place-items-center rounded-lg text-stone-700 transition hover:bg-stone-100"
              aria-label="Wishlist"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative grid h-10 w-10 place-items-center rounded-lg text-stone-700 transition hover:bg-stone-100"
              aria-label="Cart"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-[20px] place-items-center rounded-full bg-emerald-700 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="ml-1 grid h-10 w-10 place-items-center rounded-lg text-stone-700 transition hover:bg-stone-100"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ===== MOBILE MENU ===== */}
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <div
              className="nv-fade-in fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel */}
            <div className="nv-slide-in fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col bg-white shadow-2xl md:hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                <span className="font-['Fraunces',serif] text-xl font-semibold text-stone-900">
                  Menu
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-lg text-stone-500 hover:bg-stone-100"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <div className="flex-1 overflow-y-auto px-3 py-3">
                {[
                  { to: "/", label: "Home", icon: "M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
                  { to: "/orders", label: "Orders", icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" },
                  { to: "/profile", label: "Profile", icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium text-stone-700 transition hover:bg-stone-100"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-stone-100 text-stone-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4.5 w-4.5 h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </span>
                    {item.label}
                  </Link>
                ))}

                <div className="my-3 h-px w-full bg-stone-200" />

                <Link
                  to="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium text-stone-700 transition hover:bg-stone-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-rose-50 text-rose-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </span>
                    Wishlist
                  </div>
                  {wishlistCount > 0 && (
                    <span className="grid h-6 min-w-[24px] place-items-center rounded-full bg-rose-500 px-2 text-[11px] font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium text-stone-700 transition hover:bg-stone-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </span>
                    Cart
                  </div>
                  {cartCount > 0 && (
                    <span className="grid h-6 min-w-[24px] place-items-center rounded-full bg-emerald-700 px-2 text-[11px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Footer logout */}
              <div className="border-t border-stone-200 p-3">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 py-3 text-[14px] font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </nav>
    </>
  );
}