import { useEffect, useMemo, useState } from "react";
import { FaChartLine, FaEnvelope, FaPhone, FaStore, FaTimes, FaUser } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import "./Admin.css";

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const displayName = (user) => user.displayName || user.name || user.username || "Unnamed user";
const normalizedEmail = (value) => (value || "").trim().toLowerCase();

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [activeReport, setActiveReport] = useState("");
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch("https://shopstack-backend-gjv6.onrender.com/api/admin/summary", { headers }),
      fetch("https://shopstack-backend-gjv6.onrender.com/api/admin/users", { headers }),
      fetch("https://shopstack-backend-gjv6.onrender.com/api/admin/vendors", { headers }),
      fetch("https://shopstack-backend-gjv6.onrender.com/api/admin/orders", { headers }),
    ])
      .then(async (responses) => {
        for (const response of responses) if (!response.ok) throw new Error(await response.text() || "Unable to load reports.");
        return Promise.all(responses.map((response) => response.json()));
      })
      .then(([summary, userItems, vendorItems, orderItems]) => {
        setData(summary);
        setCustomers((userItems || []).filter((user) => user.role === "CUSTOMER"));
        setVendors(vendorItems || []);
        setOrders(orderItems || []);
      })
      .catch((requestError) => setError(requestError.message || "Unable to load reports."))
      .finally(() => setLoading(false));
  }, []);

  const customerRows = useMemo(() => customers.map((customer) => ({
    ...customer,
    orderCount: orders.filter((order) => normalizedEmail(order.customerEmail) === normalizedEmail(customer.email)).length,
  })), [customers, orders]);

  function orderDate(order) {
    return order.placedAt ? new Date(order.placedAt).getTime() : 0;
  }

  function sortOrders(items) {
    return [...items].sort((left, right) => orderDate(right) - orderDate(left));
  }

  async function openCustomer(customer) {
    setSelected({ type: "customer", user: customer });
    setSelectedOrders([]);
    setLoadingDetails(true);
    try {
      const response = await fetch("https://shopstack-backend-gjv6.onrender.com/api/admin/orders", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      if (!response.ok) throw new Error(await response.text() || "Unable to load customer orders.");
      const customerEmail = normalizedEmail(customer.email);
      const customerOrders = (await response.json()).filter((order) => normalizedEmail(order.customerEmail) === customerEmail);
      setSelectedOrders(sortOrders(customerOrders));
    } catch (requestError) {
      setError(requestError.message || "Unable to load customer orders.");
    } finally {
      setLoadingDetails(false);
    }
  }

  async function openVendor(vendor) {
    setSelected({ type: "vendor", user: vendor });
    setSelectedOrders([]);
    setLoadingDetails(true);
    try {
      const response = await fetch(`https://shopstack-backend-gjv6.onrender.com/api/admin/vendors/${vendor.id}/orders`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      if (!response.ok) throw new Error(await response.text() || "Unable to load vendor orders.");
      setSelectedOrders(sortOrders(await response.json()));
    } catch (requestError) {
      setError(requestError.message || "Unable to load vendor orders.");
    } finally {
      setLoadingDetails(false);
    }
  }

  function closeDetails() {
    setSelected(null);
    setSelectedOrders([]);
  }

  const activeOrders = orders.filter((order) => !["REFUNDED", "CANCELLED"].includes(order.orderStatus));
  const activeSelectedOrders = selectedOrders.filter((order) => !["REFUNDED", "CANCELLED"].includes(order.orderStatus));
  const vendorRevenue = activeSelectedOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const vendorCommission = activeSelectedOrders.reduce((sum, order) => sum + Number(order.commissionAmount || 0), 0);
  const refundedOrders = orders.filter((order) => order.orderStatus === "REFUNDED" || order.refundStatus === "APPROVED");
  const commissionByProduct = Object.values(activeOrders.reduce((items, order) => {
    const key = order.productName || "Product";
    const current = items[key] || { productName: key, orders: 0, sales: 0, commission: 0 };
    current.orders += 1;
    current.sales += Number(order.totalAmount || 0);
    current.commission += Number(order.commissionAmount || 0);
    items[key] = current;
    return items;
  }, {}));

    return <div className="admin-dashboard-container"><AdminSidebar /><main className="admin-main admin-reports-main">
    <header className="reports-page-heading"><div><span className="reports-eyebrow">BUSINESS INTELLIGENCE</span><h1>Reports</h1><p>Open a customer or vendor to inspect their account activity.</p></div><div className="reports-heading-icon"><FaChartLine /></div></header>
    {loading && <div className="admin-loading">Loading reports...</div>}
    {error && <div className="admin-error">Error: {error}</div>}
    {!loading && !error && data && <>
      <div className="reports-action-grid"><button type="button" className="reports-action-card refunds-action" onClick={() => setActiveReport("refunds")}><span>↩</span><div><b>View refunds</b><small>{refundedOrders.length} refunded {refundedOrders.length === 1 ? "product" : "products"}</small></div><strong>{money(refundedOrders.reduce((sum, order) => sum + Number(order.customerTotalAmount || order.totalAmount || 0), 0))}</strong></button><button type="button" className="reports-action-card commission-action" onClick={() => setActiveReport("commission")}><span>₹</span><div><b>Commission revenue</b><small>View commission earned per product</small></div><strong>{money(data.commissionRevenue)}</strong></button></div>
      <div className="reports-directory-grid">
        <section className="reports-directory-panel"><div className="reports-panel-heading"><div><span className="reports-eyebrow">CUSTOMER DIRECTORY</span><h2>Customers</h2></div><strong>{customerRows.length}</strong></div>{customerRows.length === 0 ? <p className="reports-empty">No customers found.</p> : <div className="reports-list">{customerRows.map((customer) => <button type="button" className="reports-list-row" key={customer.id} onClick={() => openCustomer(customer)}><span className="reports-avatar customer-avatar"><FaUser /></span><span><b>{displayName(customer)}</b><small>{customer.email}</small></span><em>{customer.orderCount} {customer.orderCount === 1 ? "order" : "orders"} →</em></button>)}</div>}</section>
        <section className="reports-directory-panel"><div className="reports-panel-heading"><div><span className="reports-eyebrow">VENDOR DIRECTORY</span><h2>Vendors</h2></div><strong>{vendors.length}</strong></div>{vendors.length === 0 ? <p className="reports-empty">No vendors found.</p> : <div className="reports-list">{vendors.map((vendor) => <button type="button" className="reports-list-row" key={vendor.id} onClick={() => openVendor(vendor)}><span className="reports-avatar vendor-avatar"><FaStore /></span><span><b>{displayName(vendor)}</b><small>{vendor.email}</small></span><em>{Number(vendor.commissionPercentage || 0)}% commission →</em></button>)}</div>}</section>
      </div>
    </>}
    {activeReport && <div className="reports-detail-overlay" onClick={() => setActiveReport("")}><section className="reports-detail-modal" onClick={(event) => event.stopPropagation()}><button type="button" className="reports-detail-close" onClick={() => setActiveReport("")}><FaTimes /></button><span className="reports-eyebrow">{activeReport === "refunds" ? "REFUND REPORT" : "COMMISSION REPORT"}</span><h2>{activeReport === "refunds" ? "Refunded products" : "Commission by product"}</h2>{activeReport === "refunds" ? (refundedOrders.length === 0 ? <p className="reports-empty">No refunded products found.</p> : <div className="reports-order-list">{refundedOrders.map((order) => <div className="reports-order-row" key={order.id}><div><b>{order.productName || "Product"}</b><small>{order.orderReference || `Order #${order.id}`} · Qty {order.quantity || 0}</small></div><span className="status-badge refund-history-approved">REFUNDED</span><strong>{money(order.customerTotalAmount || order.totalAmount)}</strong></div>)}</div>) : (commissionByProduct.length === 0 ? <p className="reports-empty">No commission records found.</p> : <div className="reports-order-list">{commissionByProduct.map((item) => <div className="reports-order-row" key={item.productName}><div><b>{item.productName}</b><small>{item.orders} {item.orders === 1 ? "order" : "orders"} · Sold product revenue {money(item.sales)}</small></div><strong>{money(item.commission)}</strong></div>)}</div>)}</section></div>}
    {selected && <div className="reports-detail-overlay" onClick={closeDetails}><section className="reports-detail-modal" onClick={(event) => event.stopPropagation()}><button type="button" className="reports-detail-close" onClick={closeDetails}><FaTimes /></button><span className="reports-eyebrow">{selected.type === "customer" ? "CUSTOMER DETAILS" : "VENDOR DETAILS"}</span><h2>{selected.type === "vendor" && selected.user.businessName ? selected.user.businessName : displayName(selected.user)}</h2><div className="reports-contact-grid"><span><FaEnvelope /> {selected.user.email || "No email"}</span><span><FaPhone /> {selected.type === "vendor" ? (selected.user.contactNumber || selected.user.phone || "No phone") : (selected.user.phone || "No phone")}</span><span><FaUser /> {selected.type === "customer" ? "Customer" : `${Number(selected.user.commissionPercentage || 0)}% commission`}</span><span><FaStore /> {selected.type === "vendor" ? (selected.user.businessAddress || selected.user.address || "Address not added") : (selected.user.address || "Address not added")}</span></div>{selected.type === "vendor" && selected.user.description && <p className="reports-vendor-description">{selected.user.description}</p>}{selected.type === "vendor" && <div className="reports-vendor-metrics"><div><small>Sold product revenue</small><strong>{money(vendorRevenue)}</strong></div><div><small>Commission earned</small><strong>{money(vendorCommission)}</strong></div><div><small>Total orders</small><strong>{selectedOrders.length}</strong></div></div>}<h3>{selected.type === "customer" ? "Past orders" : "Orders from sold products"}</h3>{loadingDetails ? <p className="reports-empty">Loading order history...</p> : selectedOrders.length === 0 ? <p className="reports-empty">No orders found.</p> : <div className="reports-order-list">{selectedOrders.map((order) => <div className="reports-order-row" key={order.id}><div><b>{order.productName || "Product"}</b><small>{order.orderReference || `Order #${order.id}`} · Qty {order.quantity || 0}</small></div><span className={`status-badge status-${(order.orderStatus || "PROCESSING").toLowerCase()}`}>{(order.orderStatus || "PROCESSING").replaceAll("_", " ")}</span><strong>{money(selected.type === "vendor" ? order.totalAmount : (order.customerTotalAmount || order.totalAmount))}</strong></div>)}</div>}</section></div>}
  </main></div>;
}
