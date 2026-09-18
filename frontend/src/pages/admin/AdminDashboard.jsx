import { useEffect, useState } from "react";
import { getDashboard } from "../../api/adminApi";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const response = await getDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
            <div className="absolute inset-0 rounded-full border-4 border-sky-600 border-t-transparent" style={{ animation: "ad-spin 0.9s linear infinite" }} />
          </div>
          <p className="text-[14px] font-medium text-stone-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-5">
        <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-lg">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </span>
          <h2 className="font-['Fraunces',serif] text-xl font-semibold text-stone-900">
            Unable to load dashboard data.
          </h2>
          <p className="mt-2 text-[14px] text-stone-500">
            Please check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: "Users",
      value: dashboard.totalUsers ?? 0,
    },
    {
      title: "Customers",
      value: dashboard.totalCustomers ?? 0,
    },
    {
      title: "Vendors",
      value: dashboard.totalVendors ?? 0,
    },
    {
      title: "Products",
      value: dashboard.totalProducts ?? 0,
    },
    {
      title: "Pending Products",
      value: dashboard.pendingProducts ?? 0,
    },
    {
      title: "Approved Products",
      value: dashboard.approvedProducts ?? 0,
    },
    {
      title: "Orders",
      value: dashboard.totalOrders ?? 0,
    },
    {
      title: "Revenue",
      value: formatCurrency(dashboard.totalRevenue),
    },
  ];

  const pendingCount = dashboard.pendingProducts ?? 0;

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes ad-spin { to { transform: rotate(360deg); } }
        @keyframes ad-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .ad-fade-up { animation: ad-fade-up .5s cubic-bezier(.22, 1, .36, 1) both; }
      `}</style>

      {/* ===== HEADER ===== */}
      <div className="ad-fade-up">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">
          Control Center
        </p>
        <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Admin Dashboard
        </h1>
        <p className="mt-1.5 text-[14px] text-stone-500">
          Marketplace overview and key metrics.
        </p>
      </div>

      {/* ===== PENDING REVIEW BANNER (UI-only, derived from dashboard.pendingProducts) ===== */}
      {pendingCount > 0 && (
        <div
          className="ad-fade-up relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5"
          style={{ animationDelay: "80ms" }}
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-200/40 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-600/15">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </span>
              <div>
                <p className="font-['Fraunces',serif] text-[17px] font-semibold text-stone-900">
                  {pendingCount} product{pendingCount === 1 ? "" : "s"} awaiting review
                </p>
                <p className="text-[13px] text-stone-600">
                  Vendors are waiting — approve or reject them to keep the catalog fresh.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== KPI GRID ===== */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, idx) => (
          <Card
            key={card.title}
            title={card.title}
            value={card.value}
            delay={idx * 60}
          />
        ))}
      </div>

      {/* ===== HEALTH STRIP (UI-only, derived from existing data) ===== */}
      <div
        className="ad-fade-up grid grid-cols-1 gap-5 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)] sm:grid-cols-3 sm:p-6"
        style={{ animationDelay: "480ms" }}
      >
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
            Approval Rate
          </p>
          <p className="mt-1 font-['Fraunces',serif] text-xl font-semibold text-emerald-700 tabular-nums">
            {dashboard.totalProducts > 0
              ? `${Math.round(
                  ((dashboard.approvedProducts ?? 0) /
                    Math.max(dashboard.totalProducts, 1)) *
                    100
                )}%`
              : "—"}
          </p>
          <p className="text-[12px] text-stone-500">of all products</p>
        </div>
        <div className="border-t border-stone-200 pt-5 sm:border-l sm:border-t-0 sm:pt-0 sm:pl-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
            Avg. Revenue / Order
          </p>
          <p className="mt-1 font-['Fraunces',serif] text-xl font-semibold text-stone-900 tabular-nums">
            {dashboard.totalOrders > 0
              ? `₹${Math.round(
                  (dashboard.totalRevenue || 0) /
                    Math.max(dashboard.totalOrders, 1)
                ).toLocaleString("en-IN")}`
              : "—"}
          </p>
          <p className="text-[12px] text-stone-500">across {dashboard.totalOrders ?? 0} orders</p>
        </div>
        <div className="border-t border-stone-200 pt-5 sm:border-l sm:border-t-0 sm:pt-0 sm:pl-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
            Vendor:Customer ratio
          </p>
          <p className="mt-1 font-['Fraunces',serif] text-xl font-semibold text-stone-900 tabular-nums">
            1 : {dashboard.totalVendors > 0
              ? Math.round((dashboard.totalCustomers ?? 0) / Math.max(dashboard.totalVendors, 1))
              : "—"}
          </p>
          <p className="text-[12px] text-stone-500">customers per vendor</p>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, delay = 0 }) {
  // Internal meta map — preserves { title, value } signature at call sites
  const metaMap = {
    Users: {
      icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
      iconColor: "bg-slate-50 text-slate-700",
      accent: "from-slate-400/25 to-transparent",
      valueColor: "text-stone-900",
    },
    Customers: {
      icon: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
      iconColor: "bg-sky-50 text-sky-700",
      accent: "from-sky-400/25 to-transparent",
      valueColor: "text-sky-700",
    },
    Vendors: {
      icon: "M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.003 3.003 0 003.75-.611A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.003 3.003 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.355 2.25h15.29L21.85 6.514a3.002 3.002 0 01-.591 4.718",
      iconColor: "bg-emerald-50 text-emerald-700",
      accent: "from-emerald-400/25 to-transparent",
      valueColor: "text-emerald-700",
    },
    Products: {
      icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
      iconColor: "bg-violet-50 text-violet-700",
      accent: "from-violet-400/25 to-transparent",
      valueColor: "text-violet-700",
    },
    "Pending Products": {
      icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
      iconColor: "bg-amber-50 text-amber-700",
      accent: "from-amber-400/30 to-transparent",
      valueColor: "text-amber-700",
    },
    "Approved Products": {
      icon: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.59 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.59a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.59-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.59a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
      iconColor: "bg-emerald-50 text-emerald-700",
      accent: "from-emerald-400/25 to-transparent",
      valueColor: "text-emerald-700",
    },
    Orders: {
      icon: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138m-14.64 0h14.64M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z",
      iconColor: "bg-rose-50 text-rose-700",
      accent: "from-rose-400/25 to-transparent",
      valueColor: "text-rose-700",
    },
    Revenue: {
      icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v7.5c0 .621.504 1.125 1.125 1.125h3.75c.621 0 1.125-.504 1.125-1.125V4.5m-6 0h6m3.75 13.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM12 4.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
      iconColor: "bg-emerald-50 text-emerald-700",
      accent: "from-emerald-400/30 to-transparent",
      valueColor: "text-emerald-700",
    },
  };

  const meta = metaMap[title] || {
    icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25",
    iconColor: "bg-stone-100 text-stone-700",
    accent: "from-stone-300/30 to-transparent",
    valueColor: "text-stone-900",
  };

  return (
    <div
      className="ad-fade-up relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-20px_rgba(6,35,31,0.22)]"
      style={{ animationDelay: `${120 + delay}ms` }}
    >
      <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${meta.accent} blur-2xl`} />

      <div className="relative flex items-center gap-3.5">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${meta.iconColor} ring-1 ring-stone-900/5`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d={meta.icon} />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
            {title}
          </p>
          <p className={`mt-0.5 truncate font-['Fraunces',serif] text-2xl font-semibold tracking-tight tabular-nums ${meta.valueColor}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}