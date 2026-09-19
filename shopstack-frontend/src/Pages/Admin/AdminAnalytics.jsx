import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "./AdminLayout";
import "./AdminAnalytics.css";

function AdminAnalytics() {

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadAnalytics = async () => {

            try {
                const response = await api.get("/admin/analytics");

                console.log("ANALYTICS:", response.data);

                setAnalytics(response.data);

            } catch (error) {

                console.error("Analytics error:", error);

            } finally {

                setLoading(false);
            }
        };

        loadAnalytics();

    }, []);


    if (loading) {

        return (
            <AdminLayout>

                <div className="analytics-loading">
                    <div className="analytics-spinner"></div>
                    <p>Loading marketplace analytics...</p>
                </div>

            </AdminLayout>
        );
    }


    if (!analytics) {

        return (
            <AdminLayout>

                <div className="analytics-error">
                    <h2>Unable to load analytics</h2>
                    <p>Please try again later.</p>
                </div>

            </AdminLayout>
        );
    }


    // ==========================================
    // ORDER DATA
    // ==========================================

    const orderStatuses = [
        {
            label: "Pending",
            value: analytics.pendingOrders,
            className: "pending"
        },
        {
            label: "Confirmed",
            value: analytics.confirmedOrders,
            className: "confirmed"
        },
        {
            label: "Delivered",
            value: analytics.deliveredOrders,
            className: "delivered"
        },
        {
            label: "Cancelled",
            value: analytics.cancelledOrders,
            className: "cancelled"
        }
    ];


    const maxOrders = Math.max(
        ...orderStatuses.map(item => item.value),
        1
    );


    const totalTrackedOrders =
        analytics.pendingOrders +
        analytics.confirmedOrders +
        analytics.deliveredOrders +
        analytics.cancelledOrders;


    // ==========================================
    // PERCENTAGE
    // ==========================================

    const getPercentage = (value) => {

        if (totalTrackedOrders === 0) {
            return 0;
        }

        return Math.round(
            (value / totalTrackedOrders) * 100
        );
    };


    const pendingPercent =
        getPercentage(analytics.pendingOrders);

    const confirmedPercent =
        getPercentage(analytics.confirmedOrders);

    const deliveredPercent =
        getPercentage(analytics.deliveredOrders);

    const cancelledPercent =
        getPercentage(analytics.cancelledOrders);


    return (

        <AdminLayout>

            <div className="admin-analytics-page">

                {/* ======================================
                    HEADER
                ====================================== */}

                <div className="analytics-header">

                    <div>

                        <div className="analytics-eyebrow">
                            ADMINISTRATION / ANALYTICS
                        </div>

                        <h1>
                            Marketplace Analytics
                        </h1>

                        <p>
                            Monitor marketplace performance,
                            product value and operational metrics.
                        </p>

                    </div>


                    <div className="analytics-live-status">

                        <span className="live-dot"></span>

                        Live Marketplace Data

                    </div>

                </div>


                {/* ======================================
                    KPI CARDS
                ====================================== */}

                <div className="analytics-cards">

                    {/* VENDORS */}

                    <div className="analytics-card">

                        <div className="analytics-card-top">

                            <div className="analytics-icon vendor-icon">
                                V
                            </div>

                            <span className="growth-badge">
                                Active
                            </span>

                        </div>

                        <span className="analytics-card-label">
                            Total Vendors
                        </span>

                        <strong>
                            {analytics.totalVendors}
                        </strong>

                        <div className="mini-progress">

                            <div
                                style={{
                                    width: "78%"
                                }}
                            ></div>

                        </div>

                        <small>
                            Registered marketplace vendors
                        </small>

                    </div>


                    {/* PRODUCTS */}

                    <div className="analytics-card">

                        <div className="analytics-card-top">

                            <div className="analytics-icon product-icon">
                                P
                            </div>

                            <span className="growth-badge">
                                Catalog
                            </span>

                        </div>

                        <span className="analytics-card-label">
                            Total Products
                        </span>

                        <strong>
                            {analytics.totalProducts}
                        </strong>

                        <div className="mini-progress">

                            <div
                                style={{
                                    width: "68%"
                                }}
                            ></div>

                        </div>

                        <small>
                            Products listed on marketplace
                        </small>

                    </div>


                    {/* ORDERS */}

                    <div className="analytics-card">

                        <div className="analytics-card-top">

                            <div className="analytics-icon order-icon">
                                O
                            </div>

                            <span className="growth-badge">
                                Orders
                            </span>

                        </div>

                        <span className="analytics-card-label">
                            Total Orders
                        </span>

                        <strong>
                            {analytics.totalOrders}
                        </strong>

                        <div className="mini-progress">

                            <div
                                style={{
                                    width: "84%"
                                }}
                            ></div>

                        </div>

                        <small>
                            Customer orders recorded
                        </small>

                    </div>


                    {/* TOTAL PRODUCT VALUE */}

                    <div className="analytics-card sales-card">

                        <div className="analytics-card-top">

                            <div className="analytics-icon sales-icon">
                                ₹
                            </div>

                            <span className="growth-badge sales-badge">
                                Product Value
                            </span>

                        </div>

                        <span className="analytics-card-label">
                            Total Product Value
                        </span>

                        <strong>
                            ₹{Number(
                                analytics.totalSales
                            ).toLocaleString("en-IN")}
                        </strong>

                        <div className="mini-progress">

                            <div
                                style={{
                                    width: "91%"
                                }}
                            ></div>

                        </div>

                        <small>
                            Total value of products in marketplace
                        </small>

                    </div>

                </div>


                {/* ======================================
                    MAIN CHART GRID
                ====================================== */}

                <div className="analytics-chart-grid">

                    {/* ORDER DISTRIBUTION */}

                    <div className="analytics-panel order-distribution">

                        <div className="panel-header">

                            <div>

                                <h2>
                                    Order Distribution
                                </h2>

                                <p>
                                    Current order lifecycle
                                </p>

                            </div>

                            <span className="panel-period">
                                ALL TIME
                            </span>

                        </div>


                        <div className="donut-container">

                            <div
                                className="donut-chart"
                                style={{
                                    background: `conic-gradient(
                                        #f59e0b 0% ${pendingPercent}%,
                                        #3b82f6 ${pendingPercent}% ${pendingPercent + confirmedPercent}%,
                                        #10b981 ${pendingPercent + confirmedPercent}% ${pendingPercent + confirmedPercent + deliveredPercent}%,
                                        #ef4444 ${pendingPercent + confirmedPercent + deliveredPercent}% 100%
                                    )`
                                }}
                            >

                                <div className="donut-inner">

                                    <strong>
                                        {totalTrackedOrders}
                                    </strong>

                                    <span>
                                        Orders
                                    </span>

                                </div>

                            </div>


                            <div className="donut-legend">

                                <div className="legend-item">

                                    <span className="legend-color pending-color"></span>

                                    <div>
                                        <strong>
                                            {analytics.pendingOrders}
                                        </strong>

                                        <span>
                                            Pending
                                        </span>
                                    </div>

                                    <b>
                                        {pendingPercent}%
                                    </b>

                                </div>


                                <div className="legend-item">

                                    <span className="legend-color confirmed-color"></span>

                                    <div>
                                        <strong>
                                            {analytics.confirmedOrders}
                                        </strong>

                                        <span>
                                            Confirmed
                                        </span>
                                    </div>

                                    <b>
                                        {confirmedPercent}%
                                    </b>

                                </div>


                                <div className="legend-item">

                                    <span className="legend-color delivered-color"></span>

                                    <div>
                                        <strong>
                                            {analytics.deliveredOrders}
                                        </strong>

                                        <span>
                                            Delivered
                                        </span>
                                    </div>

                                    <b>
                                        {deliveredPercent}%
                                    </b>

                                </div>


                                <div className="legend-item">

                                    <span className="legend-color cancelled-color"></span>

                                    <div>
                                        <strong>
                                            {analytics.cancelledOrders}
                                        </strong>

                                        <span>
                                            Cancelled
                                        </span>
                                    </div>

                                    <b>
                                        {cancelledPercent}%
                                    </b>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* ORDER PERFORMANCE */}

                    <div className="analytics-panel">

                        <div className="panel-header">

                            <div>

                                <h2>
                                    Order Performance
                                </h2>

                                <p>
                                    Orders by current status
                                </p>

                            </div>

                            <span className="panel-icon">
                                ↗
                            </span>

                        </div>


                        <div className="bar-chart">

                            {orderStatuses.map((item) => (

                                <div
                                    className="bar-row"
                                    key={item.label}
                                >

                                    <div className="bar-label">

                                        <span>
                                            {item.label}
                                        </span>

                                        <strong>
                                            {item.value}
                                        </strong>

                                    </div>


                                    <div className="bar-track">

                                        <div
                                            className={`bar-fill ${item.className}`}
                                            style={{
                                                width: `${(item.value / maxOrders) * 100}%`
                                            }}
                                        ></div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                </div>


                {/* ======================================
                    MARKETPLACE OVERVIEW
                ====================================== */}

                <div className="analytics-section">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Marketplace Overview
                            </h2>

                            <p>
                                High-level platform statistics
                            </p>

                        </div>

                    </div>


                    <div className="analytics-overview">

                        <div className="overview-item">

                            <div className="overview-icon">
                                V
                            </div>

                            <div>

                                <span>
                                    Vendors
                                </span>

                                <strong>
                                    {analytics.totalVendors}
                                </strong>

                            </div>

                            <div className="overview-line">

                                <div
                                    style={{
                                        width: "72%"
                                    }}
                                ></div>

                            </div>

                        </div>


                        <div className="overview-item">

                            <div className="overview-icon">
                                P
                            </div>

                            <div>

                                <span>
                                    Products
                                </span>

                                <strong>
                                    {analytics.totalProducts}
                                </strong>

                            </div>

                            <div className="overview-line">

                                <div
                                    style={{
                                        width: "64%"
                                    }}
                                ></div>

                            </div>

                        </div>


                        <div className="overview-item">

                            <div className="overview-icon">
                                O
                            </div>

                            <div>

                                <span>
                                    Orders
                                </span>

                                <strong>
                                    {analytics.totalOrders}
                                </strong>

                            </div>

                            <div className="overview-line">

                                <div
                                    style={{
                                        width: "82%"
                                    }}
                                ></div>

                            </div>

                        </div>


                        <div className="overview-item">

                            <div className="overview-icon">
                                ₹
                            </div>

                            <div>

                                <span>
                                    Total Product Value
                                </span>

                                <strong>
                                    ₹{Number(
                                        analytics.totalSales
                                    ).toLocaleString("en-IN")}
                                </strong>

                            </div>

                            <div className="overview-line">

                                <div
                                    style={{
                                        width: "91%"
                                    }}
                                ></div>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ======================================
                    BUSINESS INSIGHTS
                ====================================== */}

                <div className="analytics-bottom-grid">

                    <div className="analytics-panel">

                        <div className="panel-header">

                            <div>

                                <h2>
                                    Business Snapshot
                                </h2>

                                <p>
                                    Key operational indicators
                                </p>

                            </div>

                        </div>


                        <div className="snapshot-list">

                            <div className="snapshot-row">

                                <span>
                                    Average Order Value
                                </span>

                                <strong>
                                    ₹
                                    {analytics.totalOrders > 0
                                        ? Math.round(
                                            analytics.totalSales /
                                            analytics.totalOrders
                                        ).toLocaleString("en-IN")
                                        : "0"
                                    }
                                </strong>

                            </div>


                            <div className="snapshot-row">

                                <span>
                                    Orders per Vendor
                                </span>

                                <strong>
                                    {analytics.totalVendors > 0
                                        ? (
                                            analytics.totalOrders /
                                            analytics.totalVendors
                                        ).toFixed(1)
                                        : "0"
                                    }
                                </strong>

                            </div>


                            <div className="snapshot-row">

                                <span>
                                    Products per Vendor
                                </span>

                                <strong>
                                    {analytics.totalVendors > 0
                                        ? (
                                            analytics.totalProducts /
                                            analytics.totalVendors
                                        ).toFixed(1)
                                        : "0"
                                    }
                                </strong>

                            </div>


                            <div className="snapshot-row">

                                <span>
                                    Order Completion Rate
                                </span>

                                <strong className="success-text">

                                    {totalTrackedOrders > 0
                                        ? Math.round(
                                            (
                                                analytics.deliveredOrders /
                                                totalTrackedOrders
                                            ) * 100
                                        )
                                        : 0
                                    }%

                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* PLATFORM HEALTH */}

                    <div className="analytics-panel platform-health">

                        <div className="panel-header">

                            <div>

                                <h2>
                                    Platform Health
                                </h2>

                                <p>
                                    Marketplace operational status
                                </p>

                            </div>

                            <span className="health-status">
                                Healthy
                            </span>

                        </div>


                        <div className="health-item">

                            <div className="health-label">

                                <span>
                                    Vendor Network
                                </span>

                                <strong>
                                    Operational
                                </strong>

                            </div>

                            <div className="health-track">

                                <div
                                    className="health-fill"
                                    style={{ width: "96%" }}
                                ></div>

                            </div>

                        </div>


                        <div className="health-item">

                            <div className="health-label">

                                <span>
                                    Product Catalog
                                </span>

                                <strong>
                                    Operational
                                </strong>

                            </div>

                            <div className="health-track">

                                <div
                                    className="health-fill"
                                    style={{ width: "94%" }}
                                ></div>

                            </div>

                        </div>


                        <div className="health-item">

                            <div className="health-label">

                                <span>
                                    Order Processing
                                </span>

                                <strong>
                                    Operational
                                </strong>

                            </div>

                            <div className="health-track">

                                <div
                                    className="health-fill"
                                    style={{ width: "91%" }}
                                ></div>

                            </div>

                        </div>


                        <div className="health-item">

                            <div className="health-label">

                                <span>
                                    Payment Processing
                                </span>

                                <strong>
                                    Operational
                                </strong>

                            </div>

                            <div className="health-track">

                                <div
                                    className="health-fill"
                                    style={{ width: "98%" }}
                                ></div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </AdminLayout>
    );
}

export default AdminAnalytics;