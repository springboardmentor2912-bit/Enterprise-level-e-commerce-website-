import { useState } from "react";
import api from "../services/api";
import "./CustomerDashboard.css";

import CustomerProductManagement from "./CustomerProductManagement";
import CustomerOrderManagement from "./CustomerOrderManagement";
import CustomerCart from "./CustomerCart";
import CustomerAddress from "./CustomerAddress";
import CustomerProfile from "./CustomerProfile";
import CustomerCheckout from "./CustomerCheckout";

const CustomerDashboard = () => {
    const [activePage, setActivePage] = useState("dashboard");
    const [showCheckout, setShowCheckout] = useState(false);

    const [cart, setCart] = useState([]);
    const [orderCount, setOrderCount] = useState(0);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // =====================================================
    // FETCH ORDER COUNT
    // =====================================================

    const fetchOrderCount = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setOrderCount(0);
            return;
        }

        try {
            setLoadingOrders(true);

            const response = await api.get("/customer/orders");

            if (Array.isArray(response.data)) {
                setOrderCount(response.data.length);
            } else {
                setOrderCount(0);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrderCount(0);
        } finally {
            setLoadingOrders(false);
        }
    };

    // =====================================================
    // NAVIGATION
    // =====================================================

    const handleOpenDashboard = () => {
        setShowCheckout(false);
        setActivePage("dashboard");
        fetchOrderCount();
    };

    const handleOpenOrders = () => {
        setShowCheckout(false);
        setActivePage("orders");
    };

    const handleOpenProducts = () => {
        setShowCheckout(false);
        setActivePage("products");
    };

    const handleOpenCart = () => {
        setShowCheckout(false);
        setActivePage("cart");
    };

    const handleOpenAddresses = () => {
        setShowCheckout(false);
        setActivePage("addresses");
    };

    const handleOpenProfile = () => {
        setShowCheckout(false);
        setActivePage("profile");
    };

    const handleOpenSettings = () => {
        setShowCheckout(false);
        setActivePage("settings");
    };

    // =====================================================
    // CHECKOUT
    // =====================================================

    const handleOpenCheckout = () => {
        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        setShowCheckout(true);
    };

    const handleBackToCart = () => {
        setShowCheckout(false);
        setActivePage("cart");
    };

    const handleOrderPlaced = () => {
        setCart([]);
        setShowCheckout(false);
        setActivePage("orders");

        fetchOrderCount();
    };

    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.reload();
    };

    // =====================================================
    // PAGE TITLE
    // =====================================================

    const getPageTitle = () => {
        if (showCheckout) {
            return "Checkout";
        }

        switch (activePage) {
            case "dashboard":
                return "Customer Dashboard";

            case "orders":
                return "My Orders";

            case "products":
                return "Products";

            case "cart":
                return "My Cart";

            case "addresses":
                return "My Addresses";

            case "profile":
                return "My Profile";

            case "settings":
                return "Settings";

            default:
                return "Customer Dashboard";
        }
    };

    // =====================================================
    // PAGE SUBTITLE
    // =====================================================

    const getPageSubtitle = () => {
        if (showCheckout) {
            return "Complete your order";
        }

        switch (activePage) {
            case "dashboard":
                return "Welcome back! Here's what's happening with your account.";

            case "orders":
                return "View and track all your orders.";

            case "products":
                return "Browse products and add them to your cart.";

            case "cart":
                return "Review the products you've added to your cart.";

            case "addresses":
                return "Manage your delivery addresses.";

            case "profile":
                return "View and manage your profile information.";

            case "settings":
                return "Manage your account settings.";

            default:
                return "Welcome back, Customer!";
        }
    };

    return (
        <div className="customer-dashboard">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="customer-sidebar">

                {/* LOGO */}
                <div
                    className="customer-logo"
                    onClick={handleOpenDashboard}
                    style={{ cursor: "pointer" }}
                >
                    <span className="customer-logo-icon">
                        🛒
                    </span>

                    <div>
                        <h2>ShopStack</h2>
                        <span>Customer Portal</span>
                    </div>
                </div>

                {/* NAVIGATION */}
                <nav className="customer-navigation">

                    <p className="customer-nav-heading">
                        MAIN MENU
                    </p>

                    {/* DASHBOARD */}
                    <button
                        className={`customer-nav-item ${
                            activePage === "dashboard" && !showCheckout
                                ? "active"
                                : ""
                        }`}
                        onClick={handleOpenDashboard}
                    >
                        <span className="customer-nav-icon">
                            📊
                        </span>

                        <span>Dashboard</span>
                    </button>

                    {/* ORDERS */}
                    <button
                        className={`customer-nav-item ${
                            activePage === "orders" && !showCheckout
                                ? "active"
                                : ""
                        }`}
                        onClick={handleOpenOrders}
                    >
                        <span className="customer-nav-icon">
                            🛍️
                        </span>

                        <span>My Orders</span>

                        {orderCount > 0 && (
                            <span className="customer-nav-badge">
                                {orderCount}
                            </span>
                        )}
                    </button>

                    {/* PRODUCTS */}
                    <button
                        className={`customer-nav-item ${
                            activePage === "products" && !showCheckout
                                ? "active"
                                : ""
                        }`}
                        onClick={handleOpenProducts}
                    >
                        <span className="customer-nav-icon">
                            📦
                        </span>

                        <span>Products</span>
                    </button>

                    {/* CART */}
                    <button
                        className={`customer-nav-item ${
                            activePage === "cart" && !showCheckout
                                ? "active"
                                : ""
                        }`}
                        onClick={handleOpenCart}
                    >
                        <span className="customer-nav-icon">
                            🛒
                        </span>

                        <span>My Cart</span>

                        {cart.length > 0 && (
                            <span className="customer-nav-badge">
                                {cart.length}
                            </span>
                        )}
                    </button>

                    {/* ADDRESSES */}
                    <button
                        className={`customer-nav-item ${
                            activePage === "addresses" && !showCheckout
                                ? "active"
                                : ""
                        }`}
                        onClick={handleOpenAddresses}
                    >
                        <span className="customer-nav-icon">
                            📍
                        </span>

                        <span>My Addresses</span>
                    </button>

                    {/* PROFILE */}
                    <button
                        className={`customer-nav-item ${
                            activePage === "profile" && !showCheckout
                                ? "active"
                                : ""
                        }`}
                        onClick={handleOpenProfile}
                    >
                        <span className="customer-nav-icon">
                            👤
                        </span>

                        <span>My Profile</span>
                    </button>

                    {/* SETTINGS */}
                    <button
                        className={`customer-nav-item ${
                            activePage === "settings" && !showCheckout
                                ? "active"
                                : ""
                        }`}
                        onClick={handleOpenSettings}
                    >
                        <span className="customer-nav-icon">
                            ⚙️
                        </span>

                        <span>Settings</span>
                    </button>

                </nav>

                {/* SIDEBAR BOTTOM */}
                <div className="customer-sidebar-bottom">

                    <div className="customer-sidebar-divider"></div>

                    {/* USER */}
                    <div className="customer-sidebar-user">

                        <div className="customer-sidebar-avatar">
                            C
                        </div>

                        <div className="customer-sidebar-user-info">
                            <strong>Customer</strong>
                            <span>Buyer Account</span>
                        </div>

                    </div>

                    {/* LOGOUT */}
                    <button
                        className="customer-logout"
                        onClick={handleLogout}
                    >
                        <span>🚪</span>
                        <span>Logout</span>
                    </button>

                </div>

            </aside>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="customer-main">

                {/* HEADER */}
                <header className="customer-header">

                    <div className="customer-header-left">

                        <div className="customer-breadcrumb">
                            ShopStack
                            <span>/</span>
                            Customer
                        </div>

                        <h1>
                            {getPageTitle()}
                        </h1>

                        <p>
                            {getPageSubtitle()}
                        </p>

                    </div>

                    {/* PROFILE */}
                    <div className="customer-profile">

                        <div className="customer-profile-avatar">
                            C
                        </div>

                        <div className="customer-profile-info">
                            <strong>Customer</strong>
                            <span>Buyer</span>
                        </div>

                        <span className="customer-profile-arrow">
                            ▾
                        </span>

                    </div>

                </header>

                {/* =================================================
                    PAGE CONTENT
                ================================================= */}

                <section className="customer-content">

                    {/* CHECKOUT */}
                    {showCheckout && (
                        <CustomerCheckout
                            cart={cart}
                            onBackToCart={handleBackToCart}
                            onOrderPlaced={handleOrderPlaced}
                        />
                    )}

                    {/* DASHBOARD */}
                    {!showCheckout && activePage === "dashboard" && (
                        <>

                            {/* STATISTICS */}
                            <div className="customer-statistics">

                                {/* ORDERS */}
                                <div
                                    className="customer-stat-card"
                                    onClick={handleOpenOrders}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="customer-stat-icon">
                                        🛍️
                                    </div>

                                    <div className="customer-stat-content">

                                        <p>
                                            My Orders
                                        </p>

                                        <h2>
                                            {loadingOrders
                                                ? "..."
                                                : orderCount}
                                        </h2>

                                        <span>
                                            Total orders
                                        </span>

                                    </div>
                                </div>

                                {/* PRODUCTS */}
                                <div
                                    className="customer-stat-card"
                                    onClick={handleOpenProducts}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="customer-stat-icon">
                                        📦
                                    </div>

                                    <div className="customer-stat-content">

                                        <p>
                                            Products
                                        </p>

                                        <h2>
                                            Browse
                                        </h2>

                                        <span>
                                            Explore products
                                        </span>

                                    </div>
                                </div>

                                {/* CART */}
                                <div
                                    className="customer-stat-card"
                                    onClick={handleOpenCart}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="customer-stat-icon">
                                        🛒
                                    </div>

                                    <div className="customer-stat-content">

                                        <p>
                                            Cart Items
                                        </p>

                                        <h2>
                                            {cart.length}
                                        </h2>

                                        <span>
                                            Items in cart
                                        </span>

                                    </div>
                                </div>

                                {/* ADDRESSES */}
                                <div
                                    className="customer-stat-card"
                                    onClick={handleOpenAddresses}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="customer-stat-icon">
                                        📍
                                    </div>

                                    <div className="customer-stat-content">

                                        <p>
                                            My Addresses
                                        </p>

                                        <h2>
                                            Manage
                                        </h2>

                                        <span>
                                            Delivery addresses
                                        </span>

                                    </div>
                                </div>

                            </div>

                            {/* QUICK ACTIONS */}
                            <div className="customer-quick-actions">

                                <div className="customer-section-header">

                                    <div>
                                        <h2>
                                            Quick Actions
                                        </h2>

                                        <p>
                                            Quickly access the things you use
                                            most.
                                        </p>
                                    </div>

                                </div>

                                <div className="customer-action-grid">

                                    {/* PRODUCTS */}
                                    <button
                                        className="customer-action-card"
                                        onClick={handleOpenProducts}
                                    >
                                        <div className="customer-action-icon">
                                            🛍️
                                        </div>

                                        <div className="customer-action-content">

                                            <strong>
                                                Browse Products
                                            </strong>

                                            <span>
                                                Explore our latest products
                                            </span>

                                        </div>

                                        <span className="customer-action-arrow">
                                            →
                                        </span>
                                    </button>

                                    {/* ORDERS */}
                                    <button
                                        className="customer-action-card"
                                        onClick={handleOpenOrders}
                                    >
                                        <div className="customer-action-icon">
                                            📋
                                        </div>

                                        <div className="customer-action-content">

                                            <strong>
                                                My Orders
                                            </strong>

                                            <span>
                                                Track your orders
                                            </span>

                                        </div>

                                        <span className="customer-action-arrow">
                                            →
                                        </span>
                                    </button>

                                    {/* CART */}
                                    <button
                                        className="customer-action-card"
                                        onClick={handleOpenCart}
                                    >
                                        <div className="customer-action-icon">
                                            🛒
                                        </div>

                                        <div className="customer-action-content">

                                            <strong>
                                                My Cart
                                            </strong>

                                            <span>
                                                {cart.length === 0
                                                    ? "Your cart is empty"
                                                    : `${cart.length} item${
                                                          cart.length > 1
                                                              ? "s"
                                                              : ""
                                                      } in your cart`}
                                            </span>

                                        </div>

                                        <span className="customer-action-arrow">
                                            →
                                        </span>
                                    </button>

                                    {/* PROFILE */}
                                    <button
                                        className="customer-action-card"
                                        onClick={handleOpenProfile}
                                    >
                                        <div className="customer-action-icon">
                                            👤
                                        </div>

                                        <div className="customer-action-content">

                                            <strong>
                                                My Profile
                                            </strong>

                                            <span>
                                                Manage your account
                                            </span>

                                        </div>

                                        <span className="customer-action-arrow">
                                            →
                                        </span>
                                    </button>

                                </div>
                            </div>

                            {/* WELCOME CARD */}
                            <div className="customer-welcome-card">

                                <div className="customer-welcome-content">

                                    <span className="customer-welcome-label">
                                        SHOPSTACK
                                    </span>

                                    <h2>
                                        Welcome to ShopStack 👋
                                    </h2>

                                    <p>
                                        Discover amazing products, manage your
                                        orders, update your profile and enjoy a
                                        smooth shopping experience.
                                    </p>

                                    <button
                                        className="customer-primary-btn"
                                        onClick={handleOpenProducts}
                                    >
                                        Browse Products
                                        <span>→</span>
                                    </button>

                                </div>

                                <div className="customer-welcome-illustration">
                                    🛍️
                                </div>

                            </div>

                        </>
                    )}

                    {/* PRODUCTS */}
                    {!showCheckout && activePage === "products" && (
                        <CustomerProductManagement
                            cart={cart}
                            setCart={setCart}
                            onOpenCart={handleOpenCart}
                        />
                    )}

                    {/* ORDERS */}
                    {!showCheckout && activePage === "orders" && (
                        <CustomerOrderManagement />
                    )}

                    {/* CART */}
                    {!showCheckout && activePage === "cart" && (
                        <CustomerCart
                            cart={cart}
                            setCart={setCart}
                            onCheckout={handleOpenCheckout}
                        />
                    )}

                    {/* ADDRESSES */}
                    {!showCheckout && activePage === "addresses" && (
                        <CustomerAddress />
                    )}

                    {/* PROFILE */}
                    {!showCheckout && activePage === "profile" && (
                        <CustomerProfile />
                    )}

                    {/* SETTINGS */}
                    {!showCheckout && activePage === "settings" && (
                        <div className="customer-coming-soon">

                            <div className="customer-coming-icon">
                                ⚙️
                            </div>

                            <h2>
                                Settings Coming Soon
                            </h2>

                            <p>
                                Account settings and preferences will be
                                available here soon.
                            </p>

                        </div>
                    )}

                </section>

            </main>

        </div>
    );
};

export default CustomerDashboard;