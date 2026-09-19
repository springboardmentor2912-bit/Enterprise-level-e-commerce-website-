import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerNavbar from "./CustomerNavbar";
import api from "../../services/api";
import "./CustomerOrders.css";

function CustomerOrders() {

    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [actionLoading, setActionLoading] = useState(null);


    // =========================================================
    // SHIPMENT TRACKING STEPS
    // =========================================================

    const shipmentSteps = [
        "CREATED",
        "SHIPPED",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED"
    ];


    // =========================================================
    // FETCH ORDERS + SHIPMENT INFORMATION
    // =========================================================

    const fetchOrders = async () => {

        try {

            const customerId =
                localStorage.getItem("userId");

            console.log(
                "Logged-in customerId:",
                customerId
            );

            if (!customerId) {

                navigate("/login");

                return;
            }


            // -----------------------------------------------------
            // GET CUSTOMER ORDERS
            // -----------------------------------------------------

            const response = await api.get(
                `/orders/customer/${customerId}`
            );

            console.log(
                "Orders Response:",
                response.data
            );


            let orderData = [];


            if (Array.isArray(response.data)) {

                orderData = response.data;

            } else if (
                Array.isArray(response.data.orders)
            ) {

                orderData = response.data.orders;

            } else if (
                Array.isArray(response.data.content)
            ) {

                orderData = response.data.content;

            }


            // -----------------------------------------------------
            // GET SHIPMENT FOR EVERY ORDER
            // -----------------------------------------------------

            const ordersWithShipment =
                await Promise.all(

                    orderData.map(
                        async order => {

                            try {

                                const shipmentResponse =
                                    await api.get(
                                        `/shipping/order/${order.id}`
                                    );

                                console.log(
                                    `Shipment for Order ${order.id}:`,
                                    shipmentResponse.data
                                );


                                return {

                                    ...order,

                                    shipment:
                                        shipmentResponse.data

                                };

                            } catch (shipmentError) {

                                console.log(
                                    `No shipment available for Order ${order.id}`
                                );


                                return {

                                    ...order,

                                    shipment: null

                                };

                            }

                        }
                    )

                );


            setOrders(
                ordersWithShipment
            );


        } catch (error) {

            console.error(
                "Error fetching orders:",
                error
            );

            setOrders([]);

        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // INITIAL LOAD + AUTO REFRESH
    // =========================================================

    useEffect(() => {

        fetchOrders();


        /*
         * Refresh every 10 seconds.
         *
         * This allows the customer page to reflect
         * warehouse shipment-status changes automatically.
         */

        const interval =
            setInterval(() => {

                fetchOrders();

            }, 10000);


        return () => {

            clearInterval(interval);

        };

    }, []);


    // =========================================================
    // SHIPMENT STATUS
    // =========================================================

    const getShipmentStatus = order => {

        if (!order?.shipment?.status) {

            return null;

        }

        return String(
            order.shipment.status
        ).toUpperCase();

    };


    // =========================================================
    // SHIPMENT STEP INDEX
    // =========================================================

    const getShipmentStepIndex = order => {

        const status =
            getShipmentStatus(order);


        if (!status) {

            return -1;

        }


        return shipmentSteps.indexOf(
            status
        );

    };


    // =========================================================
    // FORMAT SHIPMENT STATUS
    // =========================================================

    const formatShipmentStatus = status => {

        if (!status) {

            return "Shipment Pending";

        }


        return String(status)
            .replaceAll("_", " ")
            .replace(/\b\w/g, char =>
                char.toUpperCase()
            );

    };


    // =========================================================
    // SHIPMENT STATUS CLASS
    // =========================================================

    const getShipmentStatusClass = status => {

        if (!status) {

            return "shipment-status-badge pending";

        }


        return `shipment-status-badge ${
            String(status).toLowerCase()
        }`;

    };


    // =========================================================
    // FILTER ORDERS
    // =========================================================

    const filteredOrders = useMemo(() => {

        return orders.filter(order => {

            const searchText =
                search.toLowerCase();


            const matchesSearch =
                String(order.id || "")
                    .toLowerCase()
                    .includes(searchText) ||

                String(order.city || "")
                    .toLowerCase()
                    .includes(searchText) ||

                String(order.status || "")
                    .toLowerCase()
                    .includes(searchText) ||

                String(
                    order.shipment?.status || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||

                String(
                    order.shipment?.trackingNumber || ""
                )
                    .toLowerCase()
                    .includes(searchText);


            const matchesStatus =
                statusFilter === "ALL" ||
                order.status === statusFilter;


            return (
                matchesSearch &&
                matchesStatus
            );

        });

    }, [
        orders,
        search,
        statusFilter
    ]);


    // =========================================================
    // STATISTICS
    // =========================================================

    const totalOrders =
        orders.length;


    const activeOrders =
        orders.filter(order =>
            [
                "PENDING",
                "CONFIRMED",
                "PROCESSING",
                "SHIPPED"
            ].includes(
                order.status
            )
        ).length;


    const deliveredOrders =
        orders.filter(order =>
            order.status === "DELIVERED"
        ).length;


    const cancelledOrders =
        orders.filter(order =>
            order.status === "CANCELLED"
        ).length;


    // =========================================================
    // ORDER STATUS CLASS
    // =========================================================

    const getStatusClass = status => {

        return String(
            status || "PENDING"
        ).toLowerCase();

    };


    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = date => {

        if (!date) {

            return "—";

        }


        return new Date(date)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

    };


    // =========================================================
    // FORMAT TIME
    // =========================================================

    const formatTime = date => {

        if (!date) {

            return "";

        }


        return new Date(date)
            .toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );

    };


    // =========================================================
    // CANCEL ORDER
    // =========================================================

    const cancelOrder = async orderId => {

        const customerId =
            localStorage.getItem("userId");


        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this order?"
            );


        if (!confirmed) {

            return;

        }


        try {

            setActionLoading(orderId);


            await api.put(
                `/orders/${orderId}/cancel`,
                null,
                {
                    params: {
                        customerId
                    }
                }
            );


            await fetchOrders();


            alert(
                "Order cancelled successfully."
            );


        } catch (error) {

            console.error(
                "Cancel order error:",
                error
            );


            alert(
                error.response?.data ||
                "Unable to cancel order."
            );


        } finally {

            setActionLoading(null);

        }

    };


    // =========================================================
    // RETURN ORDER
    // =========================================================

    const returnOrder = async orderId => {

        const customerId =
            localStorage.getItem("userId");


        const confirmed =
            window.confirm(
                "Are you sure you want to return this order?"
            );


        if (!confirmed) {

            return;

        }


        try {

            setActionLoading(orderId);


            await api.put(
                `/orders/${orderId}/return`,
                null,
                {
                    params: {
                        customerId
                    }
                }
            );


            await fetchOrders();


            alert(
                "Return request submitted successfully."
            );


        } catch (error) {

            console.error(
                "Return order error:",
                error
            );


            alert(
                error.response?.data ||
                "Unable to return order."
            );


        } finally {

            setActionLoading(null);

        }

    };


    // =========================================================
    // TRACK SHIPMENT
    // =========================================================

    const trackShipment = orderId => {

        console.log(
            "TRACKING ORDER ID:",
            orderId
        );


        navigate(
            `/customer/orders/${orderId}/tracking`
        );

    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (
            <>
                <CustomerNavbar />

                <div className="orders-loading">

                    <div className="loading-box">

                        <div className="loading-spinner"></div>

                        <strong>
                            Loading your orders
                        </strong>

                        <span>
                            Please wait while we retrieve
                            your order history.
                        </span>

                    </div>

                </div>
            </>
        );

    }


    // =========================================================
    // PAGE
    // =========================================================

    return (
        <>
            <CustomerNavbar />

            <main className="customer-orders-page">

                <div className="orders-container">


                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <section className="orders-header">

                        <div>

                            <span className="section-label">
                                ACCOUNT / ORDERS
                            </span>

                            <h1>
                                My Orders
                            </h1>

                            <p>
                                Track purchases, payments and
                                delivery progress from one place.
                            </p>

                        </div>


                        <div className="orders-header-actions">

                            <button
                                className="continue-shopping-button"
                                onClick={() =>
                                    navigate(
                                        "/customer/home"
                                    )
                                }
                            >
                                Continue Shopping
                            </button>

                        </div>

                    </section>


                    {/* =================================================
                        METRICS
                    ================================================= */}

                    <section className="orders-metrics">


                        <div className="metric-card">

                            <div className="metric-icon">
                                ORD
                            </div>

                            <div>

                                <span>
                                    Total Orders
                                </span>

                                <strong>
                                    {totalOrders}
                                </strong>

                            </div>

                        </div>


                        <div className="metric-card">

                            <div className="metric-icon active">
                                ACT
                            </div>

                            <div>

                                <span>
                                    Active Orders
                                </span>

                                <strong>
                                    {activeOrders}
                                </strong>

                            </div>

                        </div>


                        <div className="metric-card">

                            <div className="metric-icon delivered">
                                DEL
                            </div>

                            <div>

                                <span>
                                    Delivered
                                </span>

                                <strong>
                                    {deliveredOrders}
                                </strong>

                            </div>

                        </div>


                        <div className="metric-card">

                            <div className="metric-icon cancelled">
                                CAN
                            </div>

                            <div>

                                <span>
                                    Cancelled
                                </span>

                                <strong>
                                    {cancelledOrders}
                                </strong>

                            </div>

                        </div>


                    </section>


                    {/* =================================================
                        TOOLBAR
                    ================================================= */}

                    <section className="orders-toolbar">


                        <div className="orders-search">

                            <span className="search-icon">
                                ⌕
                            </span>

                            <input
                                type="text"
                                placeholder="Search by order ID, city, status or tracking number..."
                                value={search}
                                onChange={e =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="orders-filter">

                            <label>
                                STATUS
                            </label>

                            <select
                                value={statusFilter}
                                onChange={e =>
                                    setStatusFilter(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="ALL">
                                    All Orders
                                </option>

                                <option value="PENDING">
                                    Pending
                                </option>

                                <option value="CONFIRMED">
                                    Confirmed
                                </option>

                                <option value="PROCESSING">
                                    Processing
                                </option>

                                <option value="SHIPPED">
                                    Shipped
                                </option>

                                <option value="DELIVERED">
                                    Delivered
                                </option>

                                <option value="CANCELLED">
                                    Cancelled
                                </option>

                                <option value="RETURNED">
                                    Returned
                                </option>

                                <option value="REFUNDED">
                                    Refunded
                                </option>

                            </select>

                        </div>


                        <div className="results-count">

                            Showing{" "}

                            <strong>
                                {filteredOrders.length}
                            </strong>

                            {" "}orders

                        </div>

                    </section>


                    {/* =================================================
                        EMPTY
                    ================================================= */}

                    {filteredOrders.length === 0 ? (

                        <section className="orders-empty">

                            <div className="empty-orders-icon">
                                ORD
                            </div>

                            <h2>
                                No orders found
                            </h2>

                            <p>
                                Your order history will appear here.
                            </p>

                            <button
                                className="primary-button"
                                onClick={() =>
                                    navigate(
                                        "/customer/home"
                                    )
                                }
                            >
                                Start Shopping
                            </button>

                        </section>

                    ) : (

                        <section className="orders-list">


                            {filteredOrders.map(order => {

                                const shipmentStatus =
                                    getShipmentStatus(order);

                                const shipmentStepIndex =
                                    getShipmentStepIndex(order);


                                return (

                                    <article
                                        className="order-card"
                                        key={order.id}
                                    >


                                        {/* =================================
                                            ORDER HEADER
                                        ================================= */}

                                        <div className="order-card-header">


                                            <div className="order-heading">

                                                <div className="order-id-row">

                                                    <span className="order-number">
                                                        Order #{order.id}
                                                    </span>

                                                    <span className="order-date">

                                                        {formatDate(
                                                            order.orderDate
                                                        )}

                                                        {" "}

                                                        {formatTime(
                                                            order.orderDate
                                                        )}

                                                    </span>

                                                </div>


                                                <p>
                                                    ShopStack Marketplace
                                                </p>

                                            </div>


                                            <div className="order-status-area">


                                                {/* ORDER STATUS */}

                                                <span
                                                    className={
                                                        `order-status ${
                                                            getStatusClass(
                                                                order.status
                                                            )
                                                        }`
                                                    }
                                                >
                                                    {order.status}
                                                </span>


                                                {/* SHIPMENT STATUS */}

                                                {shipmentStatus && (

                                                    <span
                                                        className={
                                                            getShipmentStatusClass(
                                                                shipmentStatus
                                                            )
                                                        }
                                                    >
                                                        {formatShipmentStatus(
                                                            shipmentStatus
                                                        )}
                                                    </span>

                                                )}


                                                {/* PAYMENT STATUS */}

                                                <span className="payment-badge">

                                                    {order.paymentStatus ||
                                                        "PENDING"}

                                                </span>


                                            </div>

                                        </div>


                                        {/* =================================
                                            ORDER INFO
                                        ================================= */}

                                        <div className="order-info">


                                            <div>

                                                <span>
                                                    ORDER VALUE
                                                </span>

                                                <strong>
                                                    ₹
                                                    {Number(
                                                        order.totalAmount || 0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    PAYMENT
                                                </span>

                                                <strong>
                                                    {order.paymentMethod ||
                                                        "Razorpay"}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    DELIVERY LOCATION
                                                </span>

                                                <strong>
                                                    {order.city || "—"}

                                                    {order.state
                                                        ? `, ${order.state}`
                                                        : ""}
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    CUSTOMER
                                                </span>

                                                <strong>
                                                    #{order.customerId}
                                                </strong>

                                            </div>


                                            {/* COURIER */}

                                            <div>

                                                <span>
                                                    COURIER
                                                </span>

                                                <strong>
                                                    {order.shipment?.courierName ||
                                                        "Not assigned"}
                                                </strong>

                                            </div>


                                            {/* TRACKING NUMBER */}

                                            <div>

                                                <span>
                                                    TRACKING NUMBER
                                                </span>

                                                <strong>
                                                    {order.shipment?.trackingNumber ||
                                                        "Not available"}
                                                </strong>

                                            </div>


                                        </div>


                                        {/* =================================
                                            SHIPMENT TRACKING
                                        ================================= */}

                                        {![
                                            "CANCELLED",
                                            "RETURNED",
                                            "REFUNDED"
                                        ].includes(
                                            order.status
                                        ) && (

                                            <div className="tracking">


                                                <div className="tracking-header">


                                                    <div>

                                                        <span className="tracking-label">
                                                            SHIPMENT TRACKING
                                                        </span>

                                                        <strong>
                                                            {formatShipmentStatus(
                                                                shipmentStatus
                                                            )}
                                                        </strong>

                                                    </div>


                                                    {order.shipment?.trackingNumber && (

                                                        <span className="tracking-number-small">

                                                            {
                                                                order.shipment.trackingNumber
                                                            }

                                                        </span>

                                                    )}

                                                </div>


                                                <div className="tracking-timeline">


                                                    {shipmentSteps.map(
                                                        (
                                                            step,
                                                            index
                                                        ) => {

                                                            const completed =
                                                                shipmentStepIndex >=
                                                                index;

                                                            const active =
                                                                shipmentStepIndex ===
                                                                index;


                                                            return (

                                                                <div
                                                                    className={
                                                                        `tracking-step ${
                                                                            completed
                                                                                ? "active"
                                                                                : ""
                                                                        } ${
                                                                            active
                                                                                ? "current"
                                                                                : ""
                                                                        }`
                                                                    }
                                                                    key={step}
                                                                >


                                                                    <div className="tracking-circle">

                                                                        {completed
                                                                            ? "✓"
                                                                            : index + 1}

                                                                    </div>


                                                                    <span>

                                                                        {step
                                                                            .replaceAll(
                                                                                "_",
                                                                                " "
                                                                            )}

                                                                    </span>


                                                                </div>

                                                            );

                                                        }
                                                    )}

                                                </div>


                                                {/* SHIPMENT MESSAGE */}

                                                {!shipmentStatus && (

                                                    <div className="shipment-pending-message">

                                                        <span>
                                                            ●
                                                        </span>

                                                        Shipment will appear here
                                                        once the warehouse creates it.

                                                    </div>

                                                )}


                                            </div>

                                        )}


                                        {/* =================================
                                            DELIVERY INFORMATION
                                        ================================= */}

                                        <div className="order-delivery-panel">


                                            <div className="delivery-block">

                                                <span className="panel-label">
                                                    DELIVERY ADDRESS
                                                </span>

                                                <strong>
                                                    {order.address ||
                                                        "—"}
                                                </strong>

                                                <p>

                                                    {order.city || ""}

                                                    {order.state
                                                        ? `, ${order.state}`
                                                        : ""}

                                                    {" "}

                                                    {order.pincode || ""}

                                                </p>

                                            </div>


                                            <div className="delivery-divider"></div>


                                            <div className="delivery-block">

                                                <span className="panel-label">
                                                    PAYMENT STATUS
                                                </span>

                                                <strong>
                                                    {order.paymentStatus ||
                                                        "PENDING"}
                                                </strong>

                                                <p>
                                                    {order.paymentMethod ||
                                                        "Razorpay"}
                                                </p>

                                            </div>


                                            <div className="delivery-divider"></div>


                                            <div className="delivery-block">

                                                <span className="panel-label">
                                                    SHIPMENT STATUS
                                                </span>

                                                <strong>
                                                    {formatShipmentStatus(
                                                        shipmentStatus
                                                    )}
                                                </strong>

                                                <p>

                                                    {order.shipment?.courierName ||
                                                        "Courier not assigned"}

                                                </p>

                                            </div>


                                            <div className="delivery-divider"></div>


                                            <div className="delivery-block">

                                                <span className="panel-label">
                                                    ORDER TOTAL
                                                </span>

                                                <strong className="amount-value">

                                                    ₹
                                                    {Number(
                                                        order.totalAmount || 0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}

                                                </strong>

                                                <p>
                                                    Inclusive of delivery
                                                </p>

                                            </div>


                                        </div>


                                        {/* =================================
                                            ACTIONS
                                        ================================= */}

                                        <div className="order-actions">


                                            {/* VIEW DETAILS */}

                                            <button
                                                className="secondary-button"
                                                onClick={() =>
                                                    navigate(
                                                        `/customer/orders/${order.id}`
                                                    )
                                                }
                                            >
                                                View Details
                                            </button>


                                            {/* TRACK SHIPMENT */}

                                            {order.shipment && (

                                                <button
                                                    className="track-shipment-button"
                                                    onClick={() =>
                                                        trackShipment(
                                                            order.id
                                                        )
                                                    }
                                                >
                                                    Track Shipment
                                                </button>

                                            )}


                                            {/* CANCEL */}

                                            {[
                                                "PENDING",
                                                "CONFIRMED",
                                                "PROCESSING"
                                            ].includes(
                                                order.status
                                            ) && (

                                                <button
                                                    className="danger-button"
                                                    disabled={
                                                        actionLoading ===
                                                        order.id
                                                    }
                                                    onClick={() =>
                                                        cancelOrder(
                                                            order.id
                                                        )
                                                    }
                                                >

                                                    {actionLoading ===
                                                    order.id
                                                        ? "Processing..."
                                                        : "Cancel Order"}

                                                </button>

                                            )}


                                            {/* RETURN */}

                                            {order.status ===
                                                "DELIVERED" && (

                                                <button
                                                    className="secondary-button"
                                                    disabled={
                                                        actionLoading ===
                                                        order.id
                                                    }
                                                    onClick={() =>
                                                        returnOrder(
                                                            order.id
                                                        )
                                                    }
                                                >

                                                    {actionLoading ===
                                                    order.id
                                                        ? "Processing..."
                                                        : "Request Return"}

                                                </button>

                                            )}


                                        </div>


                                    </article>

                                );

                            })}

                        </section>

                    )}

                </div>

            </main>
        </>
    );
}

export default CustomerOrders;