import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "./Admin.css";
import { FaChartLine, FaClipboardList, FaClock, FaMoneyBillWave, FaStore, FaUsers, FaUndoAlt } from "react-icons/fa";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ users: 0, vendors: 0, orders: 0, refunds: 0, revenue: 0, commissionRevenue: 0 });
  const [returnHistory, setReturnHistory] = useState([]);

  function cacheOrderStatuses(orders) {
    const statuses = JSON.parse(localStorage.getItem("shopstack-order-statuses") || "{}");
    (orders || []).forEach((order) => { statuses[order.orderReference || order.id] = order.orderStatus || "PROCESSING"; });
    localStorage.setItem("shopstack-order-statuses", JSON.stringify(statuses));
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found");
      setLoading(false);
      navigate("/", { replace: true });
      return;
    }

    async function fetchData() {
      try {
        const [userRes, summaryRes, refundsRes, ordersRes] = await Promise.all([
          fetch("https://shopstack-backend-gjv6.onrender.com/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("https://shopstack-backend-gjv6.onrender.com/api/admin/summary", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("https://shopstack-backend-gjv6.onrender.com/api/admin/refunds", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("https://shopstack-backend-gjv6.onrender.com/api/admin/orders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!userRes.ok) {
          const text = await userRes.text();
          throw new Error(text || userRes.statusText);
        }
        if (!summaryRes.ok) {
          const text = await summaryRes.text();
          throw new Error(text || summaryRes.statusText);
        }
        if (!refundsRes.ok) {
          const text = await refundsRes.text();
          throw new Error(text || refundsRes.statusText);
        }
        if (!ordersRes.ok) {
          const text = await ordersRes.text();
          throw new Error(text || ordersRes.statusText);
        }

        const userData = await userRes.json();
        const summaryData = await summaryRes.json();
        const refundsData = await refundsRes.json();
        const ordersData = await ordersRes.json();
        cacheOrderStatuses(ordersData);
        const savedReturns = Array.isArray(refundsData) ? refundsData : [];
        const historicalRefunds = (Array.isArray(ordersData) ? ordersData : [])
          .filter((order) => order.orderStatus === "REFUNDED")
          .map((order) => ({ ...order, refundStatus: "APPROVED" }));
        const returnMap = new Map([...savedReturns, ...historicalRefunds].map((item) => [item.orderReference || item.id, item]));
        setUser(userData);
        setSummary(summaryData);
        setReturnHistory([...returnMap.values()].slice(0, 5));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    const refreshTimer = setInterval(fetchData, 10000);
    return () => clearInterval(refreshTimer);
  }, [navigate]);

  if (loading) return <div className="admin-loading">Loading admin dashboard...</div>;
  if (error) return <div className="admin-error">Error: {error}</div>;
  if (!user) return <div className="admin-error">No user data</div>;

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar />

      <main className="admin-main admin-dashboard-main">
        <div className="admin-header admin-welcome-header">
          <div>
            <span className="admin-eyebrow">CONTROL CENTER</span>
            <h1>Admin Dashboard</h1>
            <p>Welcome back, <strong>{user.displayName}</strong></p>
          </div><div className="admin-header-date"><FaClock /> {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</div>
        </div>

        <section className="marketplace-overview">
          <div className="marketplace-overview-heading">
            <div><span className="admin-eyebrow">MARKETPLACE OVERVIEW</span><h2>Overall marketplace summary</h2><p>A quick view of the people, activity, and revenue across ShopStack.</p></div>
            
          </div>
          <div className="admin-cards">
          <div className="admin-card admin-stat-card users-stat"><span className="admin-stat-icon"><FaUsers /></span>
            <h2>{summary.users}</h2>
            <p>Customers</p>
          </div>
          <div className="admin-card admin-stat-card vendors-stat"><span className="admin-stat-icon"><FaStore /></span>
            <h2>{summary.vendors}</h2>
            <p>Vendors</p>
          </div>
          <div className="admin-card admin-stat-card orders-stat clickable-stat-card" role="button" tabIndex="0" onClick={() => navigate("/admin/orders")} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") navigate("/admin/orders"); }} title="View customer orders">
            <span className="admin-stat-icon"><FaClipboardList /></span>
            <h2>{summary.orders}</h2>
            <p>Total Orders <span className="stat-link-hint">View orders →</span></p>
          </div>
          <div className="admin-card admin-stat-card refunds-stat"><span className="admin-stat-icon"><FaChartLine /></span>
            <h2>{summary.refunds}</h2>
            <p>Refund Requests</p>
          </div>
          <div className="admin-card admin-stat-card commission-stat">
            <span className="admin-stat-icon"><FaMoneyBillWave /></span>
            <h2>₹{Number(summary.commissionRevenue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            <p>Commission Revenue</p>
          </div>
          </div>
        </section>

        <div className="admin-section">
          <h2>Admin Actions</h2>
          <div className="admin-actions">
            <button onClick={() => navigate("/admin/vendors")}>Manage Vendors</button>
            <button onClick={() => navigate("/admin/refunds")}>Review Returns</button>
            <button onClick={() => navigate("/admin/reports")}>View Reports</button>
            <button onClick={() => navigate("/admin/orders")}>Audit Orders</button>
            <button onClick={() => navigate("/admin/warehouse")}>Warehouse Stock</button>
          </div>
        </div>

        <section className="admin-section return-history-panel">
          <div className="return-history-heading"><div><span className="admin-eyebrow">RETURNS CENTER</span><h2>Recent return history</h2><p>Refund requests and completed refunds across the marketplace.</p></div><button type="button" onClick={() => navigate("/admin/refunds")}>View all returns <FaUndoAlt /></button></div>
          {returnHistory.length === 0 ? <div className="return-history-empty">No return activity yet.</div> : <div className="return-history-list">{returnHistory.map((refund) => { const isRefunded = refund.orderStatus === "REFUNDED" || refund.refundStatus === "APPROVED"; return <div className="return-history-row" key={refund.id}><div><strong>{refund.orderReference || `Order #${refund.id}`}</strong><small>{refund.customerName || refund.customerEmail || "Customer"}</small></div><span className={`status-badge ${isRefunded ? "refund-history-approved" : `refund-history-${(refund.refundStatus || "PENDING").toLowerCase()}`}`}>{isRefunded ? "REFUNDED" : refund.refundStatus || "PENDING"}</span><strong>₹{Number(refund.totalAmount || 0).toLocaleString("en-IN")}</strong></div>; })}</div>}
        </section>

        <div className="admin-section admin-summary">
          <div className="admin-summary-box">
            <h3>Account</h3>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role: Admin</strong> {user.role}</p>
          </div>
          <div className="admin-summary-box">
            <h3>System Status</h3>
            <p>All services are operating normally.</p>
            <p>Last sync: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
