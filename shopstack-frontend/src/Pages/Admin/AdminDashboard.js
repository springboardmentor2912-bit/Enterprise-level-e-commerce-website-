import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "./AdminLayout";
import "./AdminDashboard.css";

function AdminDashboard() {

    const [dashboardData, setDashboardData] = useState({
        totalCustomers: 0,
        totalVendors: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const response =
                    await api.get("/admin/dashboard");

                console.log(
                    "ADMIN DASHBOARD:",
                    response.data
                );

                setDashboardData(response.data);

            } catch (error) {

                console.error(
                    "ADMIN DASHBOARD ERROR:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

        loadDashboard();

    }, []);


    if (loading) {

        return (
            <AdminLayout>

                <div className="dashboard-loading">
                    Loading admin dashboard...
                </div>

            </AdminLayout>
        );
    }


    const totalOrders =
        dashboardData.totalOrders || 0;

    const pendingOrders =
        dashboardData.pendingOrders || 0;

    const processedOrders =
        Math.max(
            totalOrders - pendingOrders,
            0
        );

    const pendingPercentage =
        totalOrders > 0
            ? Math.round(
                (pendingOrders / totalOrders) * 100
            )
            : 0;

    const processedPercentage =
        totalOrders > 0
            ? Math.round(
                (processedOrders / totalOrders) * 100
            )
            : 0;


    const productValue =
        Number(
            dashboardData.totalRevenue || 0
        );


    return (

        <AdminLayout>

            <div className="admin-dashboard">

                <main className="admin-main">


                    {/* =====================================
                        HEADER
                    ===================================== */}

                    <div className="admin-header">

                        <div>

                            <span className="dashboard-badge">
                                ADMINISTRATION
                            </span>

                            <h1>
                                Admin Dashboard
                            </h1>

                            <p>
                                Monitor ShopStack marketplace
                                performance and business activity.
                            </p>

                        </div>

                    </div>


                    {/* =====================================
                        KPI CARDS
                    ===================================== */}

                    <div className="dashboard-cards">


                        {/* CUSTOMERS */}

                        <div className="dashboard-card">

                            <div className="card-content">

                                <span>
                                    TOTAL CUSTOMERS
                                </span>

                                <h2>
                                    {dashboardData.totalCustomers
                                        .toLocaleString("en-IN")}
                                </h2>

                                <small>
                                    Registered customers
                                </small>

                            </div>

                        </div>


                        {/* VENDORS */}

                        <div className="dashboard-card">

                            <div className="card-content">

                                <span>
                                    TOTAL VENDORS
                                </span>

                                <h2>
                                    {dashboardData.totalVendors
                                        .toLocaleString("en-IN")}
                                </h2>

                                <small>
                                    Marketplace sellers
                                </small>

                            </div>

                        </div>


                        {/* PRODUCTS */}

                        <div className="dashboard-card">

                            <div className="card-content">

                                <span>
                                    TOTAL PRODUCTS
                                </span>

                                <h2>
                                    {dashboardData.totalProducts
                                        .toLocaleString("en-IN")}
                                </h2>

                                <small>
                                    Products listed
                                </small>

                            </div>

                        </div>


                        {/* ORDERS */}

                        <div className="dashboard-card">

                            <div className="card-content">

                                <span>
                                    TOTAL ORDERS
                                </span>

                                <h2>
                                    {dashboardData.totalOrders
                                        .toLocaleString("en-IN")}
                                </h2>

                                <small>
                                    Marketplace orders
                                </small>

                            </div>

                        </div>


                        {/* =================================
                            TOTAL PRODUCT VALUE
                        ================================= */}

                        <div className="dashboard-card revenue-card">

                            <div className="card-content">

                                <span>
                                    TOTAL PRODUCT VALUE
                                </span>

                                <h2>
                                    ₹{productValue.toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 2
                                        }
                                    )}
                                </h2>

                                <small>
                                    Total value of listed products
                                </small>

                            </div>

                        </div>


                        {/* PENDING ORDERS */}

                        <div className="dashboard-card pending-card">

                            <div className="card-content">

                                <span>
                                    PENDING ORDERS
                                </span>

                                <h2>
                                    {dashboardData.pendingOrders
                                        .toLocaleString("en-IN")}
                                </h2>

                                <small>
                                    Awaiting processing
                                </small>

                            </div>

                        </div>

                    </div>


                    {/* =====================================
                        MARKETPLACE OVERVIEW
                    ===================================== */}

                    <section className="admin-section">

                        <div className="section-heading">

                            <div>

                                <span className="section-label">
                                    MARKETPLACE
                                </span>

                                <h2>
                                    Marketplace Overview
                                </h2>

                                <p>
                                    Current marketplace performance
                                    across customers, vendors,
                                    products, orders and product value.
                                </p>

                            </div>

                        </div>


                        <div className="overview-grid">


                            {/* CUSTOMERS */}

                            <div className="overview-item">

                                <span>
                                    Customers
                                </span>

                                <strong>
                                    {dashboardData.totalCustomers
                                        .toLocaleString("en-IN")}
                                </strong>

                            </div>


                            {/* VENDORS */}

                            <div className="overview-item">

                                <span>
                                    Vendors
                                </span>

                                <strong>
                                    {dashboardData.totalVendors
                                        .toLocaleString("en-IN")}
                                </strong>

                            </div>


                            {/* PRODUCTS */}

                            <div className="overview-item">

                                <span>
                                    Products
                                </span>

                                <strong>
                                    {dashboardData.totalProducts
                                        .toLocaleString("en-IN")}
                                </strong>

                            </div>


                            {/* ORDERS */}

                            <div className="overview-item">

                                <span>
                                    Orders
                                </span>

                                <strong>
                                    {dashboardData.totalOrders
                                        .toLocaleString("en-IN")}
                                </strong>

                            </div>


                            {/* PRODUCT VALUE */}

                            <div className="overview-item">

                                <span>
                                    Product Value
                                </span>

                                <strong>
                                    ₹{productValue.toLocaleString(
                                        "en-IN",
                                        {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 2
                                        }
                                    )}
                                </strong>

                            </div>


                            {/* PENDING ORDERS */}

                            <div className="overview-item">

                                <span>
                                    Pending Orders
                                </span>

                                <strong>
                                    {dashboardData.pendingOrders
                                        .toLocaleString("en-IN")}
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* =====================================
                        ORDER PERFORMANCE + MARKETPLACE HEALTH
                    ===================================== */}

                    <div className="dashboard-bottom-grid">


                        {/* =================================
                            ORDER PERFORMANCE
                        ================================= */}

                        <section className="dashboard-panel">

                            <div className="panel-header">

                                <div>

                                    <span className="section-label">
                                        ORDER PERFORMANCE
                                    </span>

                                    <h2>
                                        Order Status
                                    </h2>

                                </div>

                                <strong className="panel-total">
                                    {totalOrders}
                                </strong>

                            </div>


                            {/* PENDING */}

                            <div className="order-progress">

                                <div className="order-progress-label">

                                    <span>
                                        Pending
                                    </span>

                                    <strong>
                                        {pendingOrders}
                                    </strong>

                                </div>


                                <div className="progress-container">

                                    <div
                                        className="progress-bar pending-progress"
                                        style={{
                                            width:
                                                `${pendingPercentage}%`
                                        }}
                                    />

                                </div>


                                <small>
                                    {pendingPercentage}%
                                    {" "}of all orders
                                </small>

                            </div>


                            {/* PROCESSED */}

                            <div className="order-progress">

                                <div className="order-progress-label">

                                    <span>
                                        Processed / Other
                                    </span>

                                    <strong>
                                        {processedOrders}
                                    </strong>

                                </div>


                                <div className="progress-container">

                                    <div
                                        className="progress-bar completed-progress"
                                        style={{
                                            width:
                                                `${processedPercentage}%`
                                        }}
                                    />

                                </div>


                                <small>
                                    {processedPercentage}%
                                    {" "}of all orders
                                </small>

                            </div>

                        </section>


                        {/* =================================
                            MARKETPLACE HEALTH
                        ================================= */}

                        <section className="dashboard-panel">

                            <div className="panel-header">

                                <div>

                                    <span className="section-label">
                                        BUSINESS SUMMARY
                                    </span>

                                    <h2>
                                        Marketplace Health
                                    </h2>

                                </div>

                                <span className="health-status">
                                    Operational
                                </span>

                            </div>


                            <div className="health-list">


                                {/* CUSTOMERS */}

                                <div>

                                    <span>
                                        Customers
                                    </span>

                                    <strong>
                                        {dashboardData.totalCustomers}
                                    </strong>

                                </div>


                                {/* VENDORS */}

                                <div>

                                    <span>
                                        Vendors
                                    </span>

                                    <strong>
                                        {dashboardData.totalVendors}
                                    </strong>

                                </div>


                                {/* PRODUCTS */}

                                <div>

                                    <span>
                                        Products
                                    </span>

                                    <strong>
                                        {dashboardData.totalProducts}
                                    </strong>

                                </div>


                                {/* ORDERS */}

                                <div>

                                    <span>
                                        Orders
                                    </span>

                                    <strong>
                                        {dashboardData.totalOrders}
                                    </strong>

                                </div>


                                {/* PRODUCT VALUE */}

                                <div>

                                    <span>
                                        Product Value
                                    </span>

                                    <strong>
                                        ₹{productValue.toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 2
                                            }
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </section>

                    </div>

                </main>

            </div>

        </AdminLayout>
    );
}

export default AdminDashboard;