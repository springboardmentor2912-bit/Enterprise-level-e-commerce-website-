import { useEffect, useState } from "react";
import api from "../services/api";
import "./CustomerOrderManagement.css";

function CustomerOrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [processingOrderId, setProcessingOrderId] = useState(null);

    // =========================================================
    // FRIENDLY ERROR HANDLER
    // =========================================================

    const getFriendlyError = (err, defaultMessage) => {
        if (!err.response) {
            return "Unable to connect to the server. Please check your connection and try again.";
        }

        const status = err.response?.status;

        const backendMessage =
            err.response?.data?.message ||
            err.response?.data?.error ||
            "";

        const message = String(backendMessage).toLowerCase();

        if (status === 401) {
            return "Your session has expired. Please login again.";
        }

        if (status === 403) {
            return "You are not authorized to perform this action.";
        }

        if (status === 404) {
            return "The requested order could not be found.";
        }

        if (status === 400) {
            if (
                message.includes("cancel") ||
                message.includes("cannot")
            ) {
                return "This order cannot be cancelled at its current status.";
            }

            if (
                message.includes("return") ||
                message.includes("delivered")
            ) {
                return "This order is not eligible for return.";
            }

            if (message.includes("refund")) {
                return "Refund could not be processed for this order.";
            }

            return (
                backendMessage ||
                "Please check the order details and try again."
            );
        }

        if (status >= 500) {
            return "Server error. Please try again later.";
        }

        return backendMessage || defaultMessage;
    };

    // =========================================================
    // LOAD ORDERS
    // =========================================================

    const loadOrders = async (showLoader = true) => {
        try {
            if (showLoader) {
                setLoading(true);
            }

            setError("");
            setActionError("");

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please login as Customer.");
                setLoading(false);
                return;
            }

            const response = await api.get("/customer/orders");

            console.log("CUSTOMER ORDERS RESPONSE:", response.data);

            if (Array.isArray(response.data)) {
                setOrders(response.data);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error("Unable to load orders:", err);

            setError(
                getFriendlyError(
                    err,
                    "Unable to load your orders."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // CANCEL ORDER
    // =========================================================

    const handleCancelOrder = async (orderId) => {
        if (processingOrderId !== null) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to cancel this order?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessingOrderId(orderId);
            setActionError("");
            setSuccessMessage("");

            const token = localStorage.getItem("token");

            if (!token) {
                setActionError(
                    "Your session has expired. Please login again."
                );
                return;
            }

            await api.put(
                `/customer/orders/${orderId}/cancel`,
                {}
            );

            setSuccessMessage(
                `Order #${orderId} has been cancelled successfully.`
            );

            await loadOrders(false);
        } catch (err) {
            console.error("Cancel order error:", err);

            setActionError(
                getFriendlyError(
                    err,
                    "Unable to cancel the order."
                )
            );
        } finally {
            setProcessingOrderId(null);
        }
    };

    // =========================================================
    // REQUEST RETURN
    // =========================================================

    const handleReturnOrder = async (orderId) => {
        if (processingOrderId !== null) {
            return;
        }

        const reason = window.prompt(
            "Please enter the reason for returning this order:"
        );

        if (reason === null) {
            return;
        }

        if (!reason.trim()) {
            setActionError("Please provide a return reason.");
            return;
        }

        try {
            setProcessingOrderId(orderId);
            setActionError("");
            setSuccessMessage("");

            const token = localStorage.getItem("token");

            if (!token) {
                setActionError(
                    "Your session has expired. Please login again."
                );
                return;
            }

            await api.put(
                `/customer/orders/${orderId}/return`,
                JSON.stringify(reason.trim()),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            setSuccessMessage(
                `Return request for Order #${orderId} has been submitted successfully.`
            );

            await loadOrders(false);
        } catch (err) {
            console.error("Return order error:", err);

            setActionError(
                getFriendlyError(
                    err,
                    "Unable to submit the return request."
                )
            );
        } finally {
            setProcessingOrderId(null);
        }
    };

    // =========================================================
    // LOAD ORDERS WHEN PAGE OPENS
    // =========================================================

    useEffect(() => {
        const timer = setTimeout(() => {
            loadOrders(false);
        }, 0);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    // =========================================================
    // STATUS CLASS
    // =========================================================

    const getStatusClass = (status) => {
        switch (status?.toUpperCase()) {
            case "PENDING":
                return "status-pending";

            case "CONFIRMED":
                return "status-confirmed";

            case "SHIPPED":
                return "status-shipped";

            case "DELIVERED":
                return "status-delivered";

            case "CANCELLED":
                return "status-cancelled";

            default:
                return "status-pending";
        }
    };

    // =========================================================
    // STATUS STEP
    // =========================================================

    const getStatusStep = (status) => {
        switch (status?.toUpperCase()) {
            case "PENDING":
                return 1;

            case "CONFIRMED":
                return 2;

            case "SHIPPED":
                return 3;

            case "DELIVERED":
                return 4;

            default:
                return 1;
        }
    };

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "N/A";
        }

        return parsedDate.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // =========================================================
    // ITEM COUNT
    // =========================================================

    const calculateItemsCount = (items) => {
        if (!Array.isArray(items)) {
            return 0;
        }

        return items.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="orders-page">
                <div className="orders-loading">
                    <div className="loading-spinner"></div>

                    <p>
                        Loading your orders...
                    </p>
                </div>
            </div>
        );
    }

    // =========================================================
    // MAIN UI
    // =========================================================

    return (
        <div className="orders-page">

            {/* PAGE HEADER */}

            <div className="orders-page-header">

                <div className="orders-title-row">

                    <span className="orders-title-icon">
                        🛍️
                    </span>

                    <div>
                        <h1>
                            My Orders
                        </h1>

                        <p>
                            View your orders and track their status.
                        </p>
                    </div>

                </div>

                <button
                    className="refresh-orders-btn"
                    onClick={() => loadOrders(true)}
                    disabled={processingOrderId !== null}
                >
                    ↻ Refresh
                </button>

            </div>

            {/* LOAD ERROR */}

            {error && (
                <div className="orders-error">

                    <span>
                        ⚠️
                    </span>

                    <p>
                        {error}
                    </p>

                </div>
            )}

            {/* ACTION ERROR */}

            {actionError && (
                <div className="orders-error">

                    <span>
                        ⚠️
                    </span>

                    <p>
                        {actionError}
                    </p>

                </div>
            )}

            {/* SUCCESS */}

            {successMessage && (
                <div className="orders-success">

                    <span>
                        ✓
                    </span>

                    <p>
                        {successMessage}
                    </p>

                </div>
            )}

            {/* EMPTY */}

            {!error && orders.length === 0 && (
                <div className="empty-orders">

                    <div className="empty-orders-icon">
                        🛍️
                    </div>

                    <h2>
                        No Orders Yet
                    </h2>

                    <p>
                        You haven't placed any orders yet.
                        Start shopping to see your orders here.
                    </p>

                </div>
            )}

            {/* ORDERS */}

            <div className="orders-list">

                {orders.map((order) => {

                    const currentStep =
                        getStatusStep(order.status);

                    const itemCount =
                        calculateItemsCount(order.items);

                    const orderStatus =
                        order.status?.toUpperCase();

                    const returnStatus =
                        order.returnStatus?.toUpperCase();

                    const canCancel =
                        orderStatus === "PENDING" ||
                        orderStatus === "CONFIRMED";

                    const canReturn =
                        orderStatus === "DELIVERED" &&
                        (!returnStatus ||
                            returnStatus === "NONE");

                    const isProcessing =
                        processingOrderId === order.id;

                    const isRefunded =
                        returnStatus === "REFUNDED";

                    return (

                        <div
                            className="order-card"
                            key={order.id}
                        >

                            {/* ORDER HEADER */}

                            <div className="order-card-header">

                                <div className="order-info">

                                    <div className="order-number">
                                        Order #{order.id}
                                    </div>

                                    <div className="order-date">
                                        📅{" "}
                                        {formatDate(
                                            order.orderDate
                                        )}
                                    </div>

                                </div>

                                <div
                                    className={`order-status ${getStatusClass(
                                        order.status
                                    )}`}
                                >
                                    {order.status}
                                </div>

                            </div>

                            {/* ORDER SUMMARY */}

                            <div className="order-summary">

                                <div className="summary-item">

                                    <span className="summary-icon">
                                        📦
                                    </span>

                                    <div>
                                        <small>
                                            Items
                                        </small>

                                        <strong>
                                            {itemCount}
                                        </strong>
                                    </div>

                                </div>

                                <div className="summary-item">

                                    <span className="summary-icon">
                                        💰
                                    </span>

                                    <div>
                                        <small>
                                            Total Amount
                                        </small>

                                        <strong>
                                            ₹
                                            {Number(
                                                order.totalAmount || 0
                                            ).toFixed(2)}
                                        </strong>
                                    </div>

                                </div>

                                <div className="summary-item">

                                    <span className="summary-icon">
                                        🚚
                                    </span>

                                    <div>
                                        <small>
                                            Status
                                        </small>

                                        <strong>
                                            {order.status}
                                        </strong>
                                    </div>

                                </div>

                            </div>

                            {/* PRODUCTS */}

                            <div className="order-products-section">

                                <div className="section-heading">

                                    <h3>
                                        Products
                                    </h3>

                                    <span>
                                        {itemCount} item
                                        {itemCount !== 1
                                            ? "s"
                                            : ""}
                                    </span>

                                </div>

                                <div className="order-products">

                                    {Array.isArray(order.items) &&
                                        order.items.map(
                                            (item, index) => (

                                                <div
                                                    className="order-product"
                                                    key={
                                                        item.id ||
                                                        `${order.id}-${index}`
                                                    }
                                                >

                                                    {/* IMAGE */}

                                                    <div className="product-image-container">

                                                        {item.imageUrl ? (

                                                            <img
                                                                src={
                                                                    item.imageUrl
                                                                }
                                                                alt={
                                                                    item.productName ||
                                                                    "Product"
                                                                }
                                                                className="product-image"
                                                                onError={(e) => {

                                                                    e.currentTarget.style.display =
                                                                        "none";

                                                                    if (
                                                                        e.currentTarget
                                                                            .nextElementSibling
                                                                    ) {
                                                                        e.currentTarget.nextElementSibling.style.display =
                                                                            "flex";
                                                                    }

                                                                }}
                                                            />

                                                        ) : null}

                                                        <div
                                                            className="product-image-placeholder"
                                                            style={{
                                                                display:
                                                                    item.imageUrl
                                                                        ? "none"
                                                                        : "flex",
                                                            }}
                                                        >
                                                            🛒
                                                        </div>

                                                    </div>

                                                    {/* DETAILS */}

                                                    <div className="product-details">

                                                        <h4>
                                                            {
                                                                item.productName
                                                            }
                                                        </h4>

                                                        <div className="product-meta">

                                                            <span>
                                                                Quantity:{" "}
                                                                <strong>
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </strong>
                                                            </span>

                                                            <span className="meta-divider">
                                                                •
                                                            </span>

                                                            <span>
                                                                Price:{" "}
                                                                <strong>
                                                                    ₹
                                                                    {Number(
                                                                        item.price ||
                                                                            0
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                </strong>
                                                            </span>

                                                        </div>

                                                        <div className="vendor-name">

                                                            Vendor:{" "}
                                                            {
                                                                item.vendorEmail
                                                            }

                                                        </div>

                                                    </div>

                                                    {/* SUBTOTAL */}

                                                    <div className="product-subtotal">

                                                        <small>
                                                            Subtotal
                                                        </small>

                                                        <strong>
                                                            ₹
                                                            {Number(
                                                                item.subtotal ||
                                                                    0
                                                            ).toFixed(2)}
                                                        </strong>

                                                    </div>

                                                </div>

                                            )
                                        )}

                                </div>

                            </div>

                            {/* TOTAL */}

                            <div className="order-total-section">

                                <span>
                                    Total Amount
                                </span>

                                <strong>
                                    ₹
                                    {Number(
                                        order.totalAmount || 0
                                    ).toFixed(2)}
                                </strong>

                            </div>

                            {/* ORDER ACTIONS */}

                            {(canCancel || canReturn) && (

                                <div
                                    className="order-actions"
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        marginTop: "15px",
                                        flexWrap: "wrap",
                                    }}
                                >

                                    {canCancel && (

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleCancelOrder(
                                                    order.id
                                                )
                                            }
                                            disabled={
                                                processingOrderId !==
                                                null
                                            }
                                            style={{
                                                cursor:
                                                    processingOrderId !==
                                                    null
                                                        ? "not-allowed"
                                                        : "pointer",
                                            }}
                                        >
                                            {isProcessing
                                                ? "Processing..."
                                                : "Cancel Order"}
                                        </button>

                                    )}

                                    {canReturn && (

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleReturnOrder(
                                                    order.id
                                                )
                                            }
                                            disabled={
                                                processingOrderId !==
                                                null
                                            }
                                            style={{
                                                cursor:
                                                    processingOrderId !==
                                                    null
                                                        ? "not-allowed"
                                                        : "pointer",
                                            }}
                                        >
                                            {isProcessing
                                                ? "Processing..."
                                                : "Request Return"}
                                        </button>

                                    )}

                                </div>

                            )}

                            {/* =================================================
                                RETURN / REFUND SECTION
                               ================================================= */}

                            {returnStatus && (
                                <div
                                    className="return-refund-section"
                                    style={{
                                        marginTop: "20px",
                                        padding: "18px",
                                        borderRadius: "12px",
                                        border: isRefunded
                                            ? "1px solid #86efac"
                                            : "1px solid #e5e7eb",
                                        background: isRefunded
                                            ? "#f0fdf4"
                                            : "#f9fafb",
                                    }}
                                >

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: "12px",
                                            flexWrap: "wrap",
                                        }}
                                    >

                                        <h3
                                            style={{
                                                margin: 0,
                                            }}
                                        >
                                            🔄 Return & Refund
                                        </h3>

                                        <span
                                            style={{
                                                fontWeight: 700,
                                                color: isRefunded
                                                    ? "#15803d"
                                                    : "#374151",
                                            }}
                                        >
                                            {returnStatus}
                                        </span>

                                    </div>

                                    {/* RETURN REQUESTED */}

                                    {returnStatus ===
                                        "RETURN_REQUESTED" && (
                                        <div
                                            style={{
                                                marginTop: "12px",
                                            }}
                                        >
                                            <p>
                                                Your return request has
                                                been submitted and is
                                                waiting for admin approval.
                                            </p>

                                            {order.returnReason && (
                                                <p>
                                                    <strong>
                                                        Reason:
                                                    </strong>{" "}
                                                    {order.returnReason}
                                                </p>
                                            )}

                                            {order.returnRequestedDate && (
                                                <p>
                                                    <strong>
                                                        Requested on:
                                                    </strong>{" "}
                                                    {formatDate(
                                                        order.returnRequestedDate
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* RETURN APPROVED */}

                                    {returnStatus ===
                                        "RETURN_APPROVED" && (
                                        <div
                                            style={{
                                                marginTop: "12px",
                                            }}
                                        >
                                            <p>
                                                ✅ Your return has been
                                                approved.
                                            </p>

                                            <p>
                                                Your refund is being
                                                processed.
                                            </p>

                                            {order.refundAmount != null && (
                                                <p>
                                                    <strong>
                                                        Refund Amount:
                                                    </strong>{" "}
                                                    ₹
                                                    {Number(
                                                        order.refundAmount
                                                    ).toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* RETURN REJECTED */}

                                    {returnStatus ===
                                        "RETURN_REJECTED" && (
                                        <div
                                            style={{
                                                marginTop: "12px",
                                            }}
                                        >
                                            <p>
                                                ❌ Your return request has
                                                been rejected.
                                            </p>

                                            {order.returnReason && (
                                                <p>
                                                    <strong>
                                                        Reason:
                                                    </strong>{" "}
                                                    {order.returnReason}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* REFUNDED */}

                                    {isRefunded && (
                                        <div
                                            style={{
                                                marginTop: "15px",
                                                paddingTop: "15px",
                                                borderTop:
                                                    "1px solid #bbf7d0",
                                            }}
                                        >

                                            <div
                                                style={{
                                                    fontSize: "18px",
                                                    fontWeight: 700,
                                                    color: "#15803d",
                                                    marginBottom: "12px",
                                                }}
                                            >
                                                ✅ Refund completed
                                                successfully
                                            </div>

                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "repeat(auto-fit, minmax(200px, 1fr))",
                                                    gap: "12px",
                                                }}
                                            >

                                                <div>
                                                    <small
                                                        style={{
                                                            display:
                                                                "block",
                                                            color:
                                                                "#6b7280",
                                                            marginBottom:
                                                                "4px",
                                                        }}
                                                    >
                                                        Refund Amount
                                                    </small>

                                                    <strong
                                                        style={{
                                                            fontSize:
                                                                "17px",
                                                            color:
                                                                "#15803d",
                                                        }}
                                                    >
                                                        ₹
                                                        {Number(
                                                            order.refundAmount ??
                                                                order.totalAmount ??
                                                                0
                                                        ).toFixed(2)}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <small
                                                        style={{
                                                            display:
                                                                "block",
                                                            color:
                                                                "#6b7280",
                                                            marginBottom:
                                                                "4px",
                                                        }}
                                                    >
                                                        Transaction ID
                                                    </small>

                                                    <strong
                                                        style={{
                                                            wordBreak:
                                                                "break-all",
                                                        }}
                                                    >
                                                        {order.refundTransactionId ||
                                                            "N/A"}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <small
                                                        style={{
                                                            display:
                                                                "block",
                                                            color:
                                                                "#6b7280",
                                                            marginBottom:
                                                                "4px",
                                                        }}
                                                    >
                                                        Refund Date
                                                    </small>

                                                    <strong>
                                                        {formatDate(
                                                            order.refundDate
                                                        )}
                                                    </strong>
                                                </div>

                                            </div>

                                            {order.returnReason && (
                                                <p
                                                    style={{
                                                        marginTop:
                                                            "12px",
                                                    }}
                                                >
                                                    <strong>
                                                        Return Reason:
                                                    </strong>{" "}
                                                    {order.returnReason}
                                                </p>
                                            )}

                                        </div>
                                    )}

                                </div>
                            )}

                            {/* TRACKING */}

                            {orderStatus !== "CANCELLED" && (

                                <div className="order-tracking">

                                    <div className="tracking-title">

                                        <span>
                                            🚚
                                        </span>

                                        Order Tracking

                                    </div>

                                    <div className="tracking-container">

                                        <div className="tracking-line">

                                            <div
                                                className="tracking-line-filled"
                                                style={{
                                                    width: `${
                                                        ((currentStep - 1) /
                                                            3) *
                                                        100
                                                    }%`,
                                                }}
                                            ></div>

                                        </div>

                                        {/* PENDING */}

                                        <div className="tracking-step">

                                            <div
                                                className={
                                                    currentStep >= 1
                                                        ? "tracking-circle active"
                                                        : "tracking-circle"
                                                }
                                            >
                                                {currentStep > 1
                                                    ? "✓"
                                                    : "1"}
                                            </div>

                                            <span>
                                                Pending
                                            </span>

                                        </div>

                                        {/* CONFIRMED */}

                                        <div className="tracking-step">

                                            <div
                                                className={
                                                    currentStep >= 2
                                                        ? "tracking-circle active"
                                                        : "tracking-circle"
                                                }
                                            >
                                                {currentStep > 2
                                                    ? "✓"
                                                    : "2"}
                                            </div>

                                            <span>
                                                Confirmed
                                            </span>

                                        </div>

                                        {/* SHIPPED */}

                                        <div className="tracking-step">

                                            <div
                                                className={
                                                    currentStep >= 3
                                                        ? "tracking-circle active"
                                                        : "tracking-circle"
                                                }
                                            >
                                                {currentStep > 3
                                                    ? "✓"
                                                    : "3"}
                                            </div>

                                            <span>
                                                Shipped
                                            </span>

                                        </div>

                                        {/* DELIVERED */}

                                        <div className="tracking-step">

                                            <div
                                                className={
                                                    currentStep >= 4
                                                        ? "tracking-circle active"
                                                        : "tracking-circle"
                                                }
                                            >
                                                {currentStep >= 4
                                                    ? "✓"
                                                    : "4"}
                                            </div>

                                            <span>
                                                Delivered
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            )}

                            {/* CANCELLED */}

                            {orderStatus === "CANCELLED" && (

                                <div className="cancelled-order">
                                    ❌ This order has been cancelled.
                                </div>

                            )}

                        </div>

                    );
                })}

            </div>

        </div>
    );
}

export default CustomerOrderManagement;