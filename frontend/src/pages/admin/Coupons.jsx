import { useEffect, useState } from "react";
import { getCoupons, createCoupon, toggleCoupon, deleteCoupon } from "../../api/adminApi";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  const [form, setForm] = useState({
    code: "", 
    discountType: "PERCENTAGE", 
    discountValue: "",
    minOrderAmount: "", 
    startDate: "", 
    expiryDate: "", 
    maxDiscount: "", 
    usageLimit: "", 
    description: "",
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try { 
      const res = await getCoupons(); 
      setCoupons(res.data || []); 
    } catch (e) { 
      console.error("Failed to load coupons:", e); 
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await createCoupon({
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        startDate: form.startDate || null,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiryDate: form.expiryDate || null,
      });
      setForm({ 
        code: "", discountType: "PERCENTAGE", discountValue: "", 
        minOrderAmount: "", startDate: "", expiryDate: "", 
        maxDiscount: "", usageLimit: "", description: "" 
      });
      setShowForm(false);
      load();
    } catch (e) { 
      alert(e.response?.data?.message || "Failed to create coupon"); 
    }
  }

  async function handleToggle(id) { 
    await toggleCoupon(id); 
    load(); 
  }
  
  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    await deleteCoupon(id); 
    load();
  }

  return (
    <div className="space-y-8 font-['Manrope',sans-serif]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">Promotions</p>
          <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
            Coupon Engine
          </h1>
          <p className="mt-1.5 text-[15px] text-stone-500">
            Create and manage discount codes for customers.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-sky-800 active:scale-[0.98]"
        >
          {showForm ? "Cancel" : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Coupon
            </>
          )}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          <input 
            value={form.code} 
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="Code (e.g. SAVE20)" 
            required 
            className="rounded-lg border border-stone-300 px-3 py-2.5 text-[14px] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" 
          />
          
          <select 
            value={form.discountType} 
            onChange={(e) => setForm({ ...form, discountType: e.target.value })}
            className="rounded-lg border border-stone-300 px-3 py-2.5 text-[14px] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FLAT">Flat (₹)</option>
          </select>
          
          <input 
            type="number" 
            value={form.discountValue} 
            onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
            placeholder="Value (20 = 20% or ₹20)" 
            required 
            className="rounded-lg border border-stone-300 px-3 py-2.5 text-[14px] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" 
          />
          
          <input 
            type="number" 
            value={form.minOrderAmount} 
            onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
            placeholder="Min order ₹ (optional)" 
            className="rounded-lg border border-stone-300 px-3 py-2.5 text-[14px] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" 
          />
          
          <input 
            type="date" 
            value={form.startDate} 
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            title="Start Date" 
            className="rounded-lg border border-stone-300 px-3 py-2.5 text-[14px] text-stone-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" 
          />
          <input 
            type="date" 
            value={form.expiryDate} 
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            title="Expiry Date" 
            className="rounded-lg border border-stone-300 px-3 py-2.5 text-[14px] text-stone-600 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" 
          />
          
          <input 
            type="number" 
            value={form.maxDiscount} 
            onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
            placeholder="Max Discount ₹ (Optional)" 
            className="rounded-lg border border-stone-300 px-3 py-2.5 text-[14px] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" 
          />
          
          <input 
            type="number" 
            value={form.usageLimit} 
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            placeholder="Usage limit (blank = ∞)" 
            className="rounded-lg border border-stone-300 px-3 py-2.5 text-[14px] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20" 
          />
          
          <input 
            value={form.description} 
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description (optional)" 
            className="rounded-lg border border-stone-300 px-3 py-2.5 text-[14px] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 lg:col-span-2" 
          />
          
          <button 
            type="submit" 
            className="rounded-lg bg-emerald-700 px-6 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.98] lg:col-span-4"
          >
            Create Coupon
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/80 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Min Order</th>
                <th className="px-6 py-4">Validity</th>
                <th className="px-6 py-4">Analytics & Usage</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {coupons.map((c) => (
                <tr key={c.id} className="group transition-colors hover:bg-stone-50/60">
                  <td className="px-6 py-4">
                    <span className="font-['Fraunces',serif] text-[15px] font-bold text-stone-900">🎟️ {c.code}</span>
                    {c.description && <p className="mt-0.5 text-[12px] text-stone-500">{c.description}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-emerald-700">
                      {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    </span>
                    {c.maxDiscount && c.discountType === "PERCENTAGE" && (
                      <span className="mt-0.5 block text-[11px] font-medium text-stone-500">Max: ₹{c.maxDiscount}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-stone-600 tabular-nums">₹{c.minOrderAmount || 0}</td>
                  <td className="px-6 py-4 text-[13px] text-stone-600">
                    {c.startDate ? new Date(c.startDate).toLocaleDateString() : "Always"}<br />
                    <span className="text-stone-400">to</span><br />
                    {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "Never"}
                  </td>
                  
                  <td className="px-6 py-4 tabular-nums">
                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] font-semibold text-stone-900">
                        {c.usedCount} / {c.usageLimit ?? "∞"} uses
                      </span>
                      <span className="text-[11px] font-medium text-emerald-700">
                        💰 ₹{c.totalDiscountProvided || 0} saved
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ring-1 ${
                      c.active ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15" : "bg-rose-50 text-rose-700 ring-rose-600/15"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${c.active ? "bg-emerald-500" : "bg-rose-500"}`} />
                      {c.active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleToggle(c.id)}
                        className="rounded-lg border border-stone-300 px-3 py-1.5 text-[12px] font-semibold text-stone-700 transition hover:bg-stone-50 active:scale-[0.98]"
                      >
                        {c.active ? "Disable" : "Enable"}
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-[12px] font-semibold text-rose-700 transition hover:bg-rose-50 active:scale-[0.98]"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-stone-100 text-stone-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                        </svg>
                      </span>
                      <h3 className="font-['Fraunces',serif] text-xl font-semibold text-stone-900">No coupons yet</h3>
                      <p className="mt-1.5 text-[14px] text-stone-500">Create your first promotional coupon above.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}