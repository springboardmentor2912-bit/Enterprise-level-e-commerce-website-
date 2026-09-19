import React, { useEffect, useState } from "react";
import axios from "axios";
import AddressSection from "../components/AddressSection";
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const Checkout = () => {

    // =========================================================
    // STATE
    // =========================================================

    const [cartItems, setCartItems] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);

    const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");

    const [couponCode, setCouponCode] = useState("");
    const [availableCoupons, setAvailableCoupons] = useState([]);

    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponFinalAmount, setCouponFinalAmount] = useState(null);

    const [couponMessage, setCouponMessage] = useState("");
    const [couponError, setCouponError] = useState("");

    const [loading, setLoading] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);

    const token = localStorage.getItem("token");


    // =========================================================
    // LOAD CART + ADDRESSES + COUPONS
    // =========================================================

    useEffect(() => {

        fetchCart();
        fetchAddresses();
        fetchAvailableCoupons();

    }, []);


    // =========================================================
    // FETCH AVAILABLE COUPONS
    // =========================================================

    const fetchAvailableCoupons = async () => {

        try {

            const response = await axios.get(
                `${API}/api/coupons/available`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(
                "========== AVAILABLE COUPONS =========="
            );

            console.log(response.data);

            console.log(
                "======================================="
            );


            const data = response.data;


            // Backend may return:
            // [ ... ]
            if (Array.isArray(data)) {

                setAvailableCoupons(data);

            }

                // Backend may return:
            // { coupons: [ ... ] }
            else if (Array.isArray(data.coupons)) {

                setAvailableCoupons(data.coupons);

            }

            else {

                console.error(
                    "Unexpected coupon response:",
                    data
                );

                setAvailableCoupons([]);

            }

        } catch (error) {

            console.error(
                "Error loading available coupons:",
                error.response?.data || error
            );

            setAvailableCoupons([]);

        }

    };


    // =========================================================
    // FETCH CART
    // =========================================================

    const fetchCart = async () => {

        try {

            const response = await axios.get(
                `${API}/api/cart`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            console.log(
                "========== CART RESPONSE =========="
            );

            console.log(response.data);

            console.log(
                "==================================="
            );


            const data = response.data;


            if (Array.isArray(data)) {

                setCartItems(data);

            }

            else if (Array.isArray(data.items)) {

                setCartItems(data.items);

            }

            else if (Array.isArray(data.cartItems)) {

                setCartItems(data.cartItems);

            }

            else {

                console.error(
                    "Unexpected cart response:",
                    data
                );

                setCartItems([]);

            }

        } catch (error) {

            console.error(
                "Error loading cart:",
                error.response?.data || error
            );

            setCartItems([]);

        }

    };


    // =========================================================
    // FETCH ADDRESSES
    // =========================================================

    const fetchAddresses = async () => {

        try {

            const response = await axios.get(
                `${API}/api/addresses`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            const data = response.data;


            if (Array.isArray(data)) {

                setAddresses(data);


                if (data.length > 0) {

                    setSelectedAddress(data[0]);

                }

            }

            else {

                setAddresses([]);

            }

        } catch (error) {

            console.error(
                "Error loading addresses:",
                error.response?.data || error
            );

            setAddresses([]);

        }

    };


    // =========================================================
    // GET PRODUCT PRICE
    // =========================================================

    const getProductPrice = (item) => {

        const product = item?.product || item?.productDetails || item;


        const possiblePrices = [

            product?.finalPrice,

            product?.sellingPrice,

            product?.discountedPrice,

            product?.price,

            item?.finalPrice,

            item?.sellingPrice,

            item?.price

        ];


        for (const value of possiblePrices) {

            if (
                value !== null &&
                value !== undefined &&
                value !== ""
            ) {

                const numericValue = Number(value);


                if (!isNaN(numericValue)) {

                    return numericValue;

                }

            }

        }


        return 0;

    };


    // =========================================================
    // GET PRODUCT NAME
    // =========================================================

    const getProductName = (item) => {

        return (
            item?.product?.name ||
            item?.productDetails?.name ||
            item?.name ||
            "Product"
        );

    };


    // =========================================================
    // GET QUANTITY
    // =========================================================

    const getQuantity = (item) => {

        const quantity = Number(
            item?.quantity ??
            item?.qty ??
            1
        );


        return quantity > 0 ? quantity : 1;

    };


    // =========================================================
    // CALCULATE CART TOTAL
    // =========================================================

    const totalAmount = Array.isArray(cartItems)

        ? cartItems.reduce(
            (total, item) => {

                const price =
                    getProductPrice(item);

                const quantity =
                    getQuantity(item);

                return total + (price * quantity);

            },
            0
        )

        : 0;


    // =========================================================
    // FORMAT PRICE
    // =========================================================

    const formatPrice = (amount) => {

        return `₹${Number(amount || 0).toFixed(2)}`;

    };


    // =========================================================
    // APPLY COUPON
    // =========================================================

    const handleApplyCoupon = async () => {

        // -----------------------------------------------------
        // CHECK COUPON CODE
        // -----------------------------------------------------

        if (!couponCode.trim()) {

            setCouponError(
                "Please enter a coupon code"
            );

            setCouponMessage("");

            return;

        }


        // -----------------------------------------------------
        // CHECK CART
        // -----------------------------------------------------

        if (totalAmount <= 0) {

            setCouponError(
                "Cart amount must be greater than ₹0"
            );

            setCouponMessage("");

            return;

        }


        try {

            setLoading(true);

            setCouponError("");
            setCouponMessage("");


            console.log(
                "Applying coupon:",
                couponCode.trim()
            );

            console.log(
                "Cart amount:",
                totalAmount
            );


            const response = await axios.post(

                `${API}/api/coupons/apply`,

                {
                    couponCode:
                        couponCode.trim(),

                    cartAmount:
                    totalAmount
                },

                {
                    headers: {

                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    }
                }

            );


            console.log(
                "========== COUPON RESPONSE =========="
            );

            console.log(response.data);

            console.log(
                "====================================="
            );


            const data = response.data;


            // -------------------------------------------------
            // SUPPORT DIFFERENT BACKEND FIELD NAMES
            // -------------------------------------------------

            const discount = Number(

                data.discountAmount ??
                data.discount ??
                data.couponDiscount ??
                0

            );


            let finalAmount = Number(

                data.finalAmount ??
                data.payableAmount ??
                data.totalAmount ??
                (totalAmount - discount)

            );


            // -------------------------------------------------
            // SAFETY
            // -------------------------------------------------

            if (isNaN(finalAmount)) {

                finalAmount =
                    totalAmount - discount;

            }


            if (finalAmount < 0) {

                finalAmount = 0;

            }


            // -------------------------------------------------
            // SET STATE
            // -------------------------------------------------

            setCouponDiscount(
                discount
            );

            setCouponFinalAmount(
                finalAmount
            );


            setCouponMessage(

                `Coupon applied successfully! You saved ${formatPrice(discount)}`

            );


        } catch (error) {

            console.error(
                "Coupon error:",
                error.response?.data || error
            );


            setCouponDiscount(0);

            setCouponFinalAmount(null);


            let errorMessage =
                "Invalid coupon";


            if (
                error.response?.data?.message
            ) {

                errorMessage =
                    error.response.data.message;

            }

            else if (
                typeof error.response?.data ===
                "string"
            ) {

                errorMessage =
                    error.response.data;

            }


            setCouponError(
                errorMessage
            );

        } finally {

            setLoading(false);

        }

    };


    // =========================================================
    // REMOVE COUPON
    // =========================================================

    const handleRemoveCoupon = () => {

        setCouponCode("");

        setCouponDiscount(0);

        setCouponFinalAmount(null);

        setCouponMessage("");

        setCouponError("");

    };


    // =========================================================
    // USE COUPON BUTTON
    // =========================================================

    const handleUseCoupon = (coupon) => {

        const code =
            coupon?.couponCode ||
            coupon?.code ||
            coupon?.coupon?.couponCode ||
            "";


        if (!code) {

            console.error(
                "Coupon code not found:",
                coupon
            );

            setCouponError(
                "Unable to read coupon code"
            );

            return;

        }


        setCouponCode(
            code.toUpperCase()
        );

        setCouponError("");

        setCouponMessage("");

    };


    // =========================================================
    // FINAL PAYABLE AMOUNT
    // =========================================================

    const payableAmount =

        couponFinalAmount !== null

            ? Number(couponFinalAmount)

            : Number(totalAmount);


    // =========================================================
    // PLACE ORDER
    // =========================================================

    const handlePlaceOrder = async () => {

        // -----------------------------------------------------
        // ADDRESS
        // -----------------------------------------------------

        if (!selectedAddress) {

            alert(
                "Please select an address"
            );

            return;

        }


        // -----------------------------------------------------
        // CART
        // -----------------------------------------------------

        if (cartItems.length === 0) {

            alert(
                "Your cart is empty"
            );

            return;

        }


        // -----------------------------------------------------
        // TOTAL
        // -----------------------------------------------------

        if (payableAmount <= 0) {

            alert(
                "Order amount must be greater than ₹0"
            );

            return;

        }


        try {

            setPlacingOrder(true);


            // =================================================
            // RAZORPAY
            // =================================================

            if (
                paymentMethod ===
                "RAZORPAY"
            ) {


                const orderResponse =
                    await axios.post(

                        `${API}/api/payment/create-order`,

                        {
                            amount:
                            payableAmount
                        },

                        {
                            headers: {

                                Authorization:
                                    `Bearer ${token}`,

                                "Content-Type":
                                    "application/json"

                            }
                        }

                    );


                console.log(
                    "Razorpay order:",
                    orderResponse.data
                );


                const razorpayOrderId =
                    orderResponse.data.id;


                const options = {

                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,

                    amount:
                    orderResponse.data.amount,

                    currency:
                        orderResponse.data.currency ||
                        "INR",

                    name:
                        "ShopStack",

                    description:
                        "ShopStack Order",

                    order_id:
                    razorpayOrderId,


                    handler:
                        async function (
                            paymentResponse
                        ) {

                            try {


                                // =====================================
                                // CREATE SHOPSTACK ORDER
                                // =====================================

                                await axios.post(

                                    `${API}/api/orders`,

                                    {

                                        addressId:
                                        selectedAddress.id,

                                        paymentMethod:
                                        paymentMethod,

                                        paymentStatus:
                                            "PAID",

                                        razorpayPaymentId:
                                        paymentResponse
                                            .razorpay_payment_id,

                                        razorpayOrderId:
                                        paymentResponse
                                            .razorpay_order_id,

                                        couponCode:
                                            couponCode ||
                                            null,

                                        couponDiscount:
                                        couponDiscount,

                                        finalAmount:
                                        payableAmount

                                    },

                                    {

                                        headers: {

                                            Authorization:
                                                `Bearer ${token}`,

                                            "Content-Type":
                                                "application/json"

                                        }

                                    }

                                );


                                alert(
                                    "Order placed successfully!"
                                );


                                window.location.href =
                                    "/order-success";


                            } catch (error) {

                                console.error(

                                    "Order creation error:",

                                    error.response?.data ||
                                    error

                                );


                                alert(

                                    "Payment succeeded, but order creation failed. Please contact support."

                                );

                            }

                        },


                    // =============================================
                    // RAZORPAY PREFILL
                    // =============================================

                    prefill: {

                        name:
                            localStorage.getItem(
                                "userName"
                            ) || "",

                        email:
                            localStorage.getItem(
                                "userEmail"
                            ) || ""

                    },


                    theme: {

                        color:
                            "#2563eb"

                    }

                };


                // -------------------------------------------------
                // OPEN RAZORPAY
                // -------------------------------------------------

                if (
                    !window.Razorpay
                ) {

                    alert(
                        "Razorpay is not loaded. Please refresh the page."
                    );

                    return;

                }


                const razorpay =
                    new window.Razorpay(
                        options
                    );


// =================================================
// RAZORPAY PAYMENT FAILED
// =================================================

                razorpay.on(
                    "payment.failed",
                    async function (response) {

                        console.error(
                            "Razorpay payment failed:",
                            response.error
                        );

                        try {

                            await axios.post(
                                `${API}/api/payment/failed`,
                                {
                                    razorpayOrderId:
                                    razorpayOrderId,

                                    amount:
                                    payableAmount,

                                    errorDescription:
                                        response.error?.description ||
                                        "Payment failed",

                                    errorReason:
                                        response.error?.reason ||
                                        "UNKNOWN"
                                },
                                {
                                    headers: {
                                        Authorization:
                                            `Bearer ${token}`,

                                        "Content-Type":
                                            "application/json"
                                    }
                                }
                            );

                        } catch (error) {

                            console.error(
                                "Failed to process payment failure notification:",
                                error.response?.data ||
                                error
                            );
                        }

                    }
                );


                razorpay.open();


                return;

            }


            // =================================================
            // CASH ON DELIVERY
            // =================================================

            if (
                paymentMethod ===
                "COD"
            ) {


                await axios.post(

                    `${API}/api/orders`,

                    {

                        addressId:
                        selectedAddress.id,

                        paymentMethod:
                            "COD",

                        paymentStatus:
                            "PENDING",

                        couponCode:
                            couponCode ||
                            null,

                        couponDiscount:
                        couponDiscount,

                        finalAmount:
                        payableAmount

                    },

                    {

                        headers: {

                            Authorization:
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"

                        }

                    }

                );


                alert(
                    "Order placed successfully!"
                );


                window.location.href =
                    "/order-success";

            }

        } catch (error) {

            console.error(

                "Place order error:",

                error.response?.data ||
                error

            );


            alert(

                error.response?.data?.message ||
                "Failed to place order"

            );

        } finally {

            setPlacingOrder(false);

        }

    };


    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="min-h-screen bg-gray-100 py-8 px-4">

            <div className="max-w-5xl mx-auto">


                {/* ================================================= */}
                {/* PAGE TITLE */}
                {/* ================================================= */}

                <h1 className="text-3xl font-bold mb-8">

                    Checkout

                </h1>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


                    {/* ================================================= */}
                    {/* LEFT SIDE */}
                    {/* ================================================= */}

                    <div className="lg:col-span-2 space-y-6">


                        {/* ================================================= */}
                        {/* ADDRESS */}
                        {/* ================================================= */}

                        <AddressSection
                            selectedAddress={selectedAddress}
                            setSelectedAddress={setSelectedAddress}
                        />


                        {/* ================================================= */}
                        {/* CART ITEMS */}
                        {/* ================================================= */}

                        <div className="bg-white rounded-lg shadow p-6">

                            <h2 className="text-xl font-semibold mb-4">

                                Your Items

                            </h2>


                            {cartItems.length === 0 ? (

                                <p className="text-gray-500">

                                    Your cart is empty.

                                </p>

                            ) : (

                                <div className="space-y-4">

                                    {cartItems.map(
                                        (item, index) => {

                                            const price =
                                                getProductPrice(
                                                    item
                                                );


                                            const quantity =
                                                getQuantity(
                                                    item
                                                );


                                            return (

                                                <div
                                                    key={
                                                        item.id ||
                                                        index
                                                    }
                                                    className="flex justify-between items-center border-b pb-4"
                                                >

                                                    <div>

                                                        <p className="font-medium">

                                                            {
                                                                getProductName(
                                                                    item
                                                                )
                                                            }

                                                        </p>


                                                        <p className="text-gray-500">

                                                            Qty:{" "}
                                                            {
                                                                quantity
                                                            }

                                                        </p>


                                                        <p className="text-sm text-gray-400">

                                                            Price:{" "}
                                                            {
                                                                formatPrice(
                                                                    price
                                                                )
                                                            }

                                                        </p>

                                                    </div>


                                                    <p className="font-semibold">

                                                        {
                                                            formatPrice(
                                                                price *
                                                                quantity
                                                            )
                                                        }

                                                    </p>

                                                </div>

                                            );

                                        }
                                    )}

                                </div>

                            )}

                        </div>


                        {/* ================================================= */}
                        {/* COUPON */}
                        {/* ================================================= */}

                        <div className="bg-white rounded-lg shadow p-6">

                            <h2 className="text-xl font-semibold mb-4">

                                Apply Coupon

                            </h2>


                            {/* ============================================= */}
                            {/* AVAILABLE COUPONS */}
                            {/* ============================================= */}

                            {availableCoupons.length > 0 && (

                                <div className="mb-6">

                                    <h3 className="font-semibold text-gray-700 mb-3">

                                        Available Coupons

                                    </h3>


                                    <div className="space-y-3">

                                        {availableCoupons.map(
                                            (coupon, index) => {

                                                const code =
                                                    coupon?.couponCode ||
                                                    coupon?.code ||
                                                    coupon?.coupon?.couponCode ||
                                                    "";


                                                const discountType =
                                                    coupon?.discountType ||
                                                    coupon?.type ||
                                                    "";


                                                const discountValue =
                                                    coupon?.discountValue ??
                                                    coupon?.discount ??
                                                    coupon?.value ??
                                                    0;


                                                const minimumOrder =
                                                    coupon?.minimumOrderAmount ??
                                                    coupon?.minOrderAmount ??
                                                    coupon?.minOrder ??
                                                    null;


                                                const maximumDiscount =
                                                    coupon?.maxDiscountAmount ??
                                                    coupon?.maximumDiscount ??
                                                    coupon?.maxDiscount ??
                                                    null;


                                                return (

                                                    <div
                                                        key={
                                                            coupon.id ||
                                                            index
                                                        }
                                                        className="border rounded-lg p-4 bg-gray-50"
                                                    >

                                                        <div className="flex justify-between items-start gap-4">


                                                            {/* COUPON INFO */}

                                                            <div>

                                                                <p className="text-lg font-bold text-blue-600">

                                                                    {
                                                                        code ||
                                                                        "Coupon"
                                                                    }

                                                                </p>


                                                                <p className="text-sm text-gray-700 mt-1 font-medium">

                                                                    {
                                                                        (
                                                                            discountType ===
                                                                            "PERCENTAGE" ||
                                                                            discountType ===
                                                                            "PERCENT"
                                                                        )

                                                                            ? `${discountValue}% OFF`

                                                                            : `₹${discountValue} OFF`

                                                                    }

                                                                </p>


                                                                {minimumOrder !== null && (

                                                                    <p className="text-sm text-gray-500 mt-1">

                                                                        Minimum order:{" "}
                                                                        ₹
                                                                        {
                                                                            minimumOrder
                                                                        }

                                                                    </p>

                                                                )}


                                                                {maximumDiscount !== null && (

                                                                    <p className="text-sm text-gray-500">

                                                                        Maximum discount:{" "}
                                                                        ₹
                                                                        {
                                                                            maximumDiscount
                                                                        }

                                                                    </p>

                                                                )}

                                                            </div>


                                                            {/* USE COUPON */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleUseCoupon(
                                                                        coupon
                                                                    )
                                                                }
                                                                disabled={
                                                                    couponFinalAmount !==
                                                                    null
                                                                }
                                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                                            >

                                                                Use Coupon

                                                            </button>

                                                        </div>

                                                    </div>

                                                );

                                            }
                                        )}

                                    </div>

                                </div>

                            )}


                            {/* ============================================= */}
                            {/* NO COUPONS */}
                            {/* ============================================= */}

                            {availableCoupons.length === 0 && (

                                <div className="bg-gray-50 border rounded-lg p-4 mb-5">

                                    <p className="text-gray-500">

                                        No coupons available for this order.

                                    </p>

                                </div>

                            )}


                            {/* ============================================= */}
                            {/* ENTER COUPON CODE */}
                            {/* ============================================= */}

                            <div className="flex gap-3">

                                <input

                                    type="text"

                                    value={
                                        couponCode
                                    }

                                    onChange={(e) => {

                                        setCouponCode(
                                            e.target.value.toUpperCase()
                                        );

                                        setCouponError("");

                                        setCouponMessage("");

                                    }}

                                    placeholder="Enter coupon code"

                                    className="flex-1 border rounded-lg px-4 py-3"

                                    disabled={
                                        couponFinalAmount !==
                                        null
                                    }

                                />


                                {couponFinalAmount ===
                                null ? (

                                    <button

                                        type="button"

                                        onClick={
                                            handleApplyCoupon
                                        }

                                        disabled={
                                            loading ||
                                            totalAmount <= 0
                                        }

                                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"

                                    >

                                        {loading
                                            ? "Applying..."
                                            : "Apply"}

                                    </button>

                                ) : (

                                    <button

                                        type="button"

                                        onClick={
                                            handleRemoveCoupon
                                        }

                                        className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"

                                    >

                                        Remove

                                    </button>

                                )}

                            </div>


                            {/* ============================================= */}
                            {/* SUCCESS */}
                            {/* ============================================= */}

                            {couponMessage && (

                                <p className="text-green-600 mt-3">

                                    {couponMessage}

                                </p>

                            )}


                            {/* ============================================= */}
                            {/* ERROR */}
                            {/* ============================================= */}

                            {couponError && (

                                <p className="text-red-600 mt-3">

                                    {couponError}

                                </p>

                            )}

                        </div>


                        {/* ================================================= */}
                        {/* PAYMENT METHOD */}
                        {/* ================================================= */}

                        <div className="bg-white rounded-lg shadow p-6">

                            <h2 className="text-xl font-semibold mb-4">

                                Payment Method

                            </h2>


                            <div className="space-y-3">


                                {/* RAZORPAY */}

                                <label className="flex items-center gap-3">

                                    <input

                                        type="radio"

                                        name="payment"

                                        value="RAZORPAY"

                                        checked={
                                            paymentMethod ===
                                            "RAZORPAY"
                                        }

                                        onChange={(e) =>
                                            setPaymentMethod(
                                                e.target.value
                                            )
                                        }

                                    />

                                    Razorpay

                                </label>


                                {/* COD */}

                                <label className="flex items-center gap-3">

                                    <input

                                        type="radio"

                                        name="payment"

                                        value="COD"

                                        checked={
                                            paymentMethod ===
                                            "COD"
                                        }

                                        onChange={(e) =>
                                            setPaymentMethod(
                                                e.target.value
                                            )
                                        }

                                    />

                                    Cash on Delivery

                                </label>

                            </div>

                        </div>

                    </div>


                    {/* ================================================= */}
                    {/* RIGHT SIDE - ORDER SUMMARY */}
                    {/* ================================================= */}

                    <div>

                        <div className="bg-white rounded-lg shadow p-6 sticky top-6">


                            <h2 className="text-xl font-semibold mb-6">

                                Order Summary

                            </h2>


                            <div className="space-y-4">


                                {/* SUBTOTAL */}

                                <div className="flex justify-between">

                                    <span>

                                        Subtotal

                                    </span>

                                    <span>

                                        {
                                            formatPrice(
                                                totalAmount
                                            )
                                        }

                                    </span>

                                </div>


                                {/* COUPON DISCOUNT */}

                                {couponDiscount > 0 && (

                                    <div className="flex justify-between text-green-600">

                                        <span>

                                            Coupon Discount

                                        </span>

                                        <span>

                                            -{" "}
                                            {
                                                formatPrice(
                                                    couponDiscount
                                                )
                                            }

                                        </span>

                                    </div>

                                )}


                                {/* DELIVERY */}

                                <div className="flex justify-between">

                                    <span>

                                        Delivery

                                    </span>

                                    <span>

                                        FREE

                                    </span>

                                </div>


                                <hr />


                                {/* TOTAL */}

                                <div className="flex justify-between text-xl font-bold">

                                    <span>

                                        Total

                                    </span>

                                    <span className="text-blue-600">

                                        {
                                            formatPrice(
                                                payableAmount
                                            )
                                        }

                                    </span>

                                </div>

                            </div>


                            {/* ================================================= */}
                            {/* PAY BUTTON */}
                            {/* ================================================= */}

                            <button

                                onClick={
                                    handlePlaceOrder
                                }

                                disabled={

                                    placingOrder ||

                                    cartItems.length === 0 ||

                                    !selectedAddress ||

                                    payableAmount <= 0

                                }

                                className="w-full mt-6 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"

                            >

                                {placingOrder

                                    ? "Processing..."

                                    : `Pay ${formatPrice(
                                        payableAmount
                                    )}`

                                }

                            </button>


                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default Checkout;