import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "./AdminLayout";
import "./AdminReports.css";

function AdminReports() {

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeReport, setActiveReport] = useState(null);

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async () => {

        try {

            setLoading(true);

            const response =
                await api.get("/admin/reports/summary");

            console.log("REPORT:", response.data);

            setReport(response.data);

        } catch (error) {

            console.error(
                "Report loading error:",
                error
            );

        } finally {

            setLoading(false);
        }
    };


    const money = (value) =>
        Number(value || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });


    // =====================================================
    // EXPORT CSV
    // =====================================================

    const exportCSV = () => {

        if (!report) return;

        const rows = [

            ["SHOPSTACK BUSINESS REPORT"],
            ["Generated", new Date().toLocaleString()],
            [],

            ["FINANCIAL SUMMARY"],
            ["Marketplace Sales", report.totalSales],
            ["Platform Commission", report.platformCommission],
            ["Vendor Earnings", report.vendorEarnings],
            ["Commission Rate", `${report.commissionRate}%`],
            [],

            ["ORDER PERFORMANCE"],
            ["Total Orders", report.totalOrders],
            ["Pending Orders", report.pendingOrders],
            ["Confirmed Orders", report.confirmedOrders],
            ["Delivered Orders", report.deliveredOrders],
            ["Cancelled Orders", report.cancelledOrders],
            [],

            ["MARKETPLACE SCALE"],
            ["Customers", report.totalCustomers],
            ["Vendors", report.totalVendors],
            ["Products", report.totalProducts],
            ["Orders", report.totalOrders]

        ];

        const csvContent =
            rows
                .map(row =>
                    row
                        .map(value =>
                            `"${String(value ?? "")
                                .replace(/"/g, '""')}"`
                        )
                        .join(",")
                )
                .join("\n");


        const blob =
            new Blob(
                [csvContent],
                {
                    type: "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            `ShopStack_Business_Report_${new Date()
                .toISOString()
                .slice(0, 10)}.csv`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };


    // =====================================================
    // PRINT / PDF
    // =====================================================

    const printReport = () => {

        window.print();

    };


    // =====================================================
    // REPORT DETAIL
    // =====================================================

    const openReport = (type) => {

        setActiveReport(type);

    };


    const closeReport = () => {

        setActiveReport(null);

    };


    if (loading) {

        return (

            <AdminLayout>

                <div className="reports-loading">
                    <div className="loading-spinner"></div>

                    <span>
                        Loading business reports...
                    </span>
                </div>

            </AdminLayout>
        );
    }


    if (!report) {

        return (

            <AdminLayout>

                <div className="reports-error">

                    <strong>
                        Unable to load business report
                    </strong>

                    <button onClick={loadReport}>
                        Try Again
                    </button>

                </div>

            </AdminLayout>
        );
    }


    return (

        <AdminLayout>

            <div className="reports-page">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="reports-header">

                    <div>

                        <span className="reports-eyebrow">
                            BUSINESS INTELLIGENCE
                        </span>

                        <h1>
                            Business Reports
                        </h1>

                        <p>
                            Analyze marketplace performance,
                            sales activity and financial operations.
                        </p>

                    </div>


                    <div className="reports-actions">

                        <button
                            className="secondary-action"
                            onClick={loadReport}
                        >
                            Refresh
                        </button>

                        <button
                            className="primary-action"
                            onClick={exportCSV}
                        >
                            Export CSV
                        </button>

                    </div>

                </div>


                {/* =================================================
                    REPORT META
                ================================================= */}

                <div className="report-meta">

                    <div>
                        <span>REPORT STATUS</span>

                        <strong>
                            Live Data
                        </strong>
                    </div>

                    <div>
                        <span>COMMISSION MODEL</span>

                        <strong>
                            Standard {report.commissionRate}%
                        </strong>
                    </div>

                    <div>
                        <span>DATA SOURCE</span>

                        <strong>
                            ShopStack PostgreSQL
                        </strong>
                    </div>

                    <div>
                        <span>GENERATED</span>

                        <strong>
                            {new Date().toLocaleString()}
                        </strong>
                    </div>

                </div>


                {/* =================================================
                    KPI CARDS
                ================================================= */}

                <div className="report-kpis">


                    <button
                        className="report-kpi sales"
                        onClick={() =>
                            openReport("financial")
                        }
                    >

                        <span>
                            MARKETPLACE SALES
                        </span>

                        <strong>
                            ₹{money(report.totalSales)}
                        </strong>

                        <small>
                            Total recorded sales
                        </small>

                        <b>
                            View financial report →
                        </b>

                    </button>


                    <button
                        className="report-kpi orders"
                        onClick={() =>
                            openReport("orders")
                        }
                    >

                        <span>
                            TOTAL ORDERS
                        </span>

                        <strong>
                            {report.totalOrders}
                        </strong>

                        <small>
                            Marketplace orders
                        </small>

                        <b>
                            View order report →
                        </b>

                    </button>


                    <button
                        className="report-kpi commission"
                        onClick={() =>
                            openReport("financial")
                        }
                    >

                        <span>
                            PLATFORM COMMISSION
                        </span>

                        <strong>
                            ₹{money(report.platformCommission)}
                        </strong>

                        <small>
                            {report.commissionRate}% standard rate
                        </small>

                        <b>
                            View commission report →
                        </b>

                    </button>


                    <button
                        className="report-kpi earnings"
                        onClick={() =>
                            openReport("financial")
                        }
                    >

                        <span>
                            VENDOR EARNINGS
                        </span>

                        <strong>
                            ₹{money(report.vendorEarnings)}
                        </strong>

                        <small>
                            Net vendor earnings
                        </small>

                        <b>
                            View earnings report →
                        </b>

                    </button>

                </div>


                {/* =================================================
                    REPORT MODULES
                ================================================= */}

                <div className="report-grid">


                    {/* ORDER REPORT */}

                    <button
                        className="report-panel clickable-panel"
                        onClick={() =>
                            openReport("orders")
                        }
                    >

                        <div className="report-panel-header">

                            <div>

                                <span>
                                    ORDER REPORT
                                </span>

                                <h2>
                                    Order Performance
                                </h2>

                            </div>

                            <strong>
                                {report.totalOrders}
                            </strong>

                        </div>


                        <div className="report-row">

                            <span>
                                Pending
                            </span>

                            <strong>
                                {report.pendingOrders}
                            </strong>

                        </div>


                        <div className="report-row">

                            <span>
                                Confirmed
                            </span>

                            <strong>
                                {report.confirmedOrders}
                            </strong>

                        </div>


                        <div className="report-row">

                            <span>
                                Delivered
                            </span>

                            <strong>
                                {report.deliveredOrders}
                            </strong>

                        </div>


                        <div className="report-row">

                            <span>
                                Cancelled
                            </span>

                            <strong>
                                {report.cancelledOrders}
                            </strong>

                        </div>


                        <div className="panel-link">
                            Open detailed order report →
                        </div>

                    </button>


                    {/* MARKETPLACE REPORT */}

                    <button
                        className="report-panel clickable-panel"
                        onClick={() =>
                            openReport("marketplace")
                        }
                    >

                        <div className="report-panel-header">

                            <div>

                                <span>
                                    MARKETPLACE REPORT
                                </span>

                                <h2>
                                    Marketplace Scale
                                </h2>

                            </div>

                        </div>


                        <div className="report-row">

                            <span>
                                Customers
                            </span>

                            <strong>
                                {report.totalCustomers}
                            </strong>

                        </div>


                        <div className="report-row">

                            <span>
                                Vendors
                            </span>

                            <strong>
                                {report.totalVendors}
                            </strong>

                        </div>


                        <div className="report-row">

                            <span>
                                Products
                            </span>

                            <strong>
                                {report.totalProducts}
                            </strong>

                        </div>


                        <div className="report-row">

                            <span>
                                Orders
                            </span>

                            <strong>
                                {report.totalOrders}
                            </strong>

                        </div>


                        <div className="panel-link">
                            Open marketplace report →
                        </div>

                    </button>

                </div>


                {/* =================================================
                    FINANCIAL OPERATIONS
                ================================================= */}

                <section
                    className="financial-panel clickable-panel"
                    onClick={() =>
                        openReport("financial")
                    }
                >

                    <div className="report-panel-header">

                        <div>

                            <span>
                                FINANCIAL OPERATIONS
                            </span>

                            <h2>
                                Revenue Distribution
                            </h2>

                        </div>

                        <span className="view-report">
                            View financial details →
                        </span>

                    </div>


                    <div className="financial-grid">

                        <div>

                            <span>
                                Gross Marketplace Sales
                            </span>

                            <strong>
                                ₹{money(report.totalSales)}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Platform Commission
                            </span>

                            <strong>
                                ₹{money(report.platformCommission)}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Vendor Earnings
                            </span>

                            <strong>
                                ₹{money(report.vendorEarnings)}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Commission Rate
                            </span>

                            <strong>
                                {report.commissionRate}%
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    FOOTER ACTIONS
                ================================================= */}

                <div className="reports-footer">

                    <div>

                        <strong>
                            Report generated from live marketplace data
                        </strong>

                        <span>
                            Use CSV export for spreadsheet analysis
                            or print the report as PDF.
                        </span>

                    </div>


                    <button
                        className="print-button"
                        onClick={printReport}
                    >
                        Print / Save PDF
                    </button>

                </div>


                {/* =================================================
                    DETAIL MODAL
                ================================================= */}

                {activeReport && (

                    <div
                        className="report-modal-overlay"
                        onClick={closeReport}
                    >

                        <div
                            className="report-modal"
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                        >

                            <div className="modal-header">

                                <div>

                                    <span>
                                        SHOPSTACK REPORT
                                    </span>

                                    <h2>

                                        {activeReport === "orders" &&
                                            "Order Performance Report"}

                                        {activeReport === "marketplace" &&
                                            "Marketplace Scale Report"}

                                        {activeReport === "financial" &&
                                            "Financial Operations Report"}

                                    </h2>

                                </div>


                                <button
                                    className="modal-close"
                                    onClick={closeReport}
                                >
                                    ×
                                </button>

                            </div>


                            {/* ORDER DETAIL */}

                            {activeReport === "orders" && (

                                <div className="modal-content">

                                    <div className="detail-stat">
                                        <span>Total Orders</span>
                                        <strong>{report.totalOrders}</strong>
                                    </div>

                                    <div className="detail-stat">
                                        <span>Pending Orders</span>
                                        <strong>{report.pendingOrders}</strong>
                                    </div>

                                    <div className="detail-stat">
                                        <span>Confirmed Orders</span>
                                        <strong>{report.confirmedOrders}</strong>
                                    </div>

                                    <div className="detail-stat">
                                        <span>Delivered Orders</span>
                                        <strong>{report.deliveredOrders}</strong>
                                    </div>

                                    <div className="detail-stat">
                                        <span>Cancelled Orders</span>
                                        <strong>{report.cancelledOrders}</strong>
                                    </div>

                                </div>

                            )}


                            {/* MARKETPLACE DETAIL */}

                            {activeReport === "marketplace" && (

                                <div className="modal-content">

                                    <div className="detail-stat">
                                        <span>Total Customers</span>
                                        <strong>{report.totalCustomers}</strong>
                                    </div>

                                    <div className="detail-stat">
                                        <span>Total Vendors</span>
                                        <strong>{report.totalVendors}</strong>
                                    </div>

                                    <div className="detail-stat">
                                        <span>Total Products</span>
                                        <strong>{report.totalProducts}</strong>
                                    </div>

                                    <div className="detail-stat">
                                        <span>Total Orders</span>
                                        <strong>{report.totalOrders}</strong>
                                    </div>

                                </div>

                            )}


                            {/* FINANCIAL DETAIL */}

                            {activeReport === "financial" && (

                                <div className="modal-content">

                                    <div className="detail-stat">
                                        <span>Gross Marketplace Sales</span>
                                        <strong>
                                            ₹{money(report.totalSales)}
                                        </strong>
                                    </div>

                                    <div className="detail-stat">
                                        <span>Platform Commission</span>
                                        <strong>
                                            ₹{money(report.platformCommission)}
                                        </strong>
                                    </div>

                                    <div className="detail-stat">
                                        <span>Vendor Earnings</span>
                                        <strong>
                                            ₹{money(report.vendorEarnings)}
                                        </strong>
                                    </div>

                                    <div className="detail-stat">
                                        <span>Commission Rate</span>
                                        <strong>
                                            {report.commissionRate}%
                                        </strong>
                                    </div>

                                </div>

                            )}


                            <div className="modal-footer">

                                <button
                                    className="secondary-action"
                                    onClick={closeReport}
                                >
                                    Close
                                </button>

                                <button
                                    className="primary-action"
                                    onClick={exportCSV}
                                >
                                    Export Report
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </AdminLayout>
    );
}

export default AdminReports;