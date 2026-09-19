import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomerNavbar from "./CustomerNavbar";
import api from "../../services/api";
import "./OrderDetails.css";

function OrderDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [order, setOrder] = useState(null);

    const [payment, setPayment] = useState(null);

    const [loading, setLoading] = useState(true);


    // =====================================================
    // FETCH ORDER + PAYMENT
    // =====================================================

    useEffect(() => {

        fetchOrder();

    }, [id]);


    const fetchOrder = async () => {

        try {

            const orderResponse =
                await api.get(
                    `/orders/${id}`
                );


            console.log(
                "ORDER DETAILS:",
                orderResponse.data
            );


            setOrder(
                orderResponse.data
            );


            try {

                const paymentResponse =
                    await api.get(
                        `/payments/order/${id}`
                    );


                console.log(
                    "PAYMENT DETAILS:",
                    paymentResponse.data
                );


                setPayment(
                    paymentResponse.data
                );

            } catch (paymentError) {

                console.log(
                    "Payment record not available."
                );

                setPayment(null);
            }


        } catch (error) {

            console.error(
                "Error fetching order:",
                error
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <>
                <CustomerNavbar />

                <div className="orders-loading">
                    Loading order details...
                </div>
            </>
        );
    }


    // =====================================================
    // NOT FOUND
    // =====================================================

    if (!order) {

        return (
            <>
                <CustomerNavbar />

                <div className="empty-orders">

                    <h2>
                        Order not found
                    </h2>

                    <button
                        className="view-order-button"
                        onClick={() =>
                            navigate(
                                "/customer/orders"
                            )
                        }
                    >
                        Back to Orders
                    </button>

                </div>
            </>
        );
    }


    // =====================================================
    // ORDER DATA
    // =====================================================

    const orderStatus =
        order.status || "PENDING";


    // =====================================================
    // PAYMENT STATUS
    // =====================================================
    /*
     * Razorpay/payment backend can return different
     * successful values such as:
     *
     * COMPLETED
     * PAID
     * SUCCESS
     *
     * All of these represent a successful payment
     * for this application.
     */

    const rawPaymentStatus =
        payment?.status ||
        order.paymentStatus ||
        "PENDING";


    const normalizedPaymentStatus =
        String(
            rawPaymentStatus
        ).toUpperCase();


    const isSuccessful =
        [
            "COMPLETED",
            "PAID",
            "SUCCESS",
            "SUCCESSFUL"
        ].includes(
            normalizedPaymentStatus
        );


    const isFailed =
        [
            "FAILED",
            "FAILURE",
            "PAYMENT_FAILED"
        ].includes(
            normalizedPaymentStatus
        );


    /*
     * Display a consistent successful status.
     *
     * Even if the payment table contains PAID,
     * the customer UI displays COMPLETED.
     */

    const paymentStatus =
        isSuccessful
            ? "COMPLETED"
            : isFailed
                ? "FAILED"
                : "PENDING";


    // =====================================================
    // PAYMENT AMOUNT
    // =====================================================

    const amountPaid =
        payment?.amount ??
        order.totalAmount ??
        0;


    // =====================================================
    // PAYMENT METHOD
    // =====================================================

    const paymentMethod =
        payment?.paymentMethod ||
        order.paymentMethod ||
        "RAZORPAY";


    // =====================================================
    // TRANSACTION ID
    // =====================================================

    const transactionId =
        payment?.transactionId ||
        payment?.razorpayPaymentId ||
        payment?.paymentId ||
        "—";


    // =====================================================
    // PAYMENT DATE
    // =====================================================

    const paymentDate =
        payment?.paymentDate ||
        payment?.createdAt ||
        payment?.paidAt ||
        null;


    // =====================================================
    // PAGE
    // =====================================================

    return (
        <>
            <CustomerNavbar />

            <div className="customer-orders-page">

                {/* =========================================
                    HEADER
                ========================================== */}

                <div className="orders-header">

                    <div>

                        <h1>
                            Order Details
                        </h1>

                        <p>
                            Order details and delivery information
                        </p>

                    </div>


                    <button
                        className="view-order-button"
                        onClick={() =>
                            navigate(
                                "/customer/orders"
                            )
                        }
                    >
                        Back to Orders
                    </button>

                </div>


                {/* =========================================
                    PAYMENT RESULT
                ========================================== */}

                <div className="order-card">

                    <div
                        style={{
                            textAlign: "center",
                            padding: "25px"
                        }}
                    >

                        {isSuccessful && (

                            <>
                                <div
                                    style={{
                                        fontSize: "48px"
                                    }}
                                >
                                    ✓
                                </div>

                                <h2>
                                    Payment Successful
                                </h2>

                                <p>
                                    Your order has been confirmed successfully.
                                </p>
                            </>
                        )}


                        {isFailed && (

                            <>
                                <div
                                    style={{
                                        fontSize: "48px"
                                    }}
                                >
                                    ✕
                                </div>

                                <h2>
                                    Payment Failed
                                </h2>

                                <p>
                                    Your payment was not completed.
                                </p>
                            </>
                        )}


                        {!isSuccessful &&
                            !isFailed && (

                                <>
                                    <h2>
                                        Payment Pending
                                    </h2>

                                    <p>
                                        Your payment is being processed.
                                    </p>
                                </>
                            )}

                    </div>

                </div>


                {/* =========================================
                    ORDER STATUS
                ========================================== */}

                <div className="order-card">

                    <div className="order-card-header">

                        <div>

                            <span className="order-label">
                                Order Status
                            </span>

                            <strong>
                                {orderStatus}
                            </strong>

                        </div>


                        <span
                            className={
                                `order-status ${String(
                                    orderStatus
                                ).toLowerCase()}`
                            }
                        >
                            {orderStatus}
                        </span>

                    </div>


                    <div className="order-card-body">

                        <div className="order-detail">

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


                        <div className="order-detail">

                            <span>
                                Order Date
                            </span>

                            <strong>

                                {order.orderDate
                                    ? new Date(
                                        order.orderDate
                                    ).toLocaleString(
                                        "en-IN"
                                    )
                                    : "—"
                                }

                            </strong>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    DELIVERY ADDRESS
                ========================================== */}

                <div className="order-card">

                    <div className="section-heading">
                        Delivery Address
                    </div>


                    <div className="order-address">

                        <p>
                            {order.address}
                        </p>

                        <p>
                            {order.city},{" "}
                            {order.state}
                        </p>

                        <p>
                            {order.pincode},{" "}
                            {order.country}
                        </p>

                    </div>

                </div>


                {/* =========================================
                    PAYMENT INFORMATION
                ========================================== */}

                <div className="order-card">

                    <div className="section-heading">
                        Payment Information
                    </div>


                    <div className="order-detail">

                        <span>
                            Payment Method
                        </span>

                        <strong>
                            {paymentMethod}
                        </strong>

                    </div>


                    <div className="order-detail">

                        <span>
                            Payment Status
                        </span>

                        <strong>
                            {paymentStatus}
                        </strong>

                    </div>


                    <div className="order-detail">

                        <span>
                            Amount Paid
                        </span>

                        <strong>
                            ₹
                            {Number(
                                amountPaid
                            ).toFixed(2)}
                        </strong>

                    </div>


                    {payment && (

                        <>

                            <div className="order-detail">

                                <span>
                                    Transaction ID
                                </span>

                                <strong>
                                    {transactionId}
                                </strong>

                            </div>


                            <div className="order-detail">

                                <span>
                                    Payment Date
                                </span>

                                <strong>

                                    {paymentDate
                                        ? new Date(
                                            paymentDate
                                        ).toLocaleString(
                                            "en-IN"
                                        )
                                        : "—"
                                    }

                                </strong>

                            </div>

                        </>
                    )}

                </div>


                {/* =========================================
                    ORDER TRACKING
                ========================================== */}

                {isSuccessful && (

                    <div className="order-card">

                        <div className="section-heading">
                            Order Tracking
                        </div>


                        <div className="order-detail">

                            <span>
                                Current Stage
                            </span>

                            <strong>
                                {orderStatus}
                            </strong>

                        </div>


                        <div className="order-detail">

                            <span>
                                Next
                            </span>

                            <strong>

                                {orderStatus ===
                                    "PENDING"

                                    ? "Confirming Order"

                                    : orderStatus ===
                                        "CONFIRMED"

                                        ? "Preparing for Shipment"

                                        : orderStatus ===
                                            "PROCESSING"

                                            ? "Preparing for Shipment"

                                            : orderStatus ===
                                                "SHIPPED"

                                                ? "Out for Delivery"

                                                : orderStatus ===
                                                    "DELIVERED"

                                                    ? "Delivered"

                                                    : "Processing"
                                }

                            </strong>

                        </div>

                    </div>

                )}

            </div>
        </>
    );
}

export default OrderDetails;