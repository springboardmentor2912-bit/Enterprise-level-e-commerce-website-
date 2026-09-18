import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getVendorDashboard } from "../../api/vendorApi";
import EarningsWidget from "./EarningsWidget";

export default function VendorDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    pendingApprovals: 0,
  });
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const res = await getVendorDashboard();
      const d = res.data || {};

      setStats({
        totalRevenue: d.totalRevenue ?? 0,
        totalOrders: d.totalOrders ?? 0,
        activeProducts: d.totalProducts ?? d.activeProducts ?? 0,
        pendingApprovals: d.pendingProducts ?? d.pendingApprovals ?? 0,
      });
      setLowStock(d.lowStockProducts || []);
    } catch (e) {
      console.error("Dashboard load failed:", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent" style={{ animation: "vd-spin 0.9s linear infinite" }} />
          </div>
          <p className="text-[14px] font-medium text-stone-500">Loading dashboard...</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes vd-spin { to { transform: rotate(360deg); } }
        @keyframes vd-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .vd-fade-up { animation: vd-fade-up .5s cubic-bezier(.22, 1, .36, 1) both; }
      `}</style>

      {/* ===== HEADER ===== */}
      <div className="vd-fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            Overview
          </p>
          <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Vendor Dashboard
          </h1>
          <p className="mt-1.5 text-[14px] text-stone-500">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <Link
          to="/vendor/products/add"
          className="group inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-[14px] font-semibold text-white shadow-lg shadow-emerald-800/25 transition-all hover:bg-emerald-900 active:scale-[0.99]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New Product
        </Link>
      </div>

      <EarningsWidget />

      {/* ===== KPI STATS ===== */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`₹${Number(stats.totalRevenue).toLocaleString("en-IN")}`}
          icon="💰"
          color="bg-sky-50 text-sky-600"
          accent="from-sky-500/20 to-transparent"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon="📦"
          color="bg-violet-50 text-violet-600"
          accent="from-violet-500/20 to-transparent"
        />
        <StatCard
          title="Active Products"
          value={stats.activeProducts}
          icon="🏷️"
          color="bg-emerald-50 text-emerald-600"
          accent="from-emerald-500/20 to-transparent"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          icon="⏳"
          color="bg-amber-50 text-amber-600"
          accent="from-amber-500/20 to-transparent"
        />
      </div>

      {/* ===== WIDGETS ROW (No Recent Orders anymore) ===== */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Low Stock */}
        <div
          className="vd-fade-up overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50/70 p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-rose-600 ring-1 ring-rose-600/10">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </span>
              <h2 className="font-['Fraunces',serif] text-lg font-semibold text-stone-900">
                Low Stock Alerts
              </h2>
            </div>
            <Link
              to="/vendor/inventory"
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-rose-700 transition hover:text-rose-900 hover:underline"
            >
              Manage
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          <div className="space-y-3 p-5">
            {lowStock.map((item) => (
              <div
                key={item.productId ?? item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50/60 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-stone-900">
                    {item.productName ?? item.name}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-rose-600">
                    Only {item.stock} left!
                  </p>
                </div>
                <Link
                  to="/vendor/inventory"
                  className="shrink-0 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  Restock
                </Link>
              </div>
            ))}
            {lowStock.length === 0 && (
              <div className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500 text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <p className="text-[13px] font-medium text-emerald-800">
                  All products are well stocked.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Growth CTA */}
        <div
          className="vd-fade-up relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#06231f] via-emerald-900 to-emerald-800 p-6 text-white shadow-lg shadow-emerald-900/30"
          style={{ animationDelay: "180ms" }}
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/15 blur-[60px]" />
            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-[60px]" />
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
              Growth tips
            </span>

            <h2 className="mt-3 font-['Fraunces',serif] text-2xl font-semibold leading-tight tracking-tight">
              Grow Your Business
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-emerald-100/80">
              Keep your stock updated and prices competitive to rank higher in search results.
            </p>
          </div>

          <Link
            to="/vendor/inventory"
            className="relative mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-[13px] font-semibold text-emerald-900 transition hover:bg-stone-100"
          >
            Manage Inventory
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, accent = "from-stone-200/40" }) {
  return (
    <div className="vd-fade-up relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-20px_rgba(6,35,31,0.22)]">
      <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${accent} blur-2xl`} />

      <div className="relative flex items-center gap-3.5">
        <div className={`grid h-12 w-12 place-items-center rounded-xl ${color} text-2xl ring-1 ring-stone-900/5`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
            {title}
          </p>
          <p className="mt-0.5 truncate font-['Fraunces',serif] text-2xl font-semibold tracking-tight text-stone-900 tabular-nums">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}