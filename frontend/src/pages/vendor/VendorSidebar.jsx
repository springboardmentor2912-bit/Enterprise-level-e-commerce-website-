import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";

export default function VendorSidebar({ open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const linkStyle = ({ isActive }) =>
    `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-900/40"
        : "text-emerald-50/70 hover:bg-white/5 hover:text-white"
    }`;

  function handleLogout() {
    dispatch(logout());
    navigate("/login", { replace: true });
  }

  const iconWrap = "grid h-8 w-8 place-items-center rounded-lg transition-colors bg-white/5 text-emerald-200 group-hover:bg-white/10";

  return (
    <>
      <style>{`
        @keyframes vs-fade-in { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        .vs-fade-in { animation: vs-fade-in .4s cubic-bezier(.22, 1, .36, 1) both; }
      `}</style>

      <aside
        className={`
          fixed left-0 top-0 z-40 flex h-screen w-72 flex-col overflow-hidden bg-[#06231f] font-['Manrope',sans-serif] shadow-2xl shadow-emerald-950/40
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:w-64 lg:translate-x-0
        `}
      >
        {/* 🆕 MOBILE CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-5 right-4 z-50 grid h-9 w-9 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-[80px]" />
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
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-950/50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </span>
            <div>
              <h1 className="font-['Fraunces',serif] text-lg font-semibold tracking-tight text-white">
                ShopStack
              </h1>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200/70">
                Vendor Portal
              </p>
            </div>
          </div>

          {/* Active user chip */}
          <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 backdrop-blur-sm">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 text-[13px] font-bold text-emerald-950">
              V
            </span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-[13px] font-semibold text-white">Vendor Account</p>
              <p className="truncate text-[11px] text-emerald-200/60">Active seller</p>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
          </div>
        </div>

        {/* ===== NAV ===== */}
        <nav className="relative flex-1 overflow-y-auto px-3 py-5">
          <p className="px-3.5 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/50">
            Workspace
          </p>

          <div className="vs-fade-in space-y-1" style={{ animationDelay: "80ms" }}>
            <NavLink to="/vendor" end className={linkStyle} onClick={onClose}>
              <span className={iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                </svg>
              </span>
              <span className="text-[14px] font-medium">Dashboard</span>
            </NavLink>

            <NavLink to="/vendor/products" className={linkStyle} onClick={onClose}>
              <span className={iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </span>
              <span className="text-[14px] font-medium">My Products</span>
            </NavLink>

            <NavLink to="/vendor/products/add" className={linkStyle} onClick={onClose}>
              <span className={iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="text-[14px] font-medium">Add Product</span>
            </NavLink>
          </div>

          <p className="px-3.5 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/50">
            Operations
          </p>

          <div className="vs-fade-in space-y-1" style={{ animationDelay: "160ms" }}>
            <NavLink to="/vendor/orders" className={linkStyle} onClick={onClose}>
              <span className={iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138m-14.64 0h14.64M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </span>
              <span className="text-[14px] font-medium">Incoming Orders</span>
            </NavLink>

            <NavLink to="/vendor/inventory" className={linkStyle} onClick={onClose}>
              <span className={iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </span>
              <span className="text-[14px] font-medium">Inventory & Pricing</span>
            </NavLink>

            <NavLink to="/vendor/analytics" className={linkStyle} onClick={onClose}>
              <span className={iconWrap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </span>
              <span className="text-[14px] font-medium">Sales Analytics</span>
            </NavLink>
          </div>
        </nav>

        {/* ===== FOOTER ===== */}
        <div className="relative space-y-1 border-t border-white/10 p-3">
          <NavLink to="/profile" className={linkStyle} onClick={onClose}>
            <span className={iconWrap}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <span className="text-[14px] font-medium">Profile Settings</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-rose-300 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-200"
          >
            <span className={`${iconWrap} bg-rose-500/10 text-rose-300 group-hover:bg-rose-500/15`}>
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