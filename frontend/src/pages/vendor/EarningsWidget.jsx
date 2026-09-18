import { useEffect, useState } from "react";
import { getVendorEarnings } from "../../api/vendorApi";

export default function EarningsWidget() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getVendorEarnings()
      .then((res) => setData(res.data))
      .catch((e) => console.error(e));
  }, []);

  if (!data) return null;

  const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            Your Earnings
          </p>
          <h2 className="mt-1 font-['Fraunces',serif] text-2xl font-semibold text-stone-900">
            Financial Summary
          </h2>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-600/15">
          {data.commissionRate}% platform fee
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">
            Gross Sales
          </p>
          <p className="mt-1 font-['Fraunces',serif] text-xl font-semibold text-stone-900 tabular-nums">
            {fmt(data.grossSales)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-600">
            Platform Fee
          </p>
          <p className="mt-1 font-['Fraunces',serif] text-xl font-semibold text-rose-700 tabular-nums">
            −{fmt(data.totalCommission)}
          </p>
        </div>
        <div className="border-l border-stone-200 pl-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
            Net Earnings
          </p>
          <p className="mt-1 font-['Fraunces',serif] text-2xl font-bold text-emerald-700 tabular-nums">
            {fmt(data.netEarnings)}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[12px] text-stone-500">
        Across {data.totalOrders} orders
      </p>
    </div>
  );
}