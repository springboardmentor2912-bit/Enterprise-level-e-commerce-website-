import { useEffect, useState } from "react";
import { getAllReturns, updateReturnStatus, processRefund } from "../../api/returnApi";

export default function Returns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await getAllReturns();
      setReturns(res.data || []);
    } catch (e) { 
      console.error("Failed to load returns:", e); 
    } finally { 
      setLoading(false); 
    }
  }

  async function handleAction(id, action) {
    setProcessingId(id);
    try {
      if (action === "approve") {
        await updateReturnStatus(id, "APPROVED");
      } else if (action === "reject") {
        await updateReturnStatus(id, "REJECTED");
      } else if (action === "receive") {
        const restock = window.confirm("Is the returned item in good condition to be restocked?");
        await updateReturnStatus(id, "RECEIVED", restock);
      } else if (action === "refund") {
        if (window.confirm("Process the refund to the customer?")) {
          await processRefund(id);
        }
      }
      load();
    } catch (e) { 
      alert(e.response?.data?.message || "Action failed"); 
    } finally {
      setProcessingId(null);
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      REQUESTED: "bg-amber-50 text-amber-700 ring-amber-600/15",
      APPROVED: "bg-sky-50 text-sky-700 ring-sky-600/15",
      RECEIVED: "bg-purple-50 text-purple-700 ring-purple-600/15",
      REFUNDED: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
      REJECTED: "bg-rose-50 text-rose-700 ring-rose-600/15",
    };
    const dots = {
      REQUESTED: "bg-amber-500", APPROVED: "bg-sky-500", RECEIVED: "bg-purple-500",
      REFUNDED: "bg-emerald-500", REJECTED: "bg-rose-500",
    };
    const defaultStyle = "bg-stone-100 text-stone-700 ring-stone-600/10";
    const defaultDot = "bg-stone-500";

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ring-1 ${styles[status] || defaultStyle}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dots[status] || defaultDot}`} />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
          <div className="absolute inset-0 rounded-full border-4 border-rose-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-[14px] font-medium text-stone-500">Loading returns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-['Manrope',sans-serif]">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-700">Support</p>
        <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Return Requests
        </h1>
        <p className="mt-1.5 text-[15px] text-stone-500">
          Manage customer returns, inspect items, and process refunds.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_12px_32px_-12px_rgba(6,35,31,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/80 text-[11px] font-bold uppercase tracking-[0.12em] text-stone-500">
                <th className="px-6 py-4">Return ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Refund</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {returns.map((r) => (
                <tr key={r.id} className="group transition-colors hover:bg-stone-50/60">
                  <td className="px-6 py-4 font-semibold text-stone-900">#{r.id}</td>
                  <td className="px-6 py-4 font-medium text-stone-900">{r.customerName || "Unknown"}</td>
                  <td className="px-6 py-4 text-stone-600">{r.productName || "Unknown Product"}</td>
                  <td className="px-6 py-4 text-stone-600">#{r.orderId}</td>
                  <td className="px-6 py-4 max-w-[200px] truncate text-stone-600" title={r.reason}>
                    {r.reason}
                  </td>
                  <td className="px-6 py-4 font-semibold text-stone-900 tabular-nums">₹{r.refundAmount}</td>
                  <td className="px-6 py-4">{getStatusBadge(r.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {r.status === "REQUESTED" && (
                        <>
                          <button 
                            onClick={() => handleAction(r.id, "approve")} 
                            disabled={processingId === r.id}
                            className="rounded-lg bg-sky-600 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-sky-700 active:scale-[0.98] disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleAction(r.id, "reject")} 
                            disabled={processingId === r.id}
                            className="rounded-lg bg-rose-600 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-rose-700 active:scale-[0.98] disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {r.status === "APPROVED" && (
                        <button 
                          onClick={() => handleAction(r.id, "receive")}
                          disabled={processingId === r.id}
                          className="rounded-lg bg-purple-600 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-purple-700 active:scale-[0.98] disabled:opacity-50"
                        >
                          Mark Received
                        </button>
                      )}
                      {r.status === "RECEIVED" && (
                        <button 
                          onClick={() => handleAction(r.id, "refund")}
                          disabled={processingId === r.id}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
                        >
                          Process Refund
                        </button>
                      )}
                      {r.status === "REFUNDED" && (
                        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          Completed
                        </span>
                      )}
                      {r.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-rose-700">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          Rejected
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {returns.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-stone-100 text-stone-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                        </svg>
                      </span>
                      <h3 className="font-['Fraunces',serif] text-xl font-semibold text-stone-900">No return requests</h3>
                      <p className="mt-1.5 text-[14px] text-stone-500">Customer return requests will appear here.</p>
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