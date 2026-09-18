import React, { useEffect, useMemo, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import "./Admin.css";
import "./AdminOrdersPricing.css";

const statuses = ["ALL", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "REFUND_REQUESTED", "REFUNDED", "CANCELLED"];

function formatStatus(status) {
  return (status || "PROCESSING").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getOrderValue(order) {
  const storedTotal = Number(order?.totalAmount);
  if (Number.isFinite(storedTotal) && storedTotal > 0) return storedTotal;
  return Number(order?.unitPrice || 0) * Number(order?.quantity || 0);
}

function saveOrderStatus(order, status) {
  const statuses = JSON.parse(localStorage.getItem("shopstack-order-statuses") || "{}");
  statuses[order.orderReference || order.id] = status;
  localStorage.setItem("shopstack-order-statuses", JSON.stringify(statuses));
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [statusDraft, setStatusDraft] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCommissionDetails, setShowCommissionDetails] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  useEffect(() => {
    if (!selectedOrder) return undefined;
    const grid = document.querySelector(".order-detail-modal .order-detail-grid");
    if (!grid) return undefined;
    const original = Number(selectedOrder.totalAmount || 0);
    const customerTotal = Number(selectedOrder.customerTotalAmount || selectedOrder.totalAmount || 0);
    const couponDiscount = Math.max(0, original - customerTotal);
    const commission = Number(selectedOrder.commissionAmount || 0);
    const pricing = document.createElement("div");
    pricing.className = "order-detail-pricing";
    pricing.innerHTML = `<div><span>Original price</span><strong>${formatCurrency(original)}</strong></div><div><span>Coupon discount</span><strong class="coupon-pricing">−${formatCurrency(couponDiscount)}</strong></div><div><span>Commission (${Number(selectedOrder.commissionPercentage || 0).toLocaleString("en-IN")}%)</span><strong class="commission-deduction">−${formatCurrency(commission)}</strong></div><div class="order-detail-price-total"><span>Final price</span><strong>${formatCurrency(customerTotal)}</strong></div>`;
    grid.parentElement.insertBefore(pricing, grid);
    return () => pricing.remove();
  }, [selectedOrder]);

  useEffect(() => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) {
      setError("Please sign in again.");
      setLoading(false);
      return;
    }

    fetch("https://shopstack-backend-gjv6.onrender.com/api/admin/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) throw new Error("Your session has expired. Please sign in again.");
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((items) => {
        setOrders(Array.isArray(items) ? items : []);
        (items || []).forEach((order) => saveOrderStatus(order, order.orderStatus || "PROCESSING"));
      })
      .catch((err) => setError(err.message || "Unable to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const visibleOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "ALL" || order.orderStatus === statusFilter;
      return matchesStatus;
    });
  }, [orders, statusFilter]);


  const metrics = useMemo(() => ({
    total: orders.length,
    active: orders.filter((order) => !["DELIVERED", "REFUNDED", "CANCELLED"].includes(order.orderStatus)).length,
    delivered: orders.filter((order) => order.orderStatus === "DELIVERED").length,
    revenue: orders.reduce((sum, order) => sum + getOrderValue(order), 0),
  }), [orders]);

  /* Delivery status changes are handled in Warehouse fulfillment. */
  async function updateStatus(order, nextStatus) {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }
    setSavingId(order.id);
    try {
      const response = await fetch(`https://shopstack-backend-gjv6.onrender.com/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (response.status === 401 || response.status === 403) throw new Error("Your session has expired. Please sign in again.");
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || `Unable to update order status (${response.status})`);
      }
      const updatedOrder = await response.json();
      saveOrderStatus(order, updatedOrder.orderStatus);
      setOrders((items) => items.map((item) => item.id === order.id ? { ...item, orderStatus: updatedOrder.orderStatus } : item));
    } catch (requestError) {
      setError(requestError.message || "Unable to update order status.");
    } finally {
      setSavingId(null);
    }
  }

  async function approveRefund(order) {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    setSavingId(order.id);
    try {
      const response = await fetch(`https://shopstack-backend-gjv6.onrender.com/api/admin/refunds/${encodeURIComponent(order.orderReference)}/decision`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ decision: "APPROVE" }),
      });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message || "Unable to approve refund.");
      setOrders((items) => items.map((item) => item.orderReference === order.orderReference
        ? { ...item, orderStatus: "REFUNDED", refundStatus: "APPROVED", totalAmount: item.totalAmount }
        : item));
      saveOrderStatus(order, "REFUNDED");
      setSelectedOrder((item) => item && item.orderReference === order.orderReference
        ? { ...item, orderStatus: "REFUNDED", refundStatus: "APPROVED", totalAmount: item.totalAmount }
        : item);
    } catch (requestError) {
      setError(requestError.message || "Unable to approve refund.");
    } finally {
      setSavingId(null);
    }
  }

  async function markAllDelivered() {
    if (!window.confirm("Mark every active order as delivered? This will update customer tracking and revenue.")) return;
    setBulkSaving(true);
    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const response = await fetch("https://shopstack-backend-gjv6.onrender.com/api/admin/orders/mark-all-delivered", { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error("Unable to mark orders as delivered.");
      const updated = await response.json();
      setOrders(items => items.map(order => order.orderStatus === "REFUNDED" ? order : { ...order, orderStatus: "DELIVERED" }));
      setError(null);
      window.alert(`${updated.updated} orders marked as delivered.`);
    } catch (requestError) { setError(requestError.message); } finally { setBulkSaving(false); }
  }

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar />
      <main className="admin-main admin-orders-main">
        <header className="orders-page-heading">
          <div>
            <span className="orders-eyebrow">OPERATIONS CENTER</span>
            <h1>Order management</h1>
            <p>Review order details and monitor delivery progress. Fulfillment updates are managed in Warehouse.</p>
          </div>
          <div className="orders-heading-actions"><div className="orders-live-indicator"><span /> Live data</div></div>
        </header>

        <section className="order-metrics" aria-label="Order summary">
          <div className="order-metric"><span className="metric-icon blue">⌁</span><div><strong>{metrics.total}</strong><small>Total orders</small></div></div>
          <div className="order-metric"><span className="metric-icon amber">◷</span><div><strong>{metrics.active}</strong><small>In progress</small></div></div>
          <div className="order-metric"><span className="metric-icon green">✓</span><div><strong>{metrics.delivered}</strong><small>Delivered</small></div></div>
          <div className="order-metric"><span className="metric-icon purple">₹</span><div><strong>{formatCurrency(metrics.revenue)}</strong><small>Order value</small></div></div>
        </section>

        <section className="orders-panel">
          <div className="orders-toolbar">
            <div><h2>All orders</h2><span>{visibleOrders.length} results</span></div>
            <div className="orders-controls">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
                {statuses.map((status) => <option key={status} value={status}>{status === "ALL" ? "All statuses" : formatStatus(status)}</option>)}
              </select>
            </div>
          </div>

          {error && <div className="orders-alert">{error}</div>}
          {loading && <div className="orders-empty"><div className="orders-spinner" />Loading orders...</div>}
          {!loading && !error && visibleOrders.length === 0 && <div className="orders-empty"><strong>No orders found</strong><span>Try changing your search or status filter.</span></div>}
          {!loading && !error && visibleOrders.length > 0 && (
            <div className="orders-table-wrap">
              <table className="admin-table orders-table">
                <thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Placed</th><th>Status</th><th className="align-right">Coupon discount</th><th className="align-right">Commission</th><th className="align-right">Final price</th><th>Details</th></tr></thead>
                <tbody>{visibleOrders.map((order) => {
                  const currentStatus = order.orderStatus || "PROCESSING";
                  return <tr key={order.id} onClick={() => setSelectedOrder(order)} className="clickable-order-row">
                    <td><strong className="order-id">#{String(order.id).padStart(5, "0")}</strong><small>{order.orderReference || "No reference"}</small></td>
                    <td><strong>{order.customerName || "Guest customer"}</strong><small>{order.customerEmail}</small></td>
                    <td><strong>{order.productName || "Product"}</strong><small>Qty {order.quantity || 0}</small></td>
                    <td><span className="order-date">{order.placedAt ? new Date(order.placedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span></td>
                    <td><span className={`status-badge status-${currentStatus.toLowerCase()}`}>{formatStatus(currentStatus)}</span><small className="admin-warehouse-status">Warehouse: {formatStatus(order.warehouseStatus || "ORDER_CONFIRMED")}</small></td>
                    <td className="align-right coupon-cell">−{formatCurrency(Math.max(0, Number(order.totalAmount || 0) - Number(order.customerTotalAmount || order.totalAmount || 0)))}</td><td className="align-right commission-cell">−{formatCurrency(order.commissionAmount)}</td><td className="align-right final-price-cell">{formatCurrency(order.customerTotalAmount || order.totalAmount)}</td>
                    <td><span className="order-details-hint">View details</span></td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          )}
        </section>
        {selectedOrder && <div className="order-detail-overlay" onClick={() => setSelectedOrder(null)}><section className="order-detail-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Order details"><button type="button" className="order-detail-close" onClick={() => setSelectedOrder(null)}>×</button><span className="orders-eyebrow">ORDER DETAILS</span><h2>Order #{String(selectedOrder.id).padStart(5, "0")}</h2><div className="order-detail-status"><div><span className={`status-badge status-${(selectedOrder.orderStatus || "PROCESSING").toLowerCase()}`}>{formatStatus(selectedOrder.orderStatus)}</span><div className="modal-status-controls">{selectedOrder.orderStatus === "PROCESSING" ? <button type="button" className="approve-order-btn" onClick={() => updateStatus(selectedOrder, "SHIPPED")} disabled={savingId === selectedOrder.id}>{savingId === selectedOrder.id ? "Saving..." : "Approve & ship"}</button> : !["DELIVERED", "REFUNDED", "CANCELLED", "REFUND_REQUESTED"].includes(selectedOrder.orderStatus) && <><select value={statusDraft[selectedOrder.id] || selectedOrder.orderStatus} onChange={(event) => setStatusDraft(items => ({ ...items, [selectedOrder.id]: event.target.value }))}><option value="SHIPPED">Shipped</option><option value="OUT_FOR_DELIVERY">Out for delivery</option><option value="DELIVERED">Delivered</option></select><button type="button" onClick={() => updateStatus(selectedOrder, statusDraft[selectedOrder.id] || selectedOrder.orderStatus)} disabled={savingId === selectedOrder.id}>{savingId === selectedOrder.id ? "Saving..." : "Save status"}</button></>}</div></div><strong>{formatCurrency(selectedOrder.totalAmount)}</strong></div><div className="order-detail-grid"><div><small>Customer</small><strong>{selectedOrder.customerName || "Guest customer"}</strong><span>{selectedOrder.customerEmail}</span><span>{selectedOrder.customerPhone || "No phone provided"}</span></div><div><small>Product</small><strong>{selectedOrder.productName || "Product"}</strong><span>Quantity: {selectedOrder.quantity || 0}</span><span>Order ref: {selectedOrder.orderReference || "No reference"}</span></div><div className="order-detail-full"><small>Delivery address</small><strong>{selectedOrder.deliveryAddress || "No address provided"}</strong></div></div><div className="order-detail-footer"><span>Placed {selectedOrder.placedAt ? new Date(selectedOrder.placedAt).toLocaleString("en-IN") : "—"}</span><button type="button" onClick={() => setSelectedOrder(null)}>Close details</button></div></section></div>}
        {selectedOrder && showCommissionDetails && <div className="order-commission-overlay" onClick={() => setShowCommissionDetails(false)}><section className="order-commission-modal" onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => setShowCommissionDetails(false)}>×</button><span className="orders-eyebrow">COMMISSION DETAILS</span><h2>{selectedOrder.productName || "Product"}</h2><div><span>Product total</span><strong>{formatCurrency(selectedOrder.totalAmount)}</strong></div><div><span>Commission ({Number(selectedOrder.commissionPercentage || 0).toLocaleString("en-IN")}%)</span><strong className="commission-deduction">−{formatCurrency(selectedOrder.commissionAmount)}</strong></div><div className="commission-vendor-earnings"><span>Vendor earnings</span><strong>{formatCurrency(Number(selectedOrder.totalAmount || 0) - Number(selectedOrder.commissionAmount || 0))}</strong></div></section></div>}
      </main>
    </div>
  );
}
