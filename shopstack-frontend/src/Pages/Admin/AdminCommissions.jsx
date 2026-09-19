import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "./AdminLayout";
import "./AdminCommissions.css";

function AdminCommissions() {

    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadCommissions = async () => {

            try {

                const response =
                    await api.get("/admin/commissions");

                console.log(
                    "COMMISSION DATA:",
                    response.data
                );

                setCommissions(response.data);

            } catch (error) {

                console.error(
                    "Commission error:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

        loadCommissions();

    }, []);


    // ===============================
    // CALCULATIONS
    // ===============================

    const totalSales = commissions.reduce(
        (sum, vendor) =>
            sum + Number(vendor.totalSales || 0),
        0
    );

    const totalCommission = commissions.reduce(
        (sum, vendor) =>
            sum + Number(vendor.commissionAmount || 0),
        0
    );

    const totalEarnings = commissions.reduce(
        (sum, vendor) =>
            sum + Number(vendor.vendorEarnings || 0),
        0
    );


    const formatCurrency = (amount) => {

        return `₹${Number(amount || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        )}`;

    };


    if (loading) {

        return (

            <AdminLayout>

                <div className="commission-loading">
                    Loading commission information...
                </div>

            </AdminLayout>

        );
    }


    return (

        <AdminLayout>

            <div className="commission-page">

                {/* ===============================
                    HEADER
                =============================== */}

                <div className="commission-header">

                    <div>

                        <span className="commission-eyebrow">
                            FINANCIAL OPERATIONS
                        </span>

                        <h1>
                            Commission Management
                        </h1>

                        <p>
                            Monitor marketplace sales,
                            platform commissions and
                            vendor earnings.
                        </p>

                    </div>

                    <div className="commission-rate">

                        <span>
                            STANDARD COMMISSION
                        </span>

                        <strong>
                            10%
                        </strong>

                    </div>

                </div>


                {/* ===============================
                    SUMMARY
                =============================== */}

                <div className="commission-summary">

                    <div className="summary-card">

                        <div className="summary-label">
                            MARKETPLACE SALES
                        </div>

                        <div className="summary-value">
                            {formatCurrency(totalSales)}
                        </div>

                        <div className="summary-description">
                            Total vendor-generated sales
                        </div>

                    </div>


                    <div className="summary-card commission">

                        <div className="summary-label">
                            PLATFORM COMMISSION
                        </div>

                        <div className="summary-value">
                            {formatCurrency(totalCommission)}
                        </div>

                        <div className="summary-description">
                            Revenue retained by ShopStack
                        </div>

                    </div>


                    <div className="summary-card earnings">

                        <div className="summary-label">
                            VENDOR EARNINGS
                        </div>

                        <div className="summary-value">
                            {formatCurrency(totalEarnings)}
                        </div>

                        <div className="summary-description">
                            Net earnings payable to vendors
                        </div>

                    </div>


                    <div className="summary-card vendors">

                        <div className="summary-label">
                            ACTIVE VENDORS
                        </div>

                        <div className="summary-value">
                            {commissions.length}
                        </div>

                        <div className="summary-description">
                            Vendors included in commission tracking
                        </div>

                    </div>

                </div>


                {/* ===============================
                    TABLE
                =============================== */}

                <div className="commission-panel">

                    <div className="panel-header">

                        <div>

                            <span>
                                VENDOR FINANCIAL BREAKDOWN
                            </span>

                            <h2>
                                Commission Overview
                            </h2>

                        </div>

                        <div className="vendor-count">

                            {commissions.length} Vendors

                        </div>

                    </div>


                    <div className="table-wrapper">

                        <table className="commission-table">

                            <thead>

                                <tr>

                                    <th>
                                        VENDOR
                                    </th>

                                    <th>
                                        EMAIL
                                    </th>

                                    <th>
                                        TOTAL SALES
                                    </th>

                                    <th>
                                        RATE
                                    </th>

                                    <th>
                                        COMMISSION
                                    </th>

                                    <th>
                                        VENDOR EARNINGS
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {commissions.map((vendor) => (

                                    <tr key={vendor.vendorId}>

                                        <td>

                                            <div className="vendor-cell">

                                                <div className="vendor-avatar">

                                                    {vendor.vendorName
                                                        ?.charAt(0)
                                                        ?.toUpperCase()}

                                                </div>

                                                <div>

                                                    <strong>
                                                        {vendor.vendorName}
                                                    </strong>

                                                    <span>
                                                        Vendor #{vendor.vendorId}
                                                    </span>

                                                </div>

                                            </div>

                                        </td>


                                        <td>

                                            <span className="email">
                                                {vendor.vendorEmail}
                                            </span>

                                        </td>


                                        <td>

                                            <strong className="sales-value">

                                                {formatCurrency(
                                                    vendor.totalSales
                                                )}

                                            </strong>

                                        </td>


                                        <td>

                                            <span className="rate-badge">

                                                {vendor.commissionRate}%

                                            </span>

                                        </td>


                                        <td>

                                            <strong className="commission-value">

                                                {formatCurrency(
                                                    vendor.commissionAmount
                                                )}

                                            </strong>

                                        </td>


                                        <td>

                                            <strong className="earnings-value">

                                                {formatCurrency(
                                                    vendor.vendorEarnings
                                                )}

                                            </strong>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>


                    {/* EMPTY STATE */}

                    {commissions.length === 0 && (

                        <div className="empty-commission">

                            No vendor commission data available.

                        </div>

                    )}

                </div>


                {/* ===============================
                    FOOTER INFORMATION
                =============================== */}

                <div className="commission-note">

                    <div>

                        <strong>
                            Commission Policy
                        </strong>

                        <p>
                            ShopStack currently applies a
                            standard 10% marketplace commission
                            to vendor sales.
                        </p>

                    </div>

                    <div className="policy-rate">
                        10%
                    </div>

                </div>

            </div>

        </AdminLayout>
    );
}

export default AdminCommissions;