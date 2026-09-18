import { useEffect, useMemo, useState } from "react";
import { FaUndoAlt, FaClock, FaCheckCircle, FaTimesCircle, FaSearch } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import "./Admin.css";

const statusFor = (refund) => {
  if (refund.orderStatus === "REFUNDED" || refund.refundStatus === "REFUNDED") return "REFUNDED";
  const status = refund.refundStatus || (refund.orderStatus === "REFUNDED" ? "REFUNDED" : "REQUESTED");
  return status === "REQUESTED" ? "PENDING" : status === "APPROVED" ? "ACCEPTED" : status;
};
const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const decisionLabel = (refund) => refund.refundStatus === "REJECTED" ? "Rejected" : ["APPROVED", "ACCEPTED", "RECEIVED", "REFUNDED"].includes(refund.refundStatus) ? "Approved" : "Pending decision";

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    Promise.all([
      fetch("https://shopstack-backend-gjv6.onrender.com/api/admin/refunds", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("https://shopstack-backend-gjv6.onrender.com/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([refundResponse, orderResponse]) => {
        if (!refundResponse.ok) throw new Error(await refundResponse.text());
        if (!orderResponse.ok) throw new Error(await orderResponse.text());
        const savedRefunds = await refundResponse.json();
        const orders = await orderResponse.json();
        const historicalRefunds = (Array.isArray(orders) ? orders : []).filter((order) => order.orderStatus === "REFUNDED").map((order) => ({ ...order, refundStatus: "APPROVED" }));
        const history = new Map([...savedRefunds, ...historicalRefunds].map((item) => [item.orderReference || item.id, item]));
        return [...history.values()];
      })
      .then(setRefunds)
      .catch((err) => setError(err.message || "Unable to load return history."))
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => ({
    total: refunds.length,
    pending: refunds.filter((refund) => statusFor(refund) === "PENDING").length,
    approved: refunds.filter((refund) => statusFor(refund) === "APPROVED").length,
    rejected: refunds.filter((refund) => statusFor(refund) === "REJECTED").length,
  }), [refunds]);

  const visibleRefunds = useMemo(() => {
    const search = query.trim().toLowerCase();
    return refunds.filter((refund) => {
      const matchesSearch = !search || `${refund.orderReference || ""} ${refund.customerName || ""} ${refund.customerEmail || ""}`.toLowerCase().includes(search);
      return matchesSearch && (filter === "ALL" || statusFor(refund) === filter);
    });
  }, [refunds, query, filter]);

  async function decideRefund(orderReference, decision) {
    setSaving(`${orderReference}-${decision}`);
    try {
      const response = await fetch(`https://shopstack-backend-gjv6.onrender.com/api/admin/refunds/${encodeURIComponent(orderReference)}/decision`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` }, body: JSON.stringify({ decision }) });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message || "Unable to save refund decision.");
      const result = await response.json();
      setRefunds((items) => items.map((item) => item.orderReference === orderReference ? { ...item, refundStatus: result.refundStatus, orderStatus: decision === "APPROVE" ? "RETURN_ACCEPTED" : item.previousOrderStatus } : item));
    } catch (requestError) { setError(requestError.message); } finally { setSaving(""); }
  }

  return <div className="admin-dashboard-container"><AdminSidebar /><main className="admin-main admin-refunds-main">
    <header className="refunds-page-heading"><div><span className="refunds-eyebrow">CUSTOMER CARE</span><h1>Returns & Refunds</h1><p>Review customer return requests and keep every decision traceable.</p></div><div className="refunds-heading-icon"><FaUndoAlt /></div></header>
    <div className="refund-metrics"><div><span className="refund-metric-icon blue"><FaUndoAlt /></span><div><strong>{metrics.total}</strong><small>Total requests</small></div></div><div><span className="refund-metric-icon amber"><FaClock /></span><div><strong>{metrics.pending}</strong><small>Awaiting decision</small></div></div><div><span className="refund-metric-icon green"><FaCheckCircle /></span><div><strong>{metrics.approved}</strong><small>Refunded</small></div></div><div><span className="refund-metric-icon red"><FaTimesCircle /></span><div><strong>{metrics.rejected}</strong><small>Rejected</small></div></div></div>
    <section className="refunds-panel"><div className="refunds-toolbar"><div><h2>Return history</h2><span>{visibleRefunds.length} {visibleRefunds.length === 1 ? "record" : "records"}</span></div><div className="refunds-controls"><label className="refunds-search"><FaSearch /><input aria-label="Search returns" placeholder="Search order or customer" value={query} onChange={(event) => setQuery(event.target.value)} /></label><select aria-label="Filter return status" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="ALL">All statuses</option><option value="PENDING">Pending</option><option value="APPROVED">Refunded</option><option value="REJECTED">Rejected</option></select></div></div>
      {error && <div className="orders-alert">{error}</div>}{loading && <div className="refunds-empty"><div className="orders-spinner" /><span>Loading return history...</span></div>}{!loading && !error && visibleRefunds.length === 0 && <div className="refunds-empty"><FaUndoAlt /><strong>No return records found</strong><span>Try changing your search or status filter.</span></div>}{!loading && !error && visibleRefunds.length > 0 && <div className="refunds-table-wrap"><table className="refunds-table"><thead><tr><th>Order</th><th>Customer</th><th>Reason</th><th>Status</th><th>Amount</th><th>Action</th></tr></thead><tbody>{visibleRefunds.map((refund) => { const status = statusFor(refund); return <tr key={refund.id}><td><strong className="refund-order-id">{refund.orderReference || `#${refund.id}`}</strong><small>Order #{refund.id}</small></td><td><strong>{refund.customerName || "Guest customer"}</strong><small>{refund.customerEmail || "No email available"}</small></td><td><span>{refund.refundReason || "Not provided"}</span>{refund.refundDetails && <small>{refund.refundDetails}</small>}</td><td><span className={`status-badge refund-history-${status.toLowerCase()}`}>{status === "APPROVED" ? "REFUNDED" : status}</span><small>{refund.orderStatus === "REFUNDED" ? "Order refunded" : "Return request"}</small></td><td><strong>{formatCurrency(refund.totalAmount)}</strong></td><td>{status === "PENDING" ? <div className="refund-actions"><button className="refund-approve-btn" disabled={Boolean(saving)} onClick={() => decideRefund(refund.orderReference, "APPROVE")}>{saving === `${refund.orderReference}-APPROVE` ? "..." : "Approve"}</button><button className="refund-reject-btn" disabled={Boolean(saving)} onClick={() => decideRefund(refund.orderReference, "REJECT")}>{saving === `${refund.orderReference}-REJECT` ? "..." : "Reject"}</button></div> : <span className="refund-decision-saved">Decision saved</span>}</td></tr>; })}</tbody></table></div>}
    </section>
  </main></div>;
}
