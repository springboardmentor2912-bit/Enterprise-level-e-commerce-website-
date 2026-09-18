import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CustomerSidebar.css";
import { readCustomerStorage } from "../../utils/customerStorage";

function getCartCount() {
    const cart = readCustomerStorage("shopstack-cart", []);

    return cart.reduce(
        (total, item) => total + Number(item.quantity || 1),
        0
    );
}

function getWishlistCount() {
    return readCustomerStorage("shopstack-wishlist", []).length;
}

function CustomerSidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const [cartCount, setCartCount] = useState(getCartCount);
    const [wishlistCount, setWishlistCount] = useState(getWishlistCount);
    const [notificationCount, setNotificationCount] = useState(0);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    /* ============================================================
       UPDATE CART / WISHLIST / NOTIFICATIONS
       ============================================================ */

    useEffect(() => {
        const updateCartCount = () => {
            setCartCount(getCartCount());
            setWishlistCount(getWishlistCount());
        };

        window.addEventListener("storage", updateCartCount);
        window.addEventListener("cartUpdated", updateCartCount);

        const loadNotificationCount = () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setNotificationCount(0);
                return Promise.resolve({ count: 0 });
            }

            return fetch(
                "https://shopstack-backend-gjv6.onrender.com/api/customer/order-notifications/unread-count",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
                .then((response) => {
                    if (response.status === 401 || response.status === 403) {
                        setNotificationCount(0);
                        return { count: 0 };
                    }

                    return response.ok
                        ? response.json()
                        : { count: 0 };
                })
                .then((data) => {
                    setNotificationCount(data.count || 0);
                })
                .catch(() => {
                    setNotificationCount(0);
                });
        };

        loadNotificationCount();

        const notificationTimer = setInterval(
            loadNotificationCount,
            5000
        );

        return () => {
            window.removeEventListener("storage", updateCartCount);
            window.removeEventListener("cartUpdated", updateCartCount);

            clearInterval(notificationTimer);
        };
    }, []);

    /* ============================================================
       CLOSE MOBILE MENU WHEN ROUTE CHANGES
       ============================================================ */

    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    /* ============================================================
       NAVIGATION
       ============================================================ */

    function goTo(path) {
        setIsMobileOpen(false);
        navigate(path);
    }

    /* ============================================================
       LOGOUT
       ============================================================ */

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
            {/* ====================================================
                MOBILE TOP BAR
                ==================================================== */}

            <div className="customer-mobile-topbar">

                <div
                    className="customer-mobile-brand"
                    onClick={() => goTo("/customer-dashboard")}
                >
                    <h2>ShopStack</h2>

                    <span>Customer</span>
                </div>

                <div className="customer-mobile-right">

                    {/* Mobile Cart */}

                    <button
                        type="button"
                        className="customer-mobile-cart-btn"
                        onClick={() => goTo("/customer/cart")}
                        aria-label="Cart"
                    >
                        <span>🛒</span>

                        {cartCount > 0 && (
                            <span className="mobile-badge">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {/* Three Dot Menu */}

                    <button
                        type="button"
                        className="mobile-kebab-btn"
                        onClick={() =>
                            setIsMobileOpen((previous) => !previous)
                        }
                        aria-label="Toggle Navigation Menu"
                        aria-expanded={isMobileOpen}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="5" r="2.2" />
                            <circle cx="12" cy="12" r="2.2" />
                            <circle cx="12" cy="19" r="2.2" />
                        </svg>
                    </button>

                </div>
            </div>


            {/* ====================================================
                MOBILE BACKDROP
                ==================================================== */}

            {isMobileOpen && (
                <div
                    className="customer-sidebar-backdrop"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden="true"
                />
            )}


            {/* ====================================================
                SIDEBAR / MOBILE DRAWER
                ==================================================== */}

            <aside
                className={`customer-sidebar ${
                    isMobileOpen ? "mobile-open" : ""
                }`}
            >

                {/* =================================================
                    LOGO
                    ================================================= */}

                <div className="sidebar-logo">

                    <div className="sidebar-logo-content">

                        <h2>ShopStack</h2>

                        <p>Customer Panel</p>

                    </div>


                    {/* Mobile Close Button */}

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


                {/* =================================================
                    DASHBOARD
                    ================================================= */}

                <button
                    className={
                        location.pathname === "/customer-dashboard"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        goTo("/customer-dashboard")
                    }
                >
                    <span className="nav-icon">🏠</span>

                    <span className="nav-label">
                        Dashboard
                    </span>
                </button>


                {/* =================================================
                    NOTIFICATIONS
                    ================================================= */}

                <button
                    className={
                        location.pathname ===
                        "/customer/notifications"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        goTo("/customer/notifications")
                    }
                >
                    <span className="nav-icon">🔔</span>

                    <span className="nav-label">
                        Notifications
                    </span>

                    {notificationCount > 0 && (
                        <span
                            className="notification-dot"
                            aria-label={`${notificationCount} unread notifications`}
                        />
                    )}
                </button>


                {/* =================================================
                    PRODUCTS
                    ================================================= */}

                <button
                    className={
                        location.pathname === "/customer/products"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        goTo("/customer/products")
                    }
                >
                    <span className="nav-icon">🛍️</span>

                    <span className="nav-label">
                        Products
                    </span>
                </button>


                {/* =================================================
                    CART
                    ================================================= */}

                <button
                    className={
                        location.pathname === "/customer/cart"
                            ? "active"
                            : ""
                    }
                    onClick={() => goTo("/customer/cart")}
                >
                    <span className="nav-icon">🛒</span>

                    <span className="nav-label">
                        Cart
                    </span>

                    <span className="cart-count-badge">
                        {cartCount}
                    </span>
                </button>


                {/* =================================================
                    ORDERS
                    ================================================= */}

                <button
                    className={
                        location.pathname === "/customer/orders"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        goTo("/customer/orders")
                    }
                >
                    <span className="nav-icon">📦</span>

                    <span className="nav-label">
                        Orders
                    </span>
                </button>


                {/* =================================================
                    WISHLIST
                    ================================================= */}

                <button
                    className={
                        location.pathname ===
                        "/customer/wishlist"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        goTo("/customer/wishlist")
                    }
                >
                    <span className="nav-icon">❤️</span>

                    <span className="nav-label">
                        Wishlist
                    </span>

                    <span className="wishlist-count-badge">
                        {wishlistCount}
                    </span>
                </button>


                {/* =================================================
                    RETURNS & REFUNDS
                    ================================================= */}

                <button
                    className={
                        location.pathname ===
                        "/customer/returns"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        goTo("/customer/returns")
                    }
                >
                    <span className="nav-icon">🔄</span>

                    <span className="nav-label">
                        Returns & Refunds
                    </span>
                </button>


                {/* =================================================
                    PROFILE
                    ================================================= */}

                <button
                    className={
                        location.pathname ===
                            "/customer-profile" ||
                        location.pathname ===
                            "/customer/profile"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        goTo("/customer-profile")
                    }
                >
                    <span className="nav-icon">👤</span>

                    <span className="nav-label">
                        Profile
                    </span>
                </button>


                {/* =================================================
                    LOGOUT
                    ================================================= */}

                <button
                    type="button"
                    className="logout-btn"
                    onClick={logout}
                >
                    <span className="nav-icon">🚪</span>

                    <span className="nav-label">
                        Logout
                    </span>
                </button>

            </aside>
        </>
    );
}

export default CustomerSidebar;