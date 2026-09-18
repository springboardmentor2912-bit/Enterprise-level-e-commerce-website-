import { useEffect, useState } from "react";
import { FaUndoAlt, FaWarehouse } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import "./Admin.css";

export default function StaffReturnedStock() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = () => fetch("https://shopstack-backend-gjv6.onrender.com/api/admin/refunds", { headers: { Authorization: `Bearer ${sessionStorage.getItem("token") || localStorage.getItem("token")}` } }).then((response) => response.ok ? response.json() : []).then((records) => setItems(records.filter((item) => item.refundStatus === "REFUNDED"))).catch(() => setItems([])).finally(() => setLoading(false));
    load(); const timer = setInterval(load, 5000); return () => clearInterval(timer);
  }, []);
  return <div className="admin-dashboard-container"><AdminSidebar /><main className="admin-main admin-warehouse-main staff-returned-stock-main"><header className="warehouse-heading"><div><span className="orders-eyebrow">WAREHOUSE INVENTORY</span><h1>Returned stock</h1><p>Inspect products returned by customers and kept separately from sellable stock.</p></div><div className="warehouse-heading-icon"><FaUndoAlt /></div></header><section className="warehouse-panel returned-stock-page-panel"><div className="warehouse-toolbar"><div><h2>Returned products</h2><span>{items.length} validated return{items.length === 1 ? "" : "s"} · Not available for customer purchase</span></div><FaWarehouse /></div>{loading ? <div className="orders-empty">Loading returned stock...</div> : items.length === 0 ? <div className="orders-empty"><strong>No returned stock yet</strong><span>Validated customer returns will appear here.</span></div> : <div className="returned-stock-list">{items.map((item) => <article key={item.id}><div><strong>{item.productName || "Product"}</strong><small>Order #{String(item.id).padStart(5, "0")} · {item.orderReference || "No reference"}</small></div><div><span>Cause of return</span><strong>{item.refundReason || "Not provided"}</strong><small>{item.refundDetails || "No additional details"}</small></div><div><span>Returned quantity</span><b>{item.quantity || 0} units</b></div><em>Not for sale</em></article>)}</div>}</section></main></div>;
}
