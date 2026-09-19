import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "./AdminLayout";
import "./AdminVendorDetails.css";

function AdminVendorDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [vendor, setVendor] = useState(null);
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [updatingProduct, setUpdatingProduct] = useState(null);

    // =========================================================
    // LOAD VENDOR + PRODUCTS
    // =========================================================

    useEffect(() => {

        const loadData = async () => {

            try {

                const vendorResponse =
                    await api.get(`/admin/vendors/${id}`);

                console.log(
                    "VENDOR DETAILS:",
                    vendorResponse.data
                );

                setVendor(vendorResponse.data);


                const productsResponse =
                    await api.get(`/admin/vendors/${id}/products`);

                console.log(
                    "VENDOR PRODUCTS:",
                    productsResponse.data
                );

                setProducts(productsResponse.data);

            } catch (error) {

                console.error(
                    "ADMIN VENDOR DETAILS ERROR:",
                    error
                );

            } finally {

                setLoadingProducts(false);

            }
        };

        loadData();

    }, [id]);


    // =========================================================
    // UPDATE PRODUCT STATUS
    // =========================================================

    const updateProductStatus = async (
        productId,
        status
    ) => {

        try {

            setUpdatingProduct(productId);

            const response =
                await api.put(
                    `/admin/products/${productId}/status`,
                    null,
                    {
                        params: {
                            status: status
                        }
                    }
                );

            console.log(
                "PRODUCT STATUS UPDATED:",
                response.data
            );

            setProducts((currentProducts) =>
                currentProducts.map((product) =>
                    product.id === productId
                        ? {
                            ...product,
                            status: response.data.status
                        }
                        : product
                )
            );

        } catch (error) {

            console.error(
                "PRODUCT STATUS UPDATE ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to update product status"
            );

        } finally {

            setUpdatingProduct(null);

        }
    };


    // =========================================================
    // STATUS CLASS
    // =========================================================

    const getStatusClass = (status) => {

        if (status === "APPROVED") {
            return "product-status approved";
        }

        if (status === "REJECTED") {
            return "product-status rejected";
        }

        return "product-status pending";
    };


    // =========================================================
    // LOADING
    // =========================================================

    if (!vendor) {

        return (
            <AdminLayout>

                <div className="admin-vendor-loading">
                    Loading vendor details...
                </div>

            </AdminLayout>
        );
    }


    // =========================================================
    // COUNTS
    // =========================================================

    const pendingProducts =
        products.filter(
            product => product.status === "PENDING"
        );

    const approvedProducts =
        products.filter(
            product => product.status === "APPROVED"
        );

    const rejectedProducts =
        products.filter(
            product => product.status === "REJECTED"
        );


    return (

        <AdminLayout>

            <div className="admin-vendor-details-page">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="admin-vendor-details-header">

                    <div>

                        <span className="admin-page-label">
                            VENDOR MANAGEMENT
                        </span>

                        <h1>
                            Vendor Details
                        </h1>

                        <p>
                            Monitor vendor information,
                            products and marketplace activity.
                        </p>

                    </div>

                    <button
                        className="admin-back-button"
                        onClick={() =>
                            navigate("/admin/vendors")
                        }
                    >
                        Back to Vendors
                    </button>

                </div>


                {/* =================================================
                    VENDOR OVERVIEW
                ================================================= */}

                <div className="vendor-details-card">

                    <div className="vendor-details-title">

                        <div>

                            <h2>
                                {vendor.vendorName || vendor.name}
                            </h2>

                            <p>
                                Vendor ID: #
                                {vendor.vendorId || vendor.id}
                            </p>

                        </div>

                        <span className="vendor-status active">
                            ACTIVE
                        </span>

                    </div>


                    <div className="vendor-information">

                        <div className="vendor-info-item">

                            <label>
                                Vendor ID
                            </label>

                            <p>
                                #{vendor.vendorId || vendor.id}
                            </p>

                        </div>


                        <div className="vendor-info-item">

                            <label>
                                Vendor Name
                            </label>

                            <p>
                                {vendor.vendorName || vendor.name}
                            </p>

                        </div>


                        <div className="vendor-info-item">

                            <label>
                                Email
                            </label>

                            <p>
                                {vendor.email}
                            </p>

                        </div>


                        <div className="vendor-info-item">

                            <label>
                                Account Role
                            </label>

                            <p>
                                {vendor.role}
                            </p>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div className="vendor-statistics">

                    <div className="vendor-stat-card">

                        <h3>
                            Total Products
                        </h3>

                        <p>
                            {products.length}
                        </p>

                    </div>


                    <div className="vendor-stat-card">

                        <h3>
                            Pending Approval
                        </h3>

                        <p className="pending-number">
                            {pendingProducts.length}
                        </p>

                    </div>


                    <div className="vendor-stat-card">

                        <h3>
                            Approved Products
                        </h3>

                        <p className="approved-number">
                            {approvedProducts.length}
                        </p>

                    </div>


                    <div className="vendor-stat-card">

                        <h3>
                            Rejected Products
                        </h3>

                        <p className="rejected-number">
                            {rejectedProducts.length}
                        </p>

                    </div>

                </div>


                {/* =================================================
                    PRODUCTS
                ================================================= */}

                <section className="vendor-products-section">

                    <div className="vendor-products-header">

                        <div>

                            <span className="admin-page-label">
                                PRODUCT REVIEW
                            </span>

                            <h2>
                                Vendor Products
                            </h2>

                            <p>
                                Review vendor products and
                                approve or reject pending listings.
                            </p>

                        </div>

                        <div className="product-count-badge">
                            {products.length} Products
                        </div>

                    </div>


                    {/* =================================================
                        PRODUCT LIST
                    ================================================= */}

                    {loadingProducts ? (

                        <div className="products-loading">
                            Loading products...
                        </div>

                    ) : products.length === 0 ? (

                        <div className="products-empty">
                            No products found for this vendor.
                        </div>

                    ) : (

                        <div className="admin-products-grid">

                            {products.map((product) => (

                                <div
                                    className="admin-product-card"
                                    key={product.id}
                                >

                                    {/* IMAGE */}

                                    <div className="admin-product-image">

                                        {product.imageUrl ? (

                                            <img
                                                src={product.imageUrl}
                                                alt={product.productName}
                                            />

                                        ) : (

                                            <div className="no-product-image">
                                                No Image
                                            </div>

                                        )}

                                    </div>


                                    {/* CONTENT */}

                                    <div className="admin-product-content">

                                        <div className="product-top-row">

                                            <span className="product-category">
                                                {product.category}
                                            </span>

                                            <span
                                                className={getStatusClass(
                                                    product.status
                                                )}
                                            >
                                                {product.status}
                                            </span>

                                        </div>


                                        <h3>
                                            {product.productName}
                                        </h3>


                                        <p className="product-brand">
                                            Brand: {product.brand || "Not provided"}
                                        </p>


                                        <p className="product-description">

                                            {product.description
                                                ? product.description
                                                : "No description provided."}

                                        </p>


                                        {/* PRICE */}

                                        <div className="admin-product-price">

                                            <strong>
                                                ₹
                                                {Number(
                                                    product.discountedPrice ??
                                                    product.price ??
                                                    0
                                                ).toLocaleString("en-IN")}
                                            </strong>

                                            {product.discountPercentage > 0 && (

                                                <span>
                                                    {product.discountPercentage}% OFF
                                                </span>

                                            )}

                                        </div>


                                        {/* STOCK */}

                                        <div className="product-stock">

                                            <span>
                                                Stock
                                            </span>

                                            <strong>
                                                {product.stockQuantity ?? 0}
                                            </strong>

                                        </div>


                                        {/* ACTIONS */}

                                        {product.status === "PENDING" && (

                                            <div className="product-actions">

                                                <button
                                                    className="approve-product-button"
                                                    disabled={
                                                        updatingProduct ===
                                                        product.id
                                                    }
                                                    onClick={() =>
                                                        updateProductStatus(
                                                            product.id,
                                                            "APPROVED"
                                                        )
                                                    }
                                                >

                                                    {updatingProduct === product.id
                                                        ? "Updating..."
                                                        : "Approve"}

                                                </button>


                                                <button
                                                    className="reject-product-button"
                                                    disabled={
                                                        updatingProduct ===
                                                        product.id
                                                    }
                                                    onClick={() =>
                                                        updateProductStatus(
                                                            product.id,
                                                            "REJECTED"
                                                        )
                                                    }
                                                >

                                                    Reject

                                                </button>

                                            </div>

                                        )}


                                        {product.status === "APPROVED" && (

                                            <div className="product-approved-message">
                                                Product approved and available
                                                for marketplace listing.
                                            </div>

                                        )}


                                        {product.status === "REJECTED" && (

                                            <div className="product-rejected-message">
                                                Product rejected by administrator.
                                            </div>

                                        )}

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </div>

        </AdminLayout>
    );
}

export default AdminVendorDetails;