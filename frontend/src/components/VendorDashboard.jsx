import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./dashboard/Sidebar";
import "./dashboard/Dashboard.css";

function VendorDashboard() {

    const navigate = useNavigate();
    const [username, setUsername] = useState(() => sessionStorage.getItem("username") || localStorage.getItem("username") || "Vendor");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [productCount, setProductCount] = useState(0);
    const [orders, setOrders] = useState(0);
    const [revenue, setRevenue] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Please log in to view the vendor dashboard.");
            setLoading(false);
            navigate("/", { replace: true });
            return;
        }

        let isMounted = true;

        async function loadDashboardData() {
            try {
                const [productsRes, summaryRes, notificationsRes] = await Promise.all([
                    fetch("https://shopstack-backend-gjv6.onrender.com/api/vendor/products", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch("https://shopstack-backend-gjv6.onrender.com/api/vendor/orders/summary", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch("https://shopstack-backend-gjv6.onrender.com/api/vendor/orders/unread-count", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (!productsRes.ok) {
                    const text = await productsRes.text();
                    throw new Error(text || "Unable to load products.");
                }
                if (!summaryRes.ok) {
                    const text = await summaryRes.text();
                    throw new Error(text || "Unable to load order summary.");
                }
                if (!notificationsRes.ok) {
                    const text = await notificationsRes.text();
                    throw new Error(text || "Unable to load notifications.");
                }

                const products = await productsRes.json();
                const summary = await summaryRes.json();
                const notifications = await notificationsRes.json();
                const profileRes = await fetch("https://shopstack-backend-gjv6.onrender.com/api/vendor/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (profileRes.ok) {
                    const profile = await profileRes.json();
                    if (profile.displayName) {
                        setUsername(profile.displayName);
                        sessionStorage.setItem("username", profile.displayName);
                        localStorage.setItem("username", profile.displayName);
                    }
                }

                if (!isMounted) return;

                setProductCount(Array.isArray(products) ? products.length : 0);
                setOrders(Number(summary?.deliveredItems ?? 0));
                setRevenue(Number(summary?.revenue ?? 0));
                setNotificationCount(Number(notifications?.count ?? 0));
            } catch (err) {
                if (isMounted) {
                    setError(err.message || "Unable to load the vendor dashboard.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        loadDashboardData();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    if (loading) {
        return <div className="dashboard-loading">Loading vendor dashboard...</div>;
    }

    if (error) {
        return <div className="dashboard-error">Error: {error}</div>;
    }

    return (

        <div className="dashboard-container vendor-dashboard-container">

            <Sidebar />

            <div className="dashboard-main">

                {/* Header */}

                <div className="dashboard-header">

                    <div>

                        <h1>

                            Vendor Dashboard

                        </h1>

                        <p>

                            Welcome back, <strong>{username}</strong>

                        </p>

                    </div>

                </div>

                {/* Statistics */}

                <div className="cards">

                    <div className="card">

                        <h2>

                            {productCount}

                        </h2>

                        <p>

                            Total Products

                        </p>

                    </div>

                    <div className="card">

                        <h2>

                            {orders}

                        </h2>

                        <p>

                            Items Sold

                        </p>

                    </div>

                    <div className="card">

                        <h2>

                            ₹0

                        </h2>

                        <p>

                            Revenue<br /><strong className="dashboard-revenue">₹{revenue.toLocaleString()}</strong>

                        </p>

                    </div>

                    <div className="card">

                        <h2>

                            5.0

                        </h2>

                        <p>

                            Store Rating

                        </p>

                    </div>

                </div>

                {/* Store Profile */}

                <div className="section-card store-information-card">

                    <h2>

                        Store Information

                    </h2>

                    <div className="store-info">

                        <div className="store-logo">

                            🏪

                        </div>

                        <div>

                            <h3>

                                {username?.toLowerCase() === "admin" ? "Vendor" : username}

                            </h3>

                            <p>

                                Premium Vendor Account

                            </p>

                            <p>

                                Location: Kolkata

                            </p>

                        </div>

                    </div>

                </div>

                {/* Quick Actions */}

                <div className="section-card quick-actions-card">

                    <h2>

                        Quick Actions

                    </h2>

                    <div className="action-grid">

                        <button onClick={() => navigate("/vendor/add-product")}>

                            Add Product

                        </button>

                        <button onClick={() => navigate("/vendor/products")}>

                            Manage Products

                        </button>

                        <button onClick={() => navigate("/vendor/notifications")}>

                            Notifications {notificationCount > 0 && <span className="notification-count">{notificationCount}</span>}

                        </button>

                        <button onClick={() => navigate("/vendor-profile")}>

                            Vendor Profile

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default VendorDashboard;
