
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "./AdminLayout";
import "./AdminVendorManagement.css";

function AdminVendorManagement() {

    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {

        loadVendors();

    }, []);

    const loadVendors = async () => {

        try {

            const response =
                await api.get("/admin/vendors");

            console.log(
                "ADMIN VENDORS:",
                response.data
            );

            setVendors(response.data);

        } catch (error) {

            console.error(
                "VENDOR MANAGEMENT ERROR:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    const getStatusClass = (status) => {

        if (!status) {
            return "vendor-status";
        }

        return `vendor-status ${status.toLowerCase()}`;
    };


    const getStatusLabel = (status) => {

        if (!status) {
            return "UNKNOWN";
        }

        return status.replace("_", " ");

    };


    if (loading) {

        return (

            <AdminLayout>

                <div className="admin-vendors-loading">
                    Loading vendors...
                </div>

            </AdminLayout>
        );
    }


    return (

        <AdminLayout>

            <div className="admin-vendors-page">


                {/* =====================================
                    HEADER
                ===================================== */}

                <div className="admin-vendors-header">

                    <div>

                        <span className="admin-vendors-label">
                            ADMINISTRATION
                        </span>

                        <h1>
                            Vendor Management
                        </h1>

                        <p>
                            View vendor details and monitor
                            vendor status.
                        </p>

                    </div>


                    <div className="admin-vendor-count">

                        <strong>
                            {vendors.length}
                        </strong>

                        <span>
                            Vendors
                        </span>

                    </div>

                </div>


                {/* =====================================
                    VENDOR TABLE
                ===================================== */}

                <div className="admin-vendors-card">


                    {/* TABLE HEADER */}

                    <div className="admin-vendors-table-header">

                        <span>
                            Vendor
                        </span>

                        <span>
                            Email
                        </span>

                        <span>
                            Phone
                        </span>

                        <span>
                            Location
                        </span>

                        <span>
                            Status
                        </span>

                        <span>
                            Action
                        </span>

                    </div>


                    {/* VENDOR ROWS */}

                    {vendors.map((vendor) => (

                        <div
                            className="admin-vendor-row"
                            key={vendor.id}
                        >


                            {/* VENDOR */}

                            <div className="admin-vendor-details">

                                <strong>
                                    {vendor.name || "Unnamed Vendor"}
                                </strong>

                                <small>
                                    Vendor ID: #{vendor.id}
                                </small>

                            </div>


                            {/* EMAIL */}

                            <span className="vendor-email">

                                {vendor.email || "Not provided"}

                            </span>


                            {/* PHONE */}

                            <span>

                                {vendor.phoneNumber ||
                                    "Not provided"}

                            </span>


                            {/* LOCATION */}

                            <span>

                                {vendor.city
                                    ? `${vendor.city}${
                                        vendor.state
                                            ? ", " + vendor.state
                                            : ""
                                    }`
                                    : "Not provided"}

                            </span>


                            {/* STATUS */}

                            <span
                                className={getStatusClass(
                                    vendor.vendorStatus
                                )}
                            >

                                {getStatusLabel(
                                    vendor.vendorStatus
                                )}

                            </span>


                            {/* ACTION */}

                            <button
                                className="view-vendor-button"
                                onClick={() =>
                                    navigate(
                                        `/admin/vendors/${vendor.id}`
                                    )
                                }
                            >
                                View Details
                            </button>

                        </div>

                    ))}


                    {/* EMPTY STATE */}

                    {vendors.length === 0 && (

                        <div className="admin-vendors-empty">

                            <strong>
                                No vendors found
                            </strong>

                            <p>
                                Vendor accounts will appear here
                                after registration.
                            </p>

                        </div>

                    )}

                </div>

            </div>

        </AdminLayout>
    );
}

export default AdminVendorManagement;

