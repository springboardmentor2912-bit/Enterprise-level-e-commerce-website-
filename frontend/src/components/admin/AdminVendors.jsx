import { useEffect, useMemo, useState } from "react";
import { FaSearch, FaStore } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import "./Admin.css";

function vendorName(vendor) { return vendor.displayName || vendor.username || vendor.name || "Unnamed vendor"; }
function initials(name) { return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?"; }

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorOrders, setVendorOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("https://shopstack-backend-gjv6.onrender.com/api/admin/vendors", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => { if (!res.ok) throw new Error(await res.text()); return res.json(); })
      .then(setVendors)
      .catch((err) => setError(err.message || "Unable to load vendors."))
      .finally(() => setLoading(false));
  }, []);

  const filteredVendors = useMemo(() => {
    const search = query.trim().toLowerCase();
    return vendors.filter((vendor) => !search || [vendor.displayName, vendor.username, vendor.name].filter(Boolean).join(" ").toLowerCase().includes(search));
  }, [vendors, query]);

  async function openVendorOrders(vendor) {
    setSelectedVendor(vendor);
    setOrdersLoading(true);
    try {
      const response = await fetch(`https://shopstack-backend-gjv6.onrender.com/api/admin/vendors/${vendor.id}/orders`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      if (!response.ok) throw new Error(await response.text() || "Unable to load vendor orders.");
      setVendorOrders(await response.json());
    } catch (ordersError) { setError(ordersError.message); setVendorOrders([]); } finally { setOrdersLoading(false); }
  }

  return <div className="admin-dashboard-container"><AdminSidebar /><main className="admin-main admin-vendors-main">
    <header className="vendors-page-heading"><div><span className="vendors-eyebrow">PARTNER NETWORK</span><h1>Vendors</h1><p>Keep track of the businesses powering your marketplace.</p></div><div className="vendors-heading-icon"><FaStore /></div></header>
    <section className="vendors-overview-strip"><div className="vendors-overview-icon"><FaStore /></div><div><span>VENDOR DIRECTORY</span><strong>{vendors.length} registered {vendors.length === 1 ? "vendor" : "vendors"}</strong></div><p>Review vendor profiles, contact information, and business locations.</p></section>
    <section className="vendors-panel"><div className="vendors-toolbar"><div><h2>All vendors</h2><span>{filteredVendors.length} {filteredVendors.length === 1 ? "result" : "results"}</span></div><label className="vendors-search"><FaSearch /><input aria-label="Search vendors by name" placeholder="Search by name" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
      {loading && <div className="vendors-empty"><div className="orders-spinner" /><span>Loading vendors...</span></div>}
      {error && <div className="vendors-empty vendors-error"><strong>Couldn't load vendors</strong><span>{error}</span></div>}
      {!loading && !error && filteredVendors.length === 0 && <div className="vendors-empty"><FaStore /><strong>No vendors found</strong><span>Try a different search.</span></div>}
      {!loading && !error && filteredVendors.length > 0 && <div className="vendors-table-wrap"><table className="vendors-table"><thead><tr><th>Vendor</th><th>Contact</th><th>Commission</th><th className="vendors-id-heading">ID</th></tr></thead><tbody>{filteredVendors.map((vendor) => { const name = vendorName(vendor); return <tr key={vendor.id} className="vendor-row-clickable" onClick={() => openVendorOrders(vendor)}><td><div className="vendor-cell"><span className="vendor-avatar">{initials(name)}</span><div><strong>{name}</strong><small>Marketplace partner · View orders</small></div></div></td><td><span className="vendor-email">{vendor.email || "No email available"}</span>{vendor.phone && <small className="vendor-secondary">{vendor.phone}</small>}</td><td onClick={(event) => event.stopPropagation()}><span className="vendor-commission-fixed" aria-label={`Commission for ${name}`}>10%</span></td><td className="vendor-id">#{vendor.id}</td></tr>; })}</tbody></table></div>}
    </section>
    {selectedVendor && <div className="vendor-orders-overlay" onClick={() => setSelectedVendor(null)}><section className="vendor-orders-modal" onClick={(event) => event.stopPropagation()}><button type="button" className="vendor-orders-close" onClick={() => setSelectedVendor(null)}>×</button><span className="vendors-eyebrow">VENDOR PERFORMANCE</span><h2>{vendorName(selectedVendor)} · Order overview</h2>{ordersLoading ? <div className="vendors-empty"><div className="orders-spinner" /><span>Loading orders...</span></div> : <><div className="vendor-order-metrics"><div><strong>{vendorOrders.length}</strong><small>Total orders</small></div><div><strong>{new Set(vendorOrders.map((order) => order.orderReference)).size}</strong><small>Customer orders</small></div><div><strong>₹{vendorOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0).toLocaleString("en-IN")}</strong><small>Order value</small></div></div>{vendorOrders.length === 0 ? <div className="vendors-empty"><strong>No orders yet</strong><span>This vendor has not received any orders.</span></div> : <div className="vendor-orders-table-wrap"><table className="vendor-orders-table"><thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Status</th><th>Value</th></tr></thead><tbody>{vendorOrders.map((order) => <tr key={order.id}><td><strong>{order.orderReference || `#${order.id}`}</strong><small>{order.placedAt ? new Date(order.placedAt).toLocaleDateString("en-IN") : ""}</small></td><td>{order.customerName || "Guest customer"}<small>{order.customerEmail}</small></td><td>{order.productName}<small>Qty {order.quantity}</small></td><td><span className={`status-badge status-${(order.orderStatus || "PROCESSING").toLowerCase()}`}>{(order.orderStatus || "PROCESSING").replaceAll("_", " ")}</span></td><td><strong>₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}</strong></td></tr>)}</tbody></table></div>}</>}</section></div>}
  </main></div>;
}
