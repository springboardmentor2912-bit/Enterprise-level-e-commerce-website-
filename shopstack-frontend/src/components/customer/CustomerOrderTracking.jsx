
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import CustomerNavbar from "./CustomerNavbar";
import "./CustomerOrderTracking.css";

function CustomerOrderTracking() {

    const { orderId } = useParams();
    const navigate = useNavigate();

    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");


    // =========================================================
    // TRACKING STEPS
    // =========================================================

    const trackingSteps = [
        {
            status: "CREATED",
            title: "Shipment Created",
            description:
                "Your shipment has been created and is ready for pickup."
        },
        {
            status: "SHIPPED",
            title: "Shipped",
            description:
                "Your package has been handed over to the courier."
        },
        {
            status: "IN_TRANSIT",
            title: "In Transit",
            description:
                "Your package is currently on the way."
        },
        {
            status: "OUT_FOR_DELIVERY",
            title: "Out for Delivery",
            description:
                "Your package is out for delivery to your address."
        },
        {
            status: "DELIVERED",
            title: "Delivered",
            description:
                "Your package has been delivered successfully."
        }
    ];


    // =========================================================
    // LOAD SHIPMENT
    // =========================================================

    const loadShipment = async (showRefresh = false) => {

        try {

            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setErrorMessage("");

            console.log(
                "Fetching shipment for order:",
                orderId
            );


            if (!orderId) {

                setShipment(null);

                setErrorMessage(
                    "Order information is missing."
                );

                return;
            }


            const response = await api.get(
                `/shipping/order/${orderId}`
            );


            console.log(
                "SHIPMENT RESPONSE:",
                response.data
            );


            /*
             * Expected backend response:
             *
             * {
             *   id: 1,
             *   courierName: "Delhivery",
             *   trackingNumber: "SHP...",
             *   status: "DELIVERED",
             *   createdAt: "...",
             *   shippedAt: "...",
             *   deliveredAt: "...",
             *   order: {...}
             * }
             */


            if (
                response.data &&
                response.data.id
            ) {

                setShipment(response.data);

                setErrorMessage("");

            } else {

                setShipment(null);

                setErrorMessage(
                    "Shipment information is not available yet."
                );

            }

        } catch (error) {

            console.error(
                "SHIPMENT ERROR:",
                error
            );

            console.error(
                "SHIPMENT ERROR STATUS:",
                error.response?.status
            );

            console.error(
                "SHIPMENT ERROR DATA:",
                error.response?.data
            );


            setShipment(null);


            /*
             * Backend currently returns an error when
             * there is no shipment for the requested order.
             */

            if (error.response?.status === 403) {

                setErrorMessage(
                    `Shipment is not available for Order #${orderId} yet.`
                );

            } else if (error.response?.status === 404) {

                setErrorMessage(
                    `Shipment is not available for Order #${orderId} yet.`
                );

            } else {

                setErrorMessage(
                    "Unable to retrieve shipment information."
                );

            }

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadShipment();

    }, [orderId]);


    // =========================================================
    // NORMALIZE STATUS
    // =========================================================

    const getShipmentStatus = () => {

        if (!shipment?.status) {
            return "";
        }

        return String(
            shipment.status
        ).toUpperCase();

    };


    // =========================================================
    // GET CURRENT STEP
    // =========================================================

    const getStepIndex = () => {

        const status =
            getShipmentStatus();


        if (!status) {
            return -1;
        }


        return trackingSteps.findIndex(
            step =>
                step.status === status
        );

    };


    const currentStep =
        getStepIndex();


    // =========================================================
    // FORMAT STATUS
    // =========================================================

    const formatStatus = status => {

        if (!status) {
            return "PENDING";
        }

        return String(status)
            .replaceAll("_", " ")
            .replace(/\b\w/g, char =>
                char.toUpperCase()
            );

    };


    // =========================================================
    // STATUS CLASS
    // =========================================================

    const getStatusClass = status => {

        if (!status) {
            return "tracking-status";
        }

        return `tracking-status ${String(
            status
        ).toLowerCase()}`;

    };


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDateTime = date => {

        if (!date) {
            return "Not available";
        }

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (
            <>
                <CustomerNavbar />

                <div className="customer-tracking-loading">

                    <div className="tracking-loading-card">

                        <div className="tracking-loading-spinner">
                        </div>

                        <h3>
                            Loading tracking details...
                        </h3>

                        <p>
                            Please wait while we retrieve
                            your shipment information.
                        </p>

                    </div>

                </div>
            </>
        );

    }


    // =========================================================
    // SHIPMENT NOT AVAILABLE
    // =========================================================

    if (!shipment) {

        return (
            <>
                <CustomerNavbar />

                <div className="customer-tracking-page">

                    <div className="tracking-empty-card">

                        <div className="tracking-empty-icon">
                            📦
                        </div>

                        <h2>
                            Shipment Not Available Yet
                        </h2>

                        <p>
                            {errorMessage ||
                                `Shipment information for Order #${orderId} will appear here once the warehouse creates the shipment.`}
                        </p>

                        <button
                            className="tracking-back-button"
                            onClick={() =>
                                navigate(
                                    "/customer/orders"
                                )
                            }
                        >
                            Back to Orders
                        </button>

                    </div>

                </div>
            </>
        );

    }


    // =========================================================
    // CURRENT STATUS
    // =========================================================

    const shipmentStatus =
        getShipmentStatus();


    // =========================================================
    // PAGE
    // =========================================================

    return (
        <>
            <CustomerNavbar />

            <div className="customer-tracking-page">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="customer-tracking-header">

                    <div>

                        <span className="tracking-section-label">
                            ORDER / SHIPMENT
                        </span>

                        <h1>
                            Track Your Order
                        </h1>

                        <p>
                            Order #{shipment.order?.id || orderId}
                        </p>

                    </div>


                    <div className="tracking-header-actions">

                        <button
                            className="tracking-refresh-button"
                            onClick={() =>
                                loadShipment(true)
                            }
                            disabled={refreshing}
                        >
                            {refreshing
                                ? "Refreshing..."
                                : "Refresh Tracking"}
                        </button>


                        <button
                            className="tracking-back-button"
                            onClick={() =>
                                navigate(
                                    "/customer/orders"
                                )
                            }
                        >
                            Back to Orders
                        </button>

                    </div>

                </div>


                {/* =================================================
                    CURRENT STATUS
                ================================================= */}

                <div className="tracking-status-banner">

                    <div className="tracking-status-icon">

                        {shipmentStatus === "DELIVERED"
                            ? "✓"
                            : "●"}

                    </div>

                    <div>

                        <span>
                            CURRENT SHIPMENT STATUS
                        </span>

                        <strong>
                            {formatStatus(
                                shipment.status
                            )}
                        </strong>

                    </div>

                </div>


                {/* =================================================
                    SHIPMENT SUMMARY
                ================================================= */}

                <div className="tracking-summary-card">


                    <div className="tracking-summary-item">

                        <span>
                            Shipment ID
                        </span>

                        <strong>
                            #{shipment.id}
                        </strong>

                    </div>


                    <div className="tracking-summary-item">

                        <span>
                            Order ID
                        </span>

                        <strong>
                            #{shipment.order?.id || orderId}
                        </strong>

                    </div>


                    <div className="tracking-summary-item">

                        <span>
                            Courier
                        </span>

                        <strong>
                            {shipment.courierName ||
                                "Not assigned"}
                        </strong>

                    </div>


                    <div className="tracking-summary-item">

                        <span>
                            Tracking Number
                        </span>

                        <strong className="tracking-number">

                            {shipment.trackingNumber ||
                                "Not assigned"}

                        </strong>

                    </div>


                    <div className="tracking-summary-item">

                        <span>
                            Current Status
                        </span>

                        <strong
                            className={
                                getStatusClass(
                                    shipment.status
                                )
                            }
                        >
                            {formatStatus(
                                shipment.status
                            )}
                        </strong>

                    </div>

                </div>


                {/* =================================================
                    TRACKING TIMELINE
                ================================================= */}

                <div className="tracking-card">

                    <div className="tracking-card-header">

                        <div>

                            <h2>
                                Shipment Tracking
                            </h2>

                            <p className="tracking-description">
                                Follow your package through
                                every delivery stage.
                            </p>

                        </div>


                        {shipmentStatus ===
                            "DELIVERED" && (

                            <span className="delivered-badge">
                                Delivered
                            </span>

                        )}

                    </div>


                    <div className="tracking-timeline">

                        {trackingSteps.map(
                            (step, index) => {

                                const completed =
                                    currentStep >= index;

                                const active =
                                    currentStep === index;


                                return (

                                    <div
                                        className={
                                            `tracking-step ${
                                                completed
                                                    ? "completed"
                                                    : ""
                                            } ${
                                                active
                                                    ? "active"
                                                    : ""
                                            }`
                                        }
                                        key={step.status}
                                    >

                                        <div className="tracking-step-marker">

                                            {completed
                                                ? "✓"
                                                : index + 1}

                                        </div>


                                        <div className="tracking-step-content">

                                            <div className="tracking-step-title-row">

                                                <h3>
                                                    {step.title}
                                                </h3>


                                                {active && (

                                                    <span className="tracking-current-label">
                                                        Current
                                                    </span>

                                                )}

                                            </div>


                                            <p>
                                                {step.description}
                                            </p>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                </div>


                {/* =================================================
                    DELIVERY INFORMATION
                ================================================= */}

                <div className="tracking-card">

                    <h2>
                        Delivery Information
                    </h2>


                    <div className="delivery-information">


                        <div>

                            <span>
                                Order ID
                            </span>

                            <strong>
                                #{shipment.order?.id || orderId}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Customer
                            </span>

                            <strong>
                                #{shipment.order?.customerId || "—"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Courier
                            </span>

                            <strong>
                                {shipment.courierName ||
                                    "Not assigned"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Tracking Number
                            </span>

                            <strong>
                                {shipment.trackingNumber ||
                                    "Not assigned"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Shipment Status
                            </span>

                            <strong>
                                {formatStatus(
                                    shipment.status
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Created At
                            </span>

                            <strong>
                                {formatDateTime(
                                    shipment.createdAt
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Shipped At
                            </span>

                            <strong>
                                {formatDateTime(
                                    shipment.shippedAt
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Delivered At
                            </span>

                            <strong>
                                {formatDateTime(
                                    shipment.deliveredAt
                                )}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    ORDER INFORMATION
                ================================================= */}

                {shipment.order && (

                    <div className="tracking-card">

                        <h2>
                            Order Information
                        </h2>


                        <div className="delivery-information">

                            <div>

                                <span>
                                    Order Total
                                </span>

                                <strong>
                                    ₹
                                    {Number(
                                        shipment.order.totalAmount || 0
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Payment Status
                                </span>

                                <strong>
                                    {shipment.order.paymentStatus ||
                                        "PENDING"}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Payment Method
                                </span>

                                <strong>
                                    {shipment.order.paymentMethod ||
                                        "—"}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Delivery Address
                                </span>

                                <strong>
                                    {shipment.order.address ||
                                        "—"}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Delivery Location
                                </span>

                                <strong>
                                    {shipment.order.city || "—"}
                                    {shipment.order.state
                                        ? `, ${shipment.order.state}`
                                        : ""}
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Pincode
                                </span>

                                <strong>
                                    {shipment.order.pincode ||
                                        "—"}
                                </strong>

                            </div>

                        </div>

                    </div>

                )}


                {/* =================================================
                    PRODUCT INFORMATION
                ================================================= */}

                {shipment.order?.items?.length > 0 && (

                    <div className="tracking-card">

                        <h2>
                            Order Items
                        </h2>


                        <div className="delivery-information">

                            {shipment.order.items.map(
                                item => (

                                    <div
                                        key={item.id}
                                    >

                                        <span>
                                            PRODUCT
                                        </span>

                                        <strong>
                                            {item.product?.productName ||
                                                "Product"}
                                        </strong>

                                        <p>
                                            Quantity: {item.quantity}
                                        </p>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                )}


                {/* =================================================
                    CUSTOMER ACTION
                ================================================= */}

                <div className="tracking-bottom-actions">

                    <button
                        className="tracking-orders-button"
                        onClick={() =>
                            navigate(
                                "/customer/orders"
                            )
                        }
                    >
                        View All Orders
                    </button>

                </div>

            </div>
        </>
    );
}

export default CustomerOrderTracking;

