import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import { useState } from "react";

export default function AdminSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const linkStyle = ({ isActive }) =>
    `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-900/40"
        : "text-emerald-50/70 hover:bg-white/5 hover:text-white"
    }`;

  function handleLogout() {
    dispatch(logout());
    navigate("/login", { replace: true });
  }

  const iconWrap = "grid h-8 w-8 place-items-center rounded-lg transition-colors bg-white/5 text-emerald-200 group-hover:bg-white/10";

  return (
    <>
      {/* 🆕 MOBILE TOP BAR (Sticky header with hamburger) */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur">
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
          className="grid h-10 w-10 place-items-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-sm transition hover:bg-stone-50 active:scale-95"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-sky-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </span>
          <span className="font-['Fraunces',serif] text-lg font-semibold tracking-tight text-stone-900">
            ShopStack Admin
          </span>
        </div>
      </div>

      {/* 🆕 MOBILE OVERLAY (Dark background when menu is open) */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <style>{`
        @keyframes as-fade-in { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        .as-fade-in { animation: as-fade-in .4s cubic-bezier(.22, 1, .36, 1) both; }
      `}</style>

      {/* 🆕 SIDEBAR WITH SLIDE ANIMATION */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-hidden bg-[#06231f] font-['Manrope',sans-serif] shadow-2xl shadow-emerald-950/40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* 🆕 MOBILE CLOSE BUTTON */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-5 right-4 z-50 grid h-9 w-9 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-sky-500/15 blur-[80px]" />
          <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-amber-400/10 blur-[80px]" />
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
        </div>

        {/* ===== HEADER ===== */}
        <div className="relative border-b border-white/10 p-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg shadow-sky-950/50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </span>
            <div>
              <h1 className="font-['Fraunces',serif] text-lg font-semibold tracking-tight text-white">
                ShopStack
              </h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sky-200/80">
                Admin Panel
              </p>
            </div>
          </div>

          {/* Admin identity chip */}
          <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-sky-400/20 bg-sky-400/[0.06] p-2.5 backdrop-blur-sm">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 text-[11px] font-bold text-white ring-1 ring-white/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-[13px] font-semibold text-white">System Admin</p>
              <p className="truncate text-[11px] text-sky-200/70">Full access</p>
            </div>
            <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]" />
          </div>
        </div>

        {/* ===== NAV ===== */}
        <nav className="relative flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3.5 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/50">
            Governance
          </p>

          <div className="as-fade-in space-y-1" style={{ animationDelay: "80ms" }}>
            <NavLink to="/admin" end className={linkStyle} onClick={() => setIsOpen(false)}>
              <span className={iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
              </span>
              <span className="text-[14px] font-medium">Dashboard</span>
            </NavLink>

            <NavLink to="/admin/approvals" className={linkStyle} onClick={() => setIsOpen(false)}>
              <span className={iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.59 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.59a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.59-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.59a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </span>
              <span className="text-[14px] font-medium">Product Approval</span>
            </NavLink>

            <NavLink to="/admin/products" className={linkStyle} onClick={() => setIsOpen(false)}>
              <span className={iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </span>
              <span className="text-[14px] font-medium">All Products</span>
            </NavLink>
          </div>

          <p className="px-3.5 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/50">
            Platform
          </p>

          <div className="as-fade-in space-y-1" style={{ animationDelay: "160ms" }}>
            <NavLink to="/admin/categories" className={linkStyle} onClick={() => setIsOpen(false)}>
              <span className={iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
              </span>
              <span className="text-[14px] font-medium">Categories</span>
            </NavLink>

            <NavLink to="/admin/users" className={linkStyle} onClick={() => setIsOpen(false)}>
              <span className={iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </span>
              <span className="text-[14px] font-medium">Users</span>
            </NavLink>

            <NavLink to="/admin/orders" className={linkStyle} onClick={() => setIsOpen(false)}>
              <span className={iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
              <span className="text-[14px] font-medium">Orders</span>
            </NavLink>

            <NavLink to="/admin/warehouses" className={linkStyle} onClick={() => setIsOpen(false)}>
              <span className={iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.558 0 1.014-.456 1.014-1.014v-3.972c0-.558-.456-1.014-1.014-1.014h-15.27C3.456 12.75 3 13.206 3 13.764v3.972C3 18.294 3.456 18.75 4.014 18.75h1.125M18 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.558 0 1.014-.456 1.014-1.014v-3.972c0-.558-.456-1.014-1.014-1.014h-15.27" />
                </svg>
              </span>
              <span className="text-[14px] font-medium">Warehouses</span>
            </NavLink>

            <NavLink to="/admin/returns" className={linkStyle} onClick={() => setIsOpen(false)}>
              <span className={iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
              </span>
              <span className="text-[14px] font-medium">Returns</span>
            </NavLink>
          </div>

          <div className="as-fade-in space-y-1" style={{ animationDelay: "240ms" }}>
            <NavLink to="/admin/coupons" className={linkStyle} onClick={() => setIsOpen(false)}>
              <span className={iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h2l.75-2.75M21 13h-2l-.75-2.75M12 3v10m0 0l-2.25-2.25M12 13l2.25-2.25M6.75 6.75l10.5 10.5"
                  />
                </svg>
              </span>
              <span className="text-[14px] font-medium">Coupons</span>
            </NavLink>
          </div>
        </nav>

        {/* ===== FOOTER ===== */}
        <div className="relative border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-rose-300 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-200"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-500/10 text-rose-300 group-hover:bg-rose-500/15">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}