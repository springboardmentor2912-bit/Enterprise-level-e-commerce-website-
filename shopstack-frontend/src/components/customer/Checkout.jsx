
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerNavbar from "./CustomerNavbar";
import api from "../../services/api";
import "./Checkout.css";

function Checkout() {

    const navigate = useNavigate();

    const cartItems =
        JSON.parse(localStorage.getItem("cart")) || [];


    // =====================================================
    // PRODUCT DISCOUNT PRICE
    // =====================================================

    const getDiscountedPrice = (item) => {

        const originalPrice = Number(item.price) || 0;

        const discountPercentage =
            Number(item.discountPercentage) || 0;

        if (discountPercentage <= 0) {
            return originalPrice;
        }

        const discountAmount =
            originalPrice * discountPercentage / 100;

        return Math.round(
            (originalPrice - discountAmount) * 100
        ) / 100;
    };


    // =====================================================
    // CART CALCULATIONS
    // =====================================================

    const subtotal = cartItems.reduce(
        (total, item) =>
            total +
            getDiscountedPrice(item) *
            Number(item.cartQuantity),
        0
    );


    const delivery =
        subtotal >= 1000 || subtotal === 0
            ? 0
            : 50;


    // =====================================================
    // STATES
    // =====================================================

    const [discount, setDiscount] = useState(0);

    const [couponCode, setCouponCode] =
        useState("");

    const [couponApplied, setCouponApplied] =
        useState(false);

    const [couponMessage, setCouponMessage] =
        useState("");

    const [couponLoading, setCouponLoading] =
        useState(false);

    const [formData, setFormData] = useState({
        address: "",
        city: "",
        state: "",
        pincode: "",
        country: "India"
    });

    const [loading, setLoading] =
        useState(false);


    // =====================================================
    // FINAL TOTAL
    // =====================================================

    const total =
        subtotal +
        delivery -
        discount;


    // =====================================================
    // ADDRESS CHANGE
    // =====================================================

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };


    // =====================================================
    // APPLY COUPON
    // =====================================================

    const applyCoupon = async () => {

        const code =
            couponCode
                .trim()
                .toUpperCase();

        if (!code) {

            setCouponMessage(
                "Please enter a coupon code."
            );

            return;
        }

        try {

            setCouponLoading(true);

            setCouponMessage("");


            const response =
                await api.get(
                    "/coupons/validate",
                    {
                        params: {
                            code: code,
                            orderAmount: subtotal
                        }
                    }
                );


            const data =
                response.data;


            console.log(
                "Coupon response:",
                data
            );


            const discountAmount =
                Number(
                    data.discountAmount || 0
                );


            if (discountAmount > 0) {

                setDiscount(
                    discountAmount
                );

                setCouponApplied(true);

                setCouponCode(
                    data.couponCode || code
                );

                setCouponMessage(
                    "Coupon applied successfully."
                );

            } else {

                setDiscount(0);

                setCouponApplied(false);

                setCouponMessage(
                    "Coupon is not applicable to this order."
                );
            }

        } catch (error) {

            console.error(
                "Coupon validation error:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            setDiscount(0);

            setCouponApplied(false);

            setCouponMessage(
                typeof error.response?.data === "string"
                    ? error.response.data
                    : error.response?.data?.message ||
                      "Invalid or expired coupon code."
            );

        } finally {

            setCouponLoading(false);
        }
    };


    // =====================================================
    // REMOVE COUPON
    // =====================================================

    const removeCoupon = () => {

        setCouponCode("");

        setDiscount(0);

        setCouponApplied(false);

        setCouponMessage("");
    };


    // =====================================================
    // OPEN RAZORPAY CHECKOUT
    // =====================================================

    const openRazorpayCheckout = (
        razorpayOrder,
        shopstackOrderId,
        customerId
    ) => {

        const options = {

            key:
                process.env.REACT_APP_RAZORPAY_KEY_ID,

            amount:
                razorpayOrder.amount,

            currency:
                razorpayOrder.currency,

            name:
                "ShopStack",

            description:
                "ShopStack Order Payment",

            order_id:
                razorpayOrder.id,


            // =================================================
            // PAYMENT SUCCESS
            // =================================================

            handler: async function (response) {

                console.log(
                    "RAZORPAY PAYMENT SUCCESS",
                    response
                );

                try {

                    // =============================================
                    // VERIFY PAYMENT
                    // =============================================

                    const paymentResponse =
                        await api.post(
                            "/payments/verify",
                            {
                                shopstack_order_id:
                                    String(
                                        shopstackOrderId
                                    ),

                                customer_id:
                                    String(
                                        customerId
                                    ),

                                razorpay_order_id:
                                    response?.razorpay_order_id ||
                                    razorpayOrder.id,

                                razorpay_payment_id:
                                    response?.razorpay_payment_id ||
                                    "",

                                razorpay_signature:
                                    response?.razorpay_signature ||
                                    ""
                            }
                        );


                    console.log(
                        "Payment verified:",
                        paymentResponse.data
                    );


                    // =============================================
                    // UPDATE SHOPSTACK ORDER
                    // =============================================

                    const orderPaymentResponse =
                        await api.post(
                            `/orders/${shopstackOrderId}/payment-success`,
                            {
                                razorpay_payment_id:
                                    response?.razorpay_payment_id ||
                                    "",

                                razorpay_order_id:
                                    response?.razorpay_order_id ||
                                    razorpayOrder.id
                            }
                        );


                    console.log(
                        "Updated order:",
                        orderPaymentResponse.data
                    );


                    // =============================================
                    // CLEAR CART
                    // =============================================

                    localStorage.removeItem(
                        "cart"
                    );


                    setLoading(false);


                    // =============================================
                    // ORDER DETAILS
                    // =============================================

                    navigate(
                        `/customer/orders/${shopstackOrderId}`
                    );

                } catch (error) {

                    console.error(
                        "Payment verification/order update error:",
                        error
                    );

                    console.error(
                        "Backend response:",
                        error.response?.data
                    );

                    setLoading(false);

                    alert(
                        typeof error.response?.data === "string"
                            ? error.response.data
                            : error.response?.data?.message ||
                              "Payment verification failed."
                    );

                    navigate(
                        `/customer/orders/${shopstackOrderId}`
                    );
                }
            },


            // =================================================
            // MODAL DISMISSED
            // =================================================

            modal: {

                ondismiss: function () {

                    setLoading(false);
                }
            },


            // =================================================
            // PAYMENT FAILED
            // =================================================

            theme: {

                color: "#3399cc"
            }
        };


        const razorpay =
            new window.Razorpay(
                options
            );


        razorpay.on(
            "payment.failed",
            async function (response) {

                console.error(
                    "RAZORPAY PAYMENT FAILED",
                    response
                );

                try {

                    await api.post(
                        `/orders/${shopstackOrderId}/payment-failed`
                    );

                } catch (error) {

                    console.error(
                        "Unable to update failed payment:",
                        error
                    );
                }

                setLoading(false);

                alert(
                    response.error?.description ||
                    "Payment failed."
                );

                navigate(
                    `/customer/orders/${shopstackOrderId}`
                );
            }
        );


        razorpay.open();
    };


    // =====================================================
    // PLACE ORDER
    // =====================================================

    const handlePlaceOrder = async (e) => {

        e.preventDefault();


        const customerId =
            localStorage.getItem("userId");


        if (!customerId) {

            navigate("/login");

            return;
        }


        if (cartItems.length === 0) {

            alert(
                "Your cart is empty."
            );

            navigate(
                "/customer/cart"
            );

            return;
        }


        try {

            setLoading(true);


            // =================================================
            // CREATE SHOPSTACK ORDER
            // =================================================

            const orderData = {

                customerId:
                    Number(customerId),


                // IMPORTANT:
                // subtotal already contains
                // vendor product discounts.
                totalAmount:
                    total,


                // Coupon discount remains separate.
                discountAmount:
                    discount,


                couponCode:
                    couponApplied
                        ? couponCode
                        : null,


                address:
                    formData.address,

                city:
                    formData.city,

                state:
                    formData.state,

                pincode:
                    formData.pincode,

                country:
                    formData.country,

                status:
                    "PENDING",

                paymentStatus:
                    "PENDING",

                paymentMethod:
                    "RAZORPAY",


                // =================================================
                // ORDER ITEMS
                // =================================================

                items:
                    cartItems.map((item) => ({

                        product: {

                            id:
                                Number(item.id)
                        },

                        quantity:
                            Number(
                                item.cartQuantity
                            )
                    }))
            };


            console.log(
                "Creating order:",
                orderData
            );


            const orderResponse =
                await api.post(
                    "/orders",
                    orderData
                );


            const shopstackOrderId =
                orderResponse.data.id;


            // =================================================
            // CREATE RAZORPAY ORDER
            // =================================================

            const razorpayResponse =
                await api.post(
                    "/payments/create-order",
                    null,
                    {
                        params: {
                            orderId:
                                shopstackOrderId
                        }
                    }
                );


            const razorpayOrder =
                razorpayResponse.data;


            console.log(
                "Razorpay order:",
                razorpayOrder
            );


            // =================================================
            // LOAD RAZORPAY
            // =================================================

            if (!window.Razorpay) {

                const script =
                    document.createElement(
                        "script"
                    );

                script.src =
                    "https://checkout.razorpay.com/v1/checkout.js";


                script.onload = () => {

                    openRazorpayCheckout(
                        razorpayOrder,
                        shopstackOrderId,
                        customerId
                    );
                };


                script.onerror = () => {

                    setLoading(false);

                    alert(
                        "Unable to load Razorpay Checkout."
                    );
                };


                document.body.appendChild(
                    script
                );

            } else {

                openRazorpayCheckout(
                    razorpayOrder,
                    shopstackOrderId,
                    customerId
                );
            }

        } catch (error) {

            console.error(
                "Checkout error:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            alert(
                typeof error.response?.data === "string"
                    ? error.response.data
                    : error.response?.data?.message ||
                      "Unable to start payment."
            );

            setLoading(false);
        }
    };


    // =====================================================
    // EMPTY CART
    // =====================================================

    if (cartItems.length === 0) {

        return (
            <>
                <CustomerNavbar />

                <div className="checkout-empty">

                    <div className="checkout-empty-icon">
                        🛒
                    </div>

                    <h2>
                        Your cart is empty
                    </h2>

                    <p>
                        Add products to your cart before
                        proceeding to checkout.
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                "/customer/home"
                            )
                        }
                    >
                        Continue Shopping
                    </button>

                </div>
            </>
        );
    }


    // =====================================================
    // UI
    // =====================================================

    return (
        <>
            <CustomerNavbar />

            <main className="checkout-page">

                <div className="checkout-container">


                    {/* =========================================
                        HEADER
                    ========================================== */}

                    <header className="checkout-header">

                        <div>

                            <span className="checkout-eyebrow">
                                SHOPSTACK / CHECKOUT
                            </span>

                            <h1>
                                Complete Your Order
                            </h1>

                            <p>
                                Review your details and complete
                                your payment securely.
                            </p>

                        </div>


                        <div className="checkout-step">

                            <span className="step-active">
                                1
                            </span>

                            <div></div>

                            <span>
                                2
                            </span>

                            <div></div>

                            <span>
                                3
                            </span>

                            <small>
                                Address&nbsp;&nbsp; Payment&nbsp;&nbsp; Complete
                            </small>

                        </div>

                    </header>


                    {/* =========================================
                        CONTENT
                    ========================================== */}

                    <div className="checkout-content">


                        {/* =====================================
                            LEFT SIDE
                        ====================================== */}

                        <form
                            className="checkout-form"
                            onSubmit={
                                handlePlaceOrder
                            }
                        >


                            {/* =================================
                                DELIVERY ADDRESS
                            ================================== */}

                            <section className="checkout-card">

                                <div className="checkout-card-heading">

                                    <div className="checkout-card-number">
                                        01
                                    </div>

                                    <div>

                                        <h2>
                                            Delivery Address
                                        </h2>

                                        <p>
                                            Where should we deliver
                                            your order?
                                        </p>

                                    </div>

                                </div>


                                <div className="checkout-field">

                                    <label>
                                        Complete Address
                                    </label>

                                    <textarea
                                        name="address"
                                        placeholder="House number, street, area..."
                                        value={
                                            formData.address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                <div className="checkout-input-row">

                                    <div className="checkout-field">

                                        <label>
                                            City
                                        </label>

                                        <input
                                            name="city"
                                            placeholder="Kakinada"
                                            value={
                                                formData.city
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                    </div>


                                    <div className="checkout-field">

                                        <label>
                                            State
                                        </label>

                                        <input
                                            name="state"
                                            placeholder="Andhra Pradesh"
                                            value={
                                                formData.state
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                    </div>

                                </div>


                                <div className="checkout-input-row">

                                    <div className="checkout-field">

                                        <label>
                                            Pincode
                                        </label>

                                        <input
                                            name="pincode"
                                            placeholder="533016"
                                            value={
                                                formData.pincode
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                    </div>


                                    <div className="checkout-field">

                                        <label>
                                            Country
                                        </label>

                                        <input
                                            name="country"
                                            placeholder="India"
                                            value={
                                                formData.country
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                    </div>

                                </div>

                            </section>


                            {/* =================================
                                PAYMENT METHOD
                            ================================== */}

                            <section className="checkout-card">

                                <div className="checkout-card-heading">

                                    <div className="checkout-card-number">
                                        02
                                    </div>

                                    <div>

                                        <h2>
                                            Payment Method
                                        </h2>

                                        <p>
                                            Choose your secure payment
                                            method.
                                        </p>

                                    </div>

                                </div>


                                <label className="payment-option">

                                    <div className="payment-radio">

                                        <input
                                            type="radio"
                                            checked={true}
                                            readOnly
                                        />

                                    </div>


                                    <div className="payment-logo">
                                        R
                                    </div>


                                    <div className="payment-details">

                                        <strong>
                                            Razorpay
                                        </strong>

                                        <span>
                                            Secure payment via
                                            Razorpay
                                        </span>

                                    </div>


                                    <div className="payment-secure">
                                        SECURE
                                    </div>

                                </label>

                            </section>


                            {/* =================================
                                PAY BUTTON
                            ================================== */}

                            <button
                                type="submit"
                                className="place-order-button"
                                disabled={loading}
                            >

                                <span>

                                    {loading
                                        ? "Opening Payment..."
                                        : "Proceed to Secure Payment"
                                    }

                                </span>

                                {!loading && (
                                    <strong>
                                        ₹
                                        {total.toLocaleString(
                                            "en-IN"
                                        )}
                                    </strong>
                                )}

                            </button>


                            <div className="checkout-security">

                                <span>
                                    🔒
                                </span>

                                <p>
                                    Your payment is protected with
                                    secure encryption.
                                </p>

                            </div>

                        </form>


                        {/* =====================================
                            RIGHT SIDE
                        ====================================== */}

                        <aside className="checkout-summary">


                            {/* =================================
                                ORDER SUMMARY HEADER
                            ================================== */}

                            <div className="summary-header">

                                <div>

                                    <span>
                                        YOUR ORDER
                                    </span>

                                    <h2>
                                        Order Summary
                                    </h2>

                                </div>

                                <div className="item-count">

                                    {cartItems.length}

                                    {" "}

                                    {cartItems.length === 1
                                        ? "item"
                                        : "items"}

                                </div>

                            </div>


                            {/* =================================
                                ITEMS
                            ================================== */}

                            <div className="checkout-items">

                                {cartItems.map(
                                    (item) => {

                                        const originalPrice =
                                            Number(item.price) || 0;

                                        const discountedPrice =
                                            getDiscountedPrice(item);

                                        const hasDiscount =
                                            Number(
                                                item.discountPercentage
                                            ) > 0 &&
                                            discountedPrice <
                                            originalPrice;

                                        const itemTotal =
                                            discountedPrice *
                                            Number(
                                                item.cartQuantity
                                            );


                                        return (

                                            <div
                                                className="checkout-item"
                                                key={item.id}
                                            >

                                                <div className="checkout-item-image">

                                                    <img
                                                        src={
                                                            item.imageUrl
                                                        }
                                                        alt={
                                                            item.productName
                                                        }
                                                    />

                                                    <span>
                                                        {
                                                            item.cartQuantity
                                                        }
                                                    </span>

                                                </div>


                                                <div className="checkout-item-info">

                                                    <strong>
                                                        {
                                                            item.productName
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            item.brand
                                                        }
                                                    </span>

                                                    <small>
                                                        Qty:{" "}
                                                        {
                                                            item.cartQuantity
                                                        }
                                                    </small>

                                                </div>


                                                <div className="checkout-item-price">

                                                    {hasDiscount && (

                                                        <span
                                                            style={{
                                                                textDecoration:
                                                                    "line-through",
                                                                opacity: 0.6,
                                                                marginRight: "6px"
                                                            }}
                                                        >
                                                            ₹
                                                            {
                                                                originalPrice.toLocaleString(
                                                                    "en-IN"
                                                                )
                                                            }
                                                        </span>

                                                    )}

                                                    <strong>
                                                        ₹
                                                        {
                                                            itemTotal.toLocaleString(
                                                                "en-IN"
                                                            )
                                                        }
                                                    </strong>

                                                    {hasDiscount && (

                                                        <small
                                                            style={{
                                                                display: "block"
                                                            }}
                                                        >
                                                            {
                                                                item.discountPercentage
                                                            }%
                                                            OFF
                                                        </small>

                                                    )}

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>


                            {/* =================================
                                COUPON
                            ================================== */}

                            <div className="coupon-section">

                                <div className="coupon-heading">

                                    <span className="coupon-icon">
                                        %
                                    </span>

                                    <div>

                                        <strong>
                                            Have a coupon?
                                        </strong>

                                        <span>
                                            Save more on your order
                                        </span>

                                    </div>

                                </div>


                                {!couponApplied ? (

                                    <div className="coupon-input-row">

                                        <input
                                            type="text"
                                            placeholder="Enter coupon code"
                                            value={
                                                couponCode
                                            }
                                            onChange={(e) =>
                                                setCouponCode(
                                                    e.target.value
                                                        .toUpperCase()
                                                )
                                            }
                                            onKeyDown={(e) => {

                                                if (
                                                    e.key === "Enter"
                                                ) {

                                                    e.preventDefault();

                                                    applyCoupon();
                                                }

                                            }}
                                        />

                                        <button
                                            type="button"
                                            onClick={
                                                applyCoupon
                                            }
                                            disabled={
                                                couponLoading
                                            }
                                        >

                                            {couponLoading
                                                ? "..."
                                                : "Apply"}

                                        </button>

                                    </div>

                                ) : (

                                    <div className="coupon-applied">

                                        <div>

                                            <span className="coupon-check">
                                                ✓
                                            </span>

                                            <div>

                                                <strong>
                                                    {couponCode}
                                                </strong>

                                                <span>
                                                    {couponMessage}
                                                </span>

                                            </div>

                                        </div>


                                        <button
                                            type="button"
                                            onClick={
                                                removeCoupon
                                            }
                                        >
                                            Remove
                                        </button>

                                    </div>

                                )}


                                {!couponApplied &&
                                    couponMessage && (

                                        <p className="coupon-error">
                                            {couponMessage}
                                        </p>

                                    )}

                            </div>


                            {/* =================================
                                PRICE BREAKDOWN
                            ================================== */}

                            <div className="checkout-divider" />


                            <div className="checkout-summary-row">

                                <span>
                                    Subtotal
                                </span>

                                <strong>
                                    ₹
                                    {subtotal.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>

                            </div>


                            <div className="checkout-summary-row">

                                <span>
                                    Delivery
                                </span>

                                <strong
                                    className={
                                        delivery === 0
                                            ? "free-text"
                                            : ""
                                    }
                                >

                                    {delivery === 0
                                        ? "FREE"
                                        : `₹${delivery}`}

                                </strong>

                            </div>


                            <div className="checkout-summary-row">

                                <span>
                                    Discount
                                </span>

                                <strong
                                    className={
                                        discount > 0
                                            ? "discount-text"
                                            : ""
                                    }
                                >

                                    {discount > 0
                                        ? `-₹${discount.toLocaleString(
                                            "en-IN"
                                        )}`
                                        : "₹0"}

                                </strong>

                            </div>


                            <div className="checkout-divider" />


                            {/* =================================
                                TOTAL
                            ================================== */}

                            <div className="checkout-total">

                                <div>

                                    <span>
                                        Total
                                    </span>

                                    <small>
                                        Inclusive of all charges
                                    </small>

                                </div>

                                <strong>
                                    ₹
                                    {total.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>

                            </div>


                            {/* =================================
                                FREE DELIVERY MESSAGE
                            ================================== */}

                            <div className="free-delivery-banner">

                                <span>
                                    ✓
                                </span>

                                <p>

                                    {delivery === 0
                                        ? "Free delivery applied to your order."
                                        : "Add ₹" +
                                          (
                                              1000 -
                                              subtotal
                                          ).toLocaleString(
                                              "en-IN"
                                          ) +
                                          " more for free delivery."
                                    }

                                </p>

                            </div>

                        </aside>

                    </div>

                </div>

            </main>
        </>
    );
}

export default Checkout;

