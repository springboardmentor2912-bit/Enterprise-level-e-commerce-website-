import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    function goTo(path) {
        setIsMobileOpen(false);
        navigate(path);
    }

    function logout() {
        setIsMobileOpen(false);
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        sessionStorage.clear();
        navigate("/");
    }

    return (
        <>
            {/* Vendor Mobile Topbar with 3-dot button */}
            <div className="vendor-mobile-topbar">
                <div className="vendor-mobile-brand" onClick={() => goTo("/vendor-dashboard")}>
                    <h2>ShopStack</h2>
                    <span>Vendor</span>
                </div>
                <button
                    type="button"
                    className="mobile-kebab-btn"
                    onClick={() => setIsMobileOpen(prev => !prev)}
                    aria-label="Toggle Navigation Menu"
                    aria-expanded={isMobileOpen}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="2.2" />
                        <circle cx="12" cy="12" r="2.2" />
                        <circle cx="12" cy="19" r="2.2" />
                    </svg>
                </button>
            </div>

            {/* Backdrop */}
            {isMobileOpen && (
                <div
                    className="vendor-sidebar-backdrop"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar / Drawer */}
            <aside className={`sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
                <div className="sidebar-logo">
                    <div className="sidebar-logo-content">
                        <h2>ShopStack</h2>
                        <p>Vendor Panel</p>
                    </div>
                    {isMobileOpen && (
                        <button
                            type="button"
                            className="sidebar-close-btn"
                            onClick={() => setIsMobileOpen(false)}
                            aria-label="Close Menu"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <button
                    className={location.pathname === "/vendor-dashboard" ? "active" : ""}
                    onClick={() => goTo("/vendor-dashboard")}
                >
                    🏠 Dashboard
                </button>

                <button
                    className={location.pathname === "/vendor/products" ? "active" : ""}
                    onClick={() => goTo("/vendor/products")}
                >
                    📦 Products
                </button>

                <button
                    className={location.pathname === "/vendor/add-product" ? "active" : ""}
                    onClick={() => goTo("/vendor/add-product")}
                >
                    ➕ Add Product
                </button>

                <button
                    className={location.pathname === "/vendor/orders" ? "active" : ""}
                    onClick={() => goTo("/vendor/orders")}
                >
                    📑 Orders
                </button>

                <button
                    className={location.pathname === "/vendor/notifications" ? "active" : ""}
                    onClick={() => goTo("/vendor/notifications")}
                >
                    🔔 Notifications
                </button>

                <button
                    className={location.pathname === "/vendor-profile" || location.pathname === "/vendor/profile" ? "active" : ""}
                    onClick={() => goTo("/vendor-profile")}
                >
                    👤 Vendor Profile
                </button>

                <button
                    className="logout-btn"
                    onClick={logout}
                >
                    🚪 Logout
                </button>
            </aside>
        </>
    );
}

export default Sidebar;
