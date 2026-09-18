import { useEffect, useState } from "react";
import { getVendorDashboard } from "../../api/vendorApi";

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await getVendorDashboard();
      setData(res.data || {});
    } catch (e) {
      console.error(e);
      setData({});
    }
  }

  if (!data)
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent" style={{ animation: "an-spin 0.9s linear infinite" }} />
          </div>
          <p className="text-[14px] font-medium text-stone-500">Loading analytics...</p>
        </div>
      </div>
    );

  const topProducts = data.topProducts || [];
  const maxSold = Math.max(...topProducts.map((t) => t.sold || 0), 1);
  const totalRevenue = Number(data.totalRevenue || 0);
  const approvalRate = data.totalProducts
    ? Math.round(
        (((data.totalProducts ?? 0) - (data.pendingProducts ?? 0)) /
          Math.max(data.totalProducts, 1)) *
          100
      )
    : 0;

  return (
    <div className="space-y-8">
      <style>{`
        @keyframes an-spin { to { transform: rotate(360deg); } }
        @keyframes an-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes an-grow { from { width: 0; } }
        .an-fade-up { animation: an-fade-up .5s cubic-bezier(.22, 1, .36, 1) both; }
        .an-grow { animation: an-grow 1.1s cubic-bezier(.22, 1, .36, 1) both; }
      `}</style>

      {/* ===== HEADER ===== */}
      <div className="an-fade-up">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
          Insights
        </p>
        <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Sales Analytics
        </h1>
        <p className="mt-1.5 text-[14px] text-stone-500">
          Performance overview of your store.
        </p>
      </div>

      {/* ===== KPI CARDS ===== */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi title="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} />
        <Kpi title="Items Sold" value={data.totalOrders ?? 0} />
        <Kpi title="Active Products" value={data.totalProducts ?? 0} />
        <Kpi title="Approval Rate" value={`${approvalRate}%`} />
      </div>

      {/* ===== PERFORMANCE SUMMARY STRIP (UI-only, derives from existing data) ===== */}
      <div
        className="an-fade-up grid grid-cols-1 gap-5 rounded-2xl border border-stone-200/80 bg-gradient-to-br from-white to-stone-50 p-5 sm:grid-cols-3 sm:p-6"
        style={{ animationDelay: "120ms" }}
      >
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
            Avg. order value
          </p>
          <p className="mt-1 font-['Fraunces',serif] text-xl font-semibold text-stone-900 tabular-nums">
            ₹{(data.totalOrders > 0 ? totalRevenue / data.totalOrders : 0).toFixed(0)}
          </p>
        </div>
        <div className="hidden border-l border-stone-200 pl-5 sm:block">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
            Top performer share
          </p>
          <p className="mt-1 font-['Fraunces',serif] text-xl font-semibold text-stone-900 tabular-nums">
            {topProducts[0]
              ? `${Math.round(((topProducts[0].sold || 0) / Math.max(data.totalOrders || 1, 1)) * 100)}%`
              : "—"}
          </p>
          <p className="text-[12px] text-stone-500">of total items sold</p>
        </div>
        <div className="hidden border-l border-stone-200 pl-5 sm:block">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500">
            Pending approvals
          </p>
          <p className="mt-1 font-['Fraunces',serif] text-xl font-semibold text-amber-700 tabular-nums">
            {data.pendingProducts ?? 0}
          </p>
        </div>
      </div>

      {/* ===== TOP SELLING PRODUCTS ===== */}
      <div
        className="an-fade-up overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]"
        style={{ animationDelay: "180ms" }}
      >
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50/70 p-5 sm:p-6">
          <div>
            <h2 className="font-['Fraunces',serif] text-xl font-semibold text-stone-900">
              Top Selling Products
            </h2>
            <p className="mt-0.5 text-[12px] text-stone-500">
              Your best-performing listings ranked by units sold
            </p>
          </div>
          <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-emerald-700 ring-1 ring-emerald-600/15 sm:inline-flex">
            Last 30 days
          </span>
        </div>

        <div className="p-5 sm:p-6">
          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-stone-100 text-stone-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </span>
              <p className="font-['Fraunces',serif] text-[15px] font-semibold text-stone-900">
                No sales data yet.
              </p>
              <p className="mt-0.5 text-[12px] text-stone-500">
                Your top products will appear here as orders come in.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {topProducts.map((t, idx) => (
                <div
                  key={t.productName}
                  className="group rounded-xl border border-stone-100 bg-white p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50/20 hover:shadow-sm"
                >
                  <div className="mb-2.5 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank badge */}
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[12px] font-bold ${
                          idx === 0
                            ? "bg-amber-100 text-amber-800 ring-1 ring-amber-600/20"
                            : idx === 1
                            ? "bg-stone-200 text-stone-700 ring-1 ring-stone-900/10"
                            : idx === 2
                            ? "bg-orange-100 text-orange-800 ring-1 ring-orange-600/20"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-['Fraunces',serif] text-[15px] font-semibold text-stone-900">
                          {t.productName}
                        </p>
                        <p className="mt-0.5 text-[11px] uppercase tracking-wider text-stone-500">
                          Product
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-['Fraunces',serif] text-[15px] font-semibold text-emerald-700 tabular-nums">
                        ₹{Number(t.revenue || 0).toLocaleString("en-IN")}
                      </p>
                      <p className="mt-0.5 text-[12px] text-stone-500">
                        <span className="font-semibold text-stone-700 tabular-nums">
                          {t.sold}
                        </span>{" "}
                        sold
                      </p>
                    </div>
                  </div>

                  {/* Bar track */}
                  <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="an-grow absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      style={{
                        width: `${((t.sold || 0) / maxSold) * 100}%`,
                        animationDelay: `${idx * 100 + 200}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value }) {
  // Internal icon mapping — preserves { title, value } signature at call sites
  const iconMap = {
    "Total Revenue": {
      icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      iconColor: "bg-emerald-50 text-emerald-700",
      accent: "from-emerald-500/20 to-transparent",
    },
    "Items Sold": {
      icon: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z",
      iconColor: "bg-sky-50 text-sky-700",
      accent: "from-sky-500/20 to-transparent",
    },
    "Active Products": {
      icon: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
      iconColor: "bg-violet-50 text-violet-700",
      accent: "from-violet-500/20 to-transparent",
    },
    "Approval Rate": {
      icon: "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.59 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.59a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.59-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.59a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
      iconColor: "bg-amber-50 text-amber-700",
      accent: "from-amber-500/20 to-transparent",
    },
  };

  const meta = iconMap[title] || {
    icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5",
    iconColor: "bg-stone-100 text-stone-700",
    accent: "from-stone-300/30 to-transparent",
  };

  return (
    <div className="an-fade-up relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-20px_rgba(6,35,31,0.22)]">
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
          <p className="mt-0.5 truncate font-['Fraunces',serif] text-2xl font-semibold tracking-tight text-stone-900 tabular-nums">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}