import { useEffect, useState } from "react";
import CustomerSidebar from "./CustomerSidebar";
import "./ReturnsRefunds.css";

const normalStages = [
  ["REQUESTED", "Return requested"], ["ACCEPTED", "Return accepted"],
  ["RECEIVED", "Received by warehouse"], ["INSPECTED", "Product inspected"], ["REFUNDED", "Refund completed"]
];
const rejectedStages = [
  ["REQUESTED", "Return requested"], ["ACCEPTED", "Return accepted"],
  ["RECEIVED", "Received by warehouse"], ["INSPECTED", "Product inspected"],
  ["REJECTED", "Refund rejected"], ["RETURN_SHIPPED", "Sent to customer"], ["RETURN_DELIVERED", "Delivered to customer"]
];

export default function ReturnsRefunds() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = () => fetch("https://shopstack-backend-gjv6.onrender.com/api/customer/order-notifications", { headers: { Authorization: `Bearer ${sessionStorage.getItem("token") || localStorage.getItem("token")}` } })
      .then((response) => response.ok ? response.json() : [])
      .then((items) => setReturns(items.filter((item) => item.refundStatus && item.refundStatus !== "NONE")))
      .catch(() => setReturns([])).finally(() => setLoading(false));
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  const label = (status) => ({
    REQUESTED: "Return requested", PENDING: "Return requested", APPROVED: "Return accepted",
    ACCEPTED: "Return accepted", RECEIVED: "Received by warehouse", INSPECTED: "Product inspected",
    REFUNDED: "Refund completed", REJECTED: "Refund rejected", RETURN_SHIPPED: "Product sent back",
    RETURN_DELIVERED: "Delivered to customer"
  }[status] || status);

  return <div className="customer-returns-layout"><CustomerSidebar /><main className="customer-returns-page"><header><span>ORDER SUPPORT</span><h1>Returns & Refunds</h1><p>Track every step of your return and refund request.</p></header>{loading ? <div className="returns-empty">Loading return status...</div> : returns.length === 0 ? <div className="returns-empty"><strong>No return or refund requests</strong><span>Approved return activity will appear here.</span></div> : <div className="returns-list">{returns.map((item) => { const status = item.refundStatus === "PENDING" || item.refundStatus === "APPROVED" ? (item.refundStatus === "APPROVED" ? "ACCEPTED" : "REQUESTED") : item.refundStatus; const stages = ["REJECTED", "RETURN_SHIPPED", "RETURN_DELIVERED"].includes(status) ? rejectedStages : normalStages; const current = stages.findIndex(([key]) => key === status); return <article key={item.id}><div className="return-card-heading"><div><span>ORDER #{String(item.id).padStart(5, "0")}</span><h2>{item.productName || "Product"}</h2><p>Quantity: {item.quantity || 0} <em>•</em> {item.refundReason || "Return requested"}</p></div><b className={`customer-return-status status-${status.toLowerCase()}`}>{label(status)}</b></div><div className="customer-return-timeline">{stages.map(([key, text], index) => <div className={index <= current ? "done" : ""} key={key}><i>{index < current ? "✓" : index + 1}</i><span>{text}</span></div>)}</div>{status === "REJECTED" && <p className="return-note">Your refund was rejected after inspection. The product will now be sent back to you.</p>}{status === "RETURN_SHIPPED" && <p className="return-note return-note-info">Your product has been shipped back to you.</p>}{status === "RETURN_DELIVERED" && <p className="return-note return-note-success">The returned product was delivered back to you. No refund was issued.</p>}</article>; })}</div>}</main></div>;
}
