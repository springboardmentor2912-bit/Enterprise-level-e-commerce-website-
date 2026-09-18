import { useEffect, useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import "./VendorOrders.css";
import "./VendorOrdersOverrides.css";

function VendorOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadOrders() {
        const token = localStorage.getItem("token");
        if (!token) {
            setOrders([]);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("https://shopstack-backend-gjv6.onrender.com/api/vendor/orders", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 401 || response.status === 403) {
                setOrders([]);
                setError("Unable to access vendor orders. Please restart the backend and try again.");
                return;
            }
            if (!response.ok) throw new Error(`Unable to load orders (${response.status})`);
            setError("");
            setOrders(await response.json());
        } catch (requestError) {
            setError(requestError.message || "Unable to load vendor orders.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
        const refreshTimer = setInterval(loadOrders, 10000);
        window.addEventListener("orderStatusUpdated", loadOrders);
        return () => { clearInterval(refreshTimer); window.removeEventListener("orderStatusUpdated", loadOrders); };
    }, []);

    async function markRead(order) {
        if (order.status !== "NEW") return;
        const token = localStorage.getItem("token");
        if (!token) return;

        await fetch(`https://shopstack-backend-gjv6.onrender.com/api/vendor/orders/${order.id}/read`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(items => items.map(item => item.id === order.id ? { ...item, status: "READ" } : item));
    }

    function getCustomerTotal(order) {
        const customerTotal = Number(order.customerTotalAmount);
        return Number.isFinite(customerTotal) && (customerTotal > 0 || Number(order.totalAmount || 0) === 0)
            ? customerTotal
            : Number(order.totalAmount || 0);
    }

    function getVendorEarnings(order) {
        if (order.orderStatus === "REFUNDED" || order.refundStatus === "REFUNDED") return 0;
        return Math.max(0, getCustomerTotal(order) - getCommissionAmount(order));
    }

    function getCommissionAmount(order) {
        if (order.orderStatus === "REFUNDED" || order.refundStatus === "REFUNDED") return 0;
        return getCustomerTotal(order) * Number(order.commissionPercentage || 0) / 100;
    }

    function getCouponDiscount(order) {
        return Math.max(0, Number(order.totalAmount || 0) - getCustomerTotal(order));
    }

    return <div className="vendor-orders-layout">
        <Sidebar />
        <main className="vendor-orders-page">
            <p className="vendor-orders-eyebrow">STORE ACTIVITY</p>
            <h1>Order Notifications</h1>
            <p className="vendor-orders-intro">See who placed orders for your products.</p>
            {error ? <div className="vendor-orders-empty">{error}</div> : loading ? <div className="vendor-orders-empty">Loading notifications...</div> : orders.length === 0 ? <div className="vendor-orders-empty">No customer orders yet.</div> : <div className="vendor-orders-list">
                {orders.map(order => <article className={`vendor-order-card ${order.status === "NEW" ? "unread" : ""}`} key={order.id} onClick={() => markRead(order)}>
                    <div className="vendor-order-top"><span>{order.status === "NEW" ? "New order" : "Viewed"}</span><time>{new Date(order.placedAt).toLocaleString()}</time></div>
                    <h2>Customer placed an order</h2>
                    <p>{order.customerEmail}{order.orderReference && ` · ${order.orderReference}`}</p>
                    <div className="vendor-order-details"><strong>{order.productName}</strong><span>Quantity: {order.quantity}</span><b>₹{getVendorEarnings(order).toLocaleString()}</b></div>
                    <div className="vendor-order-financials">{getCouponDiscount(order) > 0 ? <><span>Product price before coupon <strong>₹{Number(order.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span><span className="coupon-deduction-row">Coupon discount <strong>−₹{getCouponDiscount(order).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span><span>Product total after coupon <strong>₹{getCustomerTotal(order).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span></> : <span>Product price <strong>₹{getCustomerTotal(order).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>}<span>Commission ({Number(order.commissionPercentage || 0).toLocaleString("en-IN")}%) <strong className="commission-deduction">−₹{getCommissionAmount(order).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span><span className="vendor-earnings">Your earnings <strong>₹{getVendorEarnings(order).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span></div>
                    <div className="vendor-order-customer-details"><div><small>Phone</small><span>{order.customerPhone || "Not provided"}</span></div><div><small>Delivery address</small><span>{order.deliveryAddress || "Not provided"}</span></div><div><small>Payment</small><span>{order.paymentMethod || "Not provided"}</span></div><div><small>Delivery</small><span>{order.deliveryMethod || "Standard"}</span></div></div>
                    <div className="vendor-order-status-row"><span>Warehouse progress: <strong>{(order.warehouseStatus || "ORDER_CONFIRMED").replaceAll("_", " ")}</strong></span><span>Delivery status: <strong>{(order.orderStatus || "PROCESSING").replaceAll("_", " ")}</strong></span></div>
                    {order.orderStatus === "DELIVERED" && <div className="vendor-order-completed">✓ ORDER COMPLETED</div>}
                </article>)}
            </div>}
        </main>
    </div>;
}

export default VendorOrders;
