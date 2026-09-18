// CustomerCheckout.jsx

import { useEffect, useState } from "react";
import api from "../services/api";
import "./CustomerCheckout.css";

function CustomerCheckout({
    cart,
    onOrderPlaced,
    onBackToCart
}) {

    const [step, setStep] = useState(1);

    // =========================================================
    // ADDRESS
    // =========================================================

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [addressError, setAddressError] = useState("");

    const [showAddAddress, setShowAddAddress] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);
    const [addressSuccess, setAddressSuccess] = useState("");

    const [addressForm, setAddressForm] = useState({
        addressLine: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phoneNumber: ""
    });

    // =========================================================
    // PAYMENT
    // =========================================================

    const [paymentMethod, setPaymentMethod] = useState("");

    // =========================================================
    // ORDER / PAYMENT
    // =========================================================

    const [placingOrder, setPlacingOrder] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [orderError, setOrderError] = useState("");

    // =========================================================
    // PAYMENT SUCCESS
    // =========================================================

    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [completedOrder, setCompletedOrder] = useState(null);
    const [completedPayment, setCompletedPayment] = useState(null);

    // =========================================================
    // COUPON
    // =========================================================

    const [couponCode, setCouponCode] = useState("");
    const [coupons, setCoupons] = useState([]);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponMessage, setCouponMessage] = useState("");
    const [couponError, setCouponError] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    // =========================================================
    // SAFE CART QUANTITY
    // =========================================================

    const getCartQuantity = (item) => {

        const quantity = Number(item?.cartQuantity);

        if (
            Number.isFinite(quantity) &&
            quantity > 0
        ) {
            return quantity;
        }

        return 0;
    };

    // =========================================================
    // AVAILABLE PRODUCT STOCK
    // =========================================================

    const getAvailableQuantity = (item) => {

        const availableQuantity = Number(
            item?.availableQuantity ??
            item?.stockQuantity ??
            item?.quantity ??
            0
        );

        if (Number.isFinite(availableQuantity)) {
            return availableQuantity;
        }

        return 0;
    };

    // =========================================================
    // CART CALCULATIONS
    // =========================================================

    const subtotal = (cart || []).reduce(
        (total, item) => {

            const price = Number(item?.price ?? 0);
            const quantity = getCartQuantity(item);

            return total + (price * quantity);
        },
        0
    );

    const discount = appliedCoupon?.discountAmount
        ? Number(appliedCoupon.discountAmount)
        : 0;

    const finalTotal = Math.max(
        subtotal - discount,
        0
    );

    // =========================================================
    // PAYMENT SUCCESS TOTAL
    // =========================================================

    const getCompletedOrderTotal = () => {

        const backendTotal = Number(
            completedOrder?.totalAmount ??
            completedPayment?.amount ??
            finalTotal
        );

        if (
            Number.isFinite(backendTotal) &&
            backendTotal >= 0
        ) {
            return backendTotal;
        }

        return finalTotal;
    };

    // =========================================================
    // PAYMENT ID
    // =========================================================

    const getPaymentId = () => {

        return (
            completedPayment?.paymentId ??
            completedPayment?.razorpayPaymentId ??
            completedPayment?.transactionId ??
            completedPayment?.paymentTransactionId ??
            "—"
        );
    };

    // =========================================================
    // RAZORPAY SCRIPT
    // =========================================================

    const loadRazorpayScript = () => {

        return new Promise((resolve) => {

            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const existingScript =
                document.querySelector(
                    'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
                );

            if (existingScript) {

                existingScript.addEventListener(
                    "load",
                    () => resolve(true)
                );

                existingScript.addEventListener(
                    "error",
                    () => resolve(false)
                );

                return;
            }

            const script =
                document.createElement("script");

            script.src =
                "https://checkout.razorpay.com/v1/checkout.js";

            script.async = true;

            script.onload = () => {
                resolve(true);
            };

            script.onerror = () => {
                resolve(false);
            };

            document.body.appendChild(script);
        });
    };

    // =========================================================
    // FRIENDLY ORDER ERROR
    // =========================================================

    const getFriendlyOrderError = (error) => {

        if (!error.response) {

            return "Unable to connect to the server. Please check your connection and try again.";
        }

        const status = error.response?.status;

        const backendMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "";

        const message =
            String(backendMessage).toLowerCase();

        if (status === 401) {
            return "Your session has expired. Please login again.";
        }

        if (status === 403) {
            return "You are not authorized to place this order.";
        }

        if (
            message.includes("stock") ||
            message.includes("insufficient") ||
            message.includes("inventory") ||
            message.includes("quantity") ||
            message.includes("available")
        ) {
            return "Some products do not have enough stock. Please update your cart and try again.";
        }

        if (
            message.includes("product") &&
            (
                message.includes("not found") ||
                message.includes("unavailable") ||
                message.includes("deleted")
            )
        ) {
            return "One of the products in your cart is no longer available.";
        }

        if (
            message.includes("address") &&
            (
                message.includes("not found") ||
                message.includes("invalid") ||
                message.includes("required")
            )
        ) {
            return "The selected delivery address is no longer available. Please select another address.";
        }

        if (
            message.includes("coupon") ||
            message.includes("discount")
        ) {
            return "The selected coupon is invalid, expired, or cannot be used for this order.";
        }

        if (
            message.includes("payment") ||
            message.includes("transaction") ||
            message.includes("razorpay")
        ) {
            return "Payment could not be completed. Please try again or select another payment method.";
        }

        if (status === 400) {
            return "Please check your order details and try again.";
        }

        if (status === 404) {
            return "The requested information could not be found. Please refresh the page and try again.";
        }

        if (status >= 500) {
            return "Server error. Please try again later.";
        }

        return "Unable to place your order. Please try again.";
    };

    // =========================================================
    // LOAD ADDRESSES
    // =========================================================

    useEffect(() => {

        let cancelled = false;

        const loadAddresses = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                if (!token) {

                    if (!cancelled) {

                        setAddressError(
                            "Please login to continue."
                        );

                        setLoadingAddresses(false);
                    }

                    return;
                }

                const response =
                    await api.get(
                        "/customer/addresses"
                    );

                if (!cancelled) {

                    const loadedAddresses =
                        Array.isArray(response.data)
                            ? response.data
                            : [];

                    setAddresses(
                        loadedAddresses
                    );

                    if (
                        loadedAddresses.length > 0
                    ) {

                        setSelectedAddress(
                            loadedAddresses[0]
                        );
                    }

                    setAddressError("");
                    setLoadingAddresses(false);
                }

            } catch (error) {

                console.error(
                    "Checkout address error:",
                    error
                );

                if (!cancelled) {

                    if (
                        error.response?.status === 401
                    ) {

                        setAddressError(
                            "Your session has expired. Please login again."
                        );

                    } else if (
                        error.response?.status === 403
                    ) {

                        setAddressError(
                            "You are not authorized to access your addresses."
                        );

                    } else if (
                        error.response?.status >= 500
                    ) {

                        setAddressError(
                            "Server error. Please try again later."
                        );

                    } else if (
                        !error.response
                    ) {

                        setAddressError(
                            "Unable to connect to the server. Please try again."
                        );

                    } else {

                        setAddressError(
                            "Unable to load your saved addresses."
                        );
                    }

                    setLoadingAddresses(false);
                }
            }
        };

        loadAddresses();

        return () => {
            cancelled = true;
        };

    }, []);

    // =========================================================
    // LOAD ACTIVE COUPONS
    // =========================================================

    useEffect(() => {

        let cancelled = false;

        const loadCoupons = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                if (!token) {
                    return;
                }

                const response =
                    await api.get(
                        "/customer/coupons/active"
                    );

                console.log(
                    "ACTIVE COUPONS:",
                    response.data
                );

                if (!cancelled) {

                    setCoupons(
                        Array.isArray(response.data)
                            ? response.data
                            : []
                    );
                }

            } catch (error) {

                console.error(
                    "Coupon loading error:",
                    error
                );

                if (!cancelled) {
                    setCoupons([]);
                }
            }
        };

        loadCoupons();

        return () => {
            cancelled = true;
        };

    }, []);

    // =========================================================
    // ADDRESS INPUT
    // =========================================================

    const handleAddressChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setAddressForm(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );
    };

    // =========================================================
    // ADDRESS VALIDATION
    // =========================================================

    const validateAddress = () => {

        if (!addressForm.addressLine.trim()) {
            return "Address is required.";
        }

        if (!addressForm.city.trim()) {
            return "City is required.";
        }

        if (!addressForm.state.trim()) {
            return "State is required.";
        }

        if (
            !/^\d{5,6}$/.test(
                addressForm.postalCode.trim()
            )
        ) {
            return "Please enter a valid postal code.";
        }

        if (!addressForm.country.trim()) {
            return "Country is required.";
        }

        if (
            !/^\d{10}$/.test(
                addressForm.phoneNumber.trim()
            )
        ) {
            return "Please enter a valid 10-digit phone number.";
        }

        return "";
    };

    // =========================================================
    // SAVE NEW ADDRESS
    // =========================================================

    const handleSaveAddress = async (e) => {

        e.preventDefault();

        setAddressError("");
        setAddressSuccess("");

        const validationError =
            validateAddress();

        if (validationError) {

            setAddressError(
                validationError
            );

            return;
        }

        try {

            setSavingAddress(true);

            const token =
                localStorage.getItem("token");

            if (!token) {

                setAddressError(
                    "Your session has expired. Please login again."
                );

                return;
            }

            const response =
                await api.post(
                    "/customer/addresses",
                    addressForm
                );

            const newAddress =
                response.data;

            const addressResponse =
                await api.get(
                    "/customer/addresses"
                );

            const updatedAddresses =
                Array.isArray(addressResponse.data)
                    ? addressResponse.data
                    : [];

            setAddresses(
                updatedAddresses
            );

            const createdAddress =
                updatedAddresses.find(
                    (address) =>
                        address.id ===
                        newAddress?.id
                ) || newAddress;

            setSelectedAddress(
                createdAddress
            );

            setAddressForm({
                addressLine: "",
                city: "",
                state: "",
                postalCode: "",
                country: "",
                phoneNumber: ""
            });

            setShowAddAddress(false);

            setAddressSuccess(
                "New delivery address added successfully."
            );

        } catch (error) {

            console.error(
                "Save checkout address error:",
                error
            );

            if (
                error.response?.status === 401
            ) {

                setAddressError(
                    "Your session has expired. Please login again."
                );

            } else if (
                error.response?.status === 403
            ) {

                setAddressError(
                    "You are not authorized to save an address."
                );

            } else if (
                error.response?.status >= 500
            ) {

                setAddressError(
                    "Server error. Please try again later."
                );

            } else if (!error.response) {

                setAddressError(
                    "Unable to connect to the server. Please try again."
                );

            } else {

                setAddressError(
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    "Unable to save the new address."
                );
            }

        } finally {

            setSavingAddress(false);
        }
    };

    // =========================================================
    // OPEN ADD ADDRESS
    // =========================================================

    const handleOpenAddAddress = () => {

        setAddressError("");
        setAddressSuccess("");

        setAddressForm({
            addressLine: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            phoneNumber: ""
        });

        setShowAddAddress(true);
    };

    // =========================================================
    // CANCEL ADD ADDRESS
    // =========================================================

    const handleCancelAddAddress = () => {

        setShowAddAddress(false);
        setAddressError("");

        setAddressForm({
            addressLine: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            phoneNumber: ""
        });
    };

    // =========================================================
    // NEXT STEP
    // =========================================================

    const nextStep = () => {

        setOrderError("");
        setAddressError("");

        if (step === 1) {

            if (!selectedAddress) {

                setAddressError(
                    "Please select a delivery address."
                );

                return;
            }

            if (!selectedAddress.id) {

                setAddressError(
                    "Please select a valid delivery address."
                );

                return;
            }

            if (showAddAddress) {

                setAddressError(
                    "Please save or cancel the new address form."
                );

                return;
            }
        }

        if (step === 2) {

            if (!paymentMethod) {

                setOrderError(
                    "Please select a payment method."
                );

                return;
            }
        }

        setStep(
            (previous) =>
                Math.min(previous + 1, 3)
        );
    };

    // =========================================================
    // PREVIOUS STEP
    // =========================================================

    const previousStep = () => {

        setOrderError("");

        setStep(
            (previous) =>
                Math.max(previous - 1, 1)
        );
    };

    // =========================================================
    // APPLY COUPON
    // =========================================================

    const handleApplyCoupon = async () => {

        const code =
            couponCode.trim();

        if (!code) {

            setCouponError(
                "Please select or enter a coupon code."
            );

            setCouponMessage("");

            return;
        }

        try {

            setCouponLoading(true);
            setCouponError("");
            setCouponMessage("");

            const token =
                localStorage.getItem("token");

            if (!token) {

                setCouponError(
                    "Please login to apply a coupon."
                );

                return;
            }

            const response =
                await api.post(
                    "/customer/coupons/validate",
                    null,
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
                "Coupon validation response:",
                data
            );

            if (data?.valid === true) {

                const discountAmount =
                    Number(
                        data.discountAmount ??
                        data.discount ??
                        data.discountValue ??
                        0
                    );

                if (discountAmount <= 0) {

                    setAppliedCoupon(null);

                    setCouponError(
                        "Coupon is valid but no discount amount was returned."
                    );

                    return;
                }

                setAppliedCoupon({

                    code:
                        data.code ||
                        code.toUpperCase(),

                    discountAmount:
                        discountAmount,

                    valid: true
                });

                setCouponMessage(
                    data.message ||
                    `Coupon applied successfully. You saved ₹${discountAmount.toFixed(2)}.`
                );

                setCouponError("");

            } else {

                setAppliedCoupon(null);

                setCouponError(
                    data?.message ||
                    "Invalid, expired, or unavailable coupon."
                );
            }

        } catch (error) {

            console.error(
                "Coupon validation error:",
                error
            );

            console.error(
                "Coupon status:",
                error.response?.status
            );

            console.error(
                "Coupon response:",
                error.response?.data
            );

            setAppliedCoupon(null);

            if (!error.response) {

                setCouponError(
                    "Unable to connect to the server. Please try again."
                );

            } else if (
                error.response?.status === 401
            ) {

                setCouponError(
                    "Your session has expired. Please login again."
                );

            } else if (
                error.response?.status === 403
            ) {

                setCouponError(
                    "You are not authorized to apply coupons."
                );

            } else if (
                error.response?.status >= 500
            ) {

                setCouponError(
                    "Server error while validating coupon. Please try again later."
                );

            } else {

                setCouponError(
                    error.response?.data?.message ||
                    error.response?.data?.error ||
                    "Invalid, expired, or unavailable coupon."
                );
            }

        } finally {

            setCouponLoading(false);
        }
    };

    // =========================================================
    // REMOVE COUPON
    // =========================================================

    const handleRemoveCoupon = () => {

        setAppliedCoupon(null);
        setCouponCode("");
        setCouponMessage("");
        setCouponError("");
    };

    // =========================================================
    // VERIFY RAZORPAY PAYMENT
    // =========================================================

    const verifyRazorpayPayment = async ({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
    }) => {

        try {

            setPaymentProcessing(true);
            setOrderError("");

            const response =
                await api.post(
                    "/customer/payments/razorpay/verify",
                    {
                        orderId:
                            Number(orderId),

                        razorpayOrderId:
                            razorpayOrderId,

                        razorpayPaymentId:
                            razorpayPaymentId,

                        razorpaySignature:
                            razorpaySignature
                    }
                );

            console.log(
                "Razorpay verification response:",
                response.data
            );

            // =================================================
            // IMPORTANT:
            // DO NOT CALL onOrderPlaced HERE.
            //
            // We first show the payment success screen.
            // =================================================

            setCompletedOrder(
                response.data
            );

            setCompletedPayment(
                response.data
            );

            setPaymentProcessing(false);
            setPlacingOrder(false);
            setOrderError("");

            setPaymentSuccess(true);

        } catch (error) {

            console.error(
                "Razorpay verification error:",
                error
            );

            setPaymentProcessing(false);
            setPlacingOrder(false);

            setOrderError(
                getFriendlyOrderError(error)
            );
        }
    };

    // =========================================================
    // OPEN RAZORPAY CHECKOUT
    // =========================================================

    const openRazorpayCheckout = async (orderData) => {

        const scriptLoaded =
            await loadRazorpayScript();

        if (!scriptLoaded) {

            setPaymentProcessing(false);
            setPlacingOrder(false);

            setOrderError(
                "Unable to load Razorpay Checkout. Please check your internet connection and try again."
            );

            return;
        }

        try {

            // -------------------------------------------------
            // CREATE RAZORPAY ORDER ON BACKEND
            // -------------------------------------------------

            const razorpayResponse =
                await api.post(
                    "/customer/payments/razorpay/create-order",
                    {
                        orderId:
                            Number(orderData.id)
                    }
                );

            console.log(
                "Razorpay order response:",
                razorpayResponse.data
            );

            const razorpayData =
                razorpayResponse.data;

            if (
                !razorpayData?.razorpayOrderId ||
                !razorpayData?.keyId
            ) {

                throw new Error(
                    "Invalid Razorpay order response."
                );
            }

            const amountInRupees =
                Number(
                    razorpayData.amount
                );

            const razorpayAmount =
                Math.round(
                    amountInRupees * 100
                );

            if (
                !Number.isFinite(
                    razorpayAmount
                ) ||
                razorpayAmount <= 0
            ) {

                throw new Error(
                    "Invalid payment amount."
                );
            }

            // -------------------------------------------------
            // STOP OUR OVERLAY BEFORE RAZORPAY OPENS
            // -------------------------------------------------

            setPaymentProcessing(false);

            const options = {

                key:
                    razorpayData.keyId,

                amount:
                    razorpayAmount,

                currency:
                    razorpayData.currency ||
                    "INR",

                name:
                    "ShopStack",

                description:
                    `ShopStack Order #${orderData.id}`,

                order_id:
                    razorpayData.razorpayOrderId,

                theme: {
                    color: "#2563eb"
                },

                prefill: {

                    contact:
                        selectedAddress?.phoneNumber ||
                        undefined
                },

                handler:
                    async (paymentResponse) => {

                        console.log(
                            "Razorpay payment response:",
                            paymentResponse
                        );

                        await verifyRazorpayPayment({

                            orderId:
                                orderData.id,

                            razorpayOrderId:
                                paymentResponse.razorpay_order_id,

                            razorpayPaymentId:
                                paymentResponse.razorpay_payment_id,

                            razorpaySignature:
                                paymentResponse.razorpay_signature
                        });
                    },

                modal: {

                    ondismiss: () => {

                        setPaymentProcessing(false);
                        setPlacingOrder(false);

                        setOrderError(
                            "Razorpay payment was cancelled. Your order has not been confirmed."
                        );
                    }
                }
            };

            const razorpay =
                new window.Razorpay(
                    options
                );

            razorpay.on(
                "payment.failed",
                (response) => {

                    console.error(
                        "Razorpay payment failed:",
                        response
                    );

                    setPaymentProcessing(false);
                    setPlacingOrder(false);

                    setOrderError(
                        response?.error?.description ||
                        "Razorpay payment failed. Please try again."
                    );
                }
            );

            razorpay.open();

        } catch (error) {

            console.error(
                "Razorpay checkout error:",
                error
            );

            setPaymentProcessing(false);
            setPlacingOrder(false);

            if (error.response) {

                setOrderError(
                    getFriendlyOrderError(error)
                );

            } else {

                setOrderError(
                    error.message ||
                    "Unable to start Razorpay payment. Please try again."
                );
            }
        }
    };

    // =========================================================
    // PLACE ORDER
    // =========================================================

    const handlePlaceOrder = async () => {

        if (
            placingOrder ||
            paymentProcessing
        ) {
            return;
        }

        if (!selectedAddress) {

            setOrderError(
                "Please select a delivery address."
            );

            setStep(1);

            return;
        }

        if (!selectedAddress.id) {

            setOrderError(
                "Please select a valid delivery address."
            );

            setStep(1);

            return;
        }

        if (!paymentMethod) {

            setOrderError(
                "Please select a payment method."
            );

            setStep(2);

            return;
        }

        if (
            !cart ||
            cart.length === 0
        ) {

            setOrderError(
                "Your cart is empty."
            );

            return;
        }

        const token =
            localStorage.getItem("token");

        if (!token) {

            setOrderError(
                "Your session has expired. Please login again."
            );

            setPlacingOrder(false);
            setPaymentProcessing(false);

            return;
        }

        // =====================================================
        // VALIDATE CART QUANTITIES AND STOCK
        // =====================================================

        for (const item of cart) {

            const cartQuantity =
                getCartQuantity(item);

            const availableQuantity =
                getAvailableQuantity(item);

            if (cartQuantity <= 0) {

                setOrderError(
                    `Invalid quantity for ${item.name}. Please update your cart.`
                );

                return;
            }

            if (availableQuantity <= 0) {

                setOrderError(
                    `${item.name} is currently out of stock.`
                );

                return;
            }

            if (
                cartQuantity >
                availableQuantity
            ) {

                setOrderError(
                    `Only ${availableQuantity} units of ${item.name} are available. Please update your cart.`
                );

                return;
            }
        }

        try {

            setPlacingOrder(true);
            setPaymentProcessing(true);
            setOrderError("");

            if (!selectedAddress?.id) {

                setOrderError(
                    "Please select a valid delivery address."
                );

                setStep(1);

                setPlacingOrder(false);
                setPaymentProcessing(false);

                return;
            }

            const orderItems =
                cart.map(
                    (item) => ({

                        productId:
                            Number(item.id),

                        quantity:
                            getCartQuantity(item)
                    })
                );

            const orderRequest = {

                items:
                    orderItems,

                couponCode:
                    appliedCoupon?.valid
                        ? appliedCoupon.code
                        : null,

                addressId:
                    Number(
                        selectedAddress.id
                    ),

                paymentMethod:
                    paymentMethod
            };

            console.log(
                "ORDER REQUEST:",
                orderRequest
            );

            // =================================================
            // CREATE SHOPSTACK ORDER
            // =================================================

            const response =
                await api.post(
                    "/customer/orders",
                    orderRequest
                );

            console.log(
                "ShopStack order response:",
                response.data
            );

            const orderData =
                response.data;

            // =================================================
            // COD
            // =================================================

            if (
                paymentMethod === "COD"
            ) {

                setCompletedOrder(
                    orderData
                );

                setCompletedPayment(
                    null
                );

                setPaymentProcessing(false);
                setPlacingOrder(false);
                setOrderError("");

                // Show confirmation first.
                setPaymentSuccess(true);

                return;
            }

            // =================================================
            // RAZORPAY
            // =================================================

            if (
                paymentMethod === "RAZORPAY"
            ) {

                await openRazorpayCheckout(
                    orderData
                );

                return;
            }

            // =================================================
            // OLD CARD / UPI FALLBACK
            // =================================================

            setPaymentProcessing(false);
            setPlacingOrder(false);

            setOrderError(
                "Please select Cash on Delivery or Razorpay."
            );

        } catch (error) {

            console.error(
                "Place order error:",
                error
            );

            console.error(
                "Order status:",
                error.response?.status
            );

            console.error(
                "Order response:",
                error.response?.data
            );

            setPaymentProcessing(false);
            setPlacingOrder(false);

            setOrderError(
                getFriendlyOrderError(error)
            );
        }
    };

    // =========================================================
    // FINISH SUCCESSFUL ORDER
    // =========================================================

    const handleFinishOrder = () => {

        if (onOrderPlaced) {

            onOrderPlaced(
                completedOrder ||
                completedPayment
            );
        }
    };

    // =========================================================
    // EMPTY CART
    // =========================================================

    if (
        !cart ||
        cart.length === 0
    ) {

        return (

            <div className="checkout-empty">

                <div className="checkout-empty-icon">
                    🛒
                </div>

                <h2>
                    Your cart is empty
                </h2>

                <p>
                    Add some products before
                    proceeding to checkout.
                </p>

                <button
                    className="checkout-back-btn"
                    onClick={onBackToCart}
                >
                    ← Back to Cart
                </button>

            </div>
        );
    }

    // =========================================================
    // PAYMENT SUCCESS / ORDER CONFIRMATION
    // =========================================================

    if (paymentSuccess) {

        const completedTotal =
            getCompletedOrderTotal();

        const completedOrderId =
            completedOrder?.id ??
            completedPayment?.orderId ??
            "—";

        const completedPaymentId =
            getPaymentId();

        const isCOD =
            paymentMethod === "COD";

        return (

            <div className="checkout-page">

                <div className="payment-success-screen">

                    <div className="payment-success-card">

                        {/* SUCCESS ICON */}

                        <div className="payment-success-icon">
                            ✓
                        </div>

                        {/* TITLE */}

                        <h1>
                            {
                                isCOD
                                    ? "Order Placed Successfully!"
                                    : "Payment Successful!"
                            }
                        </h1>

                        <p className="payment-success-subtitle">

                            {
                                isCOD
                                    ? "Thank you for your order. Your order has been confirmed and will be delivered to you."
                                    : "Thank you for your payment. Your order has been successfully confirmed."
                            }

                        </p>

                        {/* ORDER INFORMATION */}

                        <div className="payment-success-order-info">

                            <div>

                                <span>
                                    Order ID
                                </span>

                                <strong>
                                    #{completedOrderId}
                                </strong>

                            </div>

                            {!isCOD && (

                                <div>

                                    <span>
                                        Payment ID
                                    </span>

                                    <strong>
                                        {completedPaymentId}
                                    </strong>

                                </div>

                            )}

                            <div>

                                <span>
                                    Payment Method
                                </span>

                                <strong>
                                    {
                                        isCOD
                                            ? "💵 Cash on Delivery"
                                            : "💳 Razorpay"
                                    }
                                </strong>

                            </div>

                        </div>

                        {/* PAYMENT BREAKDOWN */}

                        <div className="payment-success-breakdown">

                            <h3>
                                Payment Summary
                            </h3>

                            <div className="payment-success-row">

                                <span>
                                    Item Total
                                </span>

                                <strong>
                                    ₹
                                    {subtotal.toFixed(2)}
                                </strong>

                            </div>

                            <div className="payment-success-row">

                                <span>
                                    Discount
                                </span>

                                <strong className="payment-success-discount">

                                    {
                                        discount > 0
                                            ? `-₹${discount.toFixed(2)}`
                                            : "₹0.00"
                                    }

                                </strong>

                            </div>

                            <div className="payment-success-row">

                                <span>
                                    Delivery
                                </span>

                                <strong className="payment-success-free">
                                    Free
                                </strong>

                            </div>

                            <div className="payment-success-row">

                                <span>
                                    Platform Charge
                                </span>

                                <strong className="payment-success-free">
                                    Free
                                </strong>

                            </div>

                            <div className="payment-success-total">

                                <span>
                                    {
                                        isCOD
                                            ? "Total Payable"
                                            : "Total Paid"
                                    }
                                </span>

                                <strong>
                                    ₹
                                    {completedTotal.toFixed(2)}
                                </strong>

                            </div>

                        </div>

                        {/* DELIVERY ADDRESS */}

                        {selectedAddress && (

                            <div className="payment-success-address">

                                <h3>
                                    📍 Delivery Address
                                </h3>

                                <strong>
                                    {
                                        selectedAddress.addressLine
                                    }
                                </strong>

                                <p>
                                    {
                                        selectedAddress.city
                                    }
                                    ,{" "}
                                    {
                                        selectedAddress.state
                                    }{" "}
                                    {
                                        selectedAddress.postalCode
                                    }
                                </p>

                                <p>
                                    {
                                        selectedAddress.country
                                    }
                                </p>

                                <p>
                                    📞{" "}
                                    {
                                        selectedAddress.phoneNumber
                                    }
                                </p>

                            </div>

                        )}

                        {/* SUCCESS MESSAGE */}

                        <div className="payment-success-method">

                            <span>
                                🔒
                            </span>

                            <p>

                                {
                                    isCOD
                                        ? "Your order has been securely recorded by ShopStack."
                                        : "Your payment has been securely verified and your order is confirmed."
                                }

                            </p>

                        </div>

                        {/* ACTIONS */}

                        <div className="payment-success-actions">

                            <button
                                type="button"
                                className="payment-success-primary-btn"
                                onClick={
                                    handleFinishOrder
                                }
                            >
                                View My Orders
                            </button>

                            <button
                                type="button"
                                className="payment-success-secondary-btn"
                                onClick={
                                    handleFinishOrder
                                }
                            >
                                Continue Shopping
                            </button>

                        </div>

                    </div>

                </div>

            </div>
        );
    }

    // =========================================================
    // MAIN CHECKOUT UI
    // =========================================================

    return (

        <div className="checkout-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="checkout-header">

                <button
                    className="checkout-back-btn"
                    onClick={onBackToCart}
                    disabled={
                        placingOrder ||
                        paymentProcessing
                    }
                >
                    ← Back to Cart
                </button>

                <div className="checkout-header-content">

                    <h1>
                        Checkout
                    </h1>

                    <p>
                        Complete your order securely
                    </p>

                </div>

            </div>

            {/* =================================================
                STEPS
            ================================================= */}

            <div className="checkout-steps">

                <div
                    className={
                        step >= 1
                            ? "checkout-step active"
                            : "checkout-step"
                    }
                >

                    <span>
                        1
                    </span>

                    <label>
                        Address
                    </label>

                </div>

                <div className="checkout-step-line"></div>

                <div
                    className={
                        step >= 2
                            ? "checkout-step active"
                            : "checkout-step"
                    }
                >

                    <span>
                        2
                    </span>

                    <label>
                        Payment
                    </label>

                </div>

                <div className="checkout-step-line"></div>

                <div
                    className={
                        step >= 3
                            ? "checkout-step active"
                            : "checkout-step"
                    }
                >

                    <span>
                        3
                    </span>

                    <label>
                        Review
                    </label>

                </div>

            </div>

            <div className="checkout-layout">

                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <div className="checkout-main">

                    {/* =================================================
                        STEP 1 - ADDRESS
                    ================================================= */}

                    {step === 1 && (

                        <div className="checkout-card">

                            <div className="checkout-card-header">

                                <h2>
                                    📍 Delivery Address
                                </h2>

                                <span>
                                    Step 1 of 3
                                </span>

                            </div>

                            {addressError && (

                                <div className="checkout-inline-error">
                                    ⚠️ {addressError}
                                </div>

                            )}

                            {addressSuccess && (

                                <div className="checkout-success-message">
                                    ✓ {addressSuccess}
                                </div>

                            )}

                            {loadingAddresses ? (

                                <div className="checkout-loading">
                                    Loading saved addresses...
                                </div>

                            ) : (

                                <>

                                    {addresses.length > 0 && (

                                        <div className="checkout-address-list">

                                            {addresses.map(
                                                (address) => (

                                                    <div
                                                        key={
                                                            address.id
                                                        }
                                                        className={
                                                            selectedAddress?.id ===
                                                            address.id
                                                                ? "checkout-address-card selected"
                                                                : "checkout-address-card"
                                                        }
                                                        onClick={() =>
                                                            setSelectedAddress(
                                                                address
                                                            )
                                                        }
                                                    >

                                                        <div className="address-radio">

                                                            <input
                                                                type="radio"
                                                                checked={
                                                                    selectedAddress?.id ===
                                                                    address.id
                                                                }
                                                                onChange={() =>
                                                                    setSelectedAddress(
                                                                        address
                                                                    )
                                                                }
                                                            />

                                                        </div>

                                                        <div className="checkout-address-content">

                                                            <strong>
                                                                {
                                                                    address.addressLine
                                                                }
                                                            </strong>

                                                            <p>
                                                                {
                                                                    address.city
                                                                }
                                                                ,{" "}
                                                                {
                                                                    address.state
                                                                }{" "}
                                                                {
                                                                    address.postalCode
                                                                }
                                                            </p>

                                                            <p>
                                                                {
                                                                    address.country
                                                                }
                                                            </p>

                                                            <p>
                                                                📞{" "}
                                                                {
                                                                    address.phoneNumber
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    )}

                                    {!showAddAddress && (

                                        <button
                                            type="button"
                                            className="checkout-add-address-btn"
                                            onClick={
                                                handleOpenAddAddress
                                            }
                                        >
                                            + Add New Address
                                        </button>

                                    )}

                                    {showAddAddress && (

                                        <div className="checkout-new-address">

                                            <div className="checkout-new-address-header">

                                                <h3>
                                                    Add New Delivery Address
                                                </h3>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleCancelAddAddress
                                                    }
                                                    className="checkout-close-address"
                                                >
                                                    ✕
                                                </button>

                                            </div>

                                            <form
                                                onSubmit={
                                                    handleSaveAddress
                                                }
                                            >

                                                <div className="checkout-form-group">

                                                    <label>
                                                        Address
                                                    </label>

                                                    <input
                                                        type="text"
                                                        name="addressLine"
                                                        value={
                                                            addressForm.addressLine
                                                        }
                                                        onChange={
                                                            handleAddressChange
                                                        }
                                                        placeholder="Enter your address"
                                                    />

                                                </div>

                                                <div className="checkout-form-row">

                                                    <div className="checkout-form-group">

                                                        <label>
                                                            City
                                                        </label>

                                                        <input
                                                            type="text"
                                                            name="city"
                                                            value={
                                                                addressForm.city
                                                            }
                                                            onChange={
                                                                handleAddressChange
                                                            }
                                                            placeholder="Enter city"
                                                        />

                                                    </div>

                                                    <div className="checkout-form-group">

                                                        <label>
                                                            State
                                                        </label>

                                                        <input
                                                            type="text"
                                                            name="state"
                                                            value={
                                                                addressForm.state
                                                            }
                                                            onChange={
                                                                handleAddressChange
                                                            }
                                                            placeholder="Enter state"
                                                        />

                                                    </div>

                                                </div>

                                                <div className="checkout-form-row">

                                                    <div className="checkout-form-group">

                                                        <label>
                                                            Postal Code
                                                        </label>

                                                        <input
                                                            type="text"
                                                            name="postalCode"
                                                            value={
                                                                addressForm.postalCode
                                                            }
                                                            onChange={
                                                                handleAddressChange
                                                            }
                                                            placeholder="Enter postal code"
                                                            maxLength="6"
                                                        />

                                                    </div>

                                                    <div className="checkout-form-group">

                                                        <label>
                                                            Country
                                                        </label>

                                                        <input
                                                            type="text"
                                                            name="country"
                                                            value={
                                                                addressForm.country
                                                            }
                                                            onChange={
                                                                handleAddressChange
                                                            }
                                                            placeholder="Enter country"
                                                        />

                                                    </div>

                                                </div>

                                                <div className="checkout-form-group">

                                                    <label>
                                                        Phone Number
                                                    </label>

                                                    <input
                                                        type="text"
                                                        name="phoneNumber"
                                                        value={
                                                            addressForm.phoneNumber
                                                        }
                                                        onChange={
                                                            handleAddressChange
                                                        }
                                                        placeholder="Enter 10-digit phone number"
                                                        maxLength="10"
                                                    />

                                                </div>

                                                <div className="checkout-address-form-actions">

                                                    <button
                                                        type="button"
                                                        className="checkout-cancel-address-btn"
                                                        onClick={
                                                            handleCancelAddAddress
                                                        }
                                                        disabled={
                                                            savingAddress
                                                        }
                                                    >
                                                        Cancel
                                                    </button>

                                                    <button
                                                        type="submit"
                                                        className="checkout-save-address-btn"
                                                        disabled={
                                                            savingAddress
                                                        }
                                                    >
                                                        {
                                                            savingAddress
                                                                ? "Saving..."
                                                                : "Save Address"
                                                        }
                                                    </button>

                                                </div>

                                            </form>

                                        </div>

                                    )}

                                    <div className="checkout-navigation">

                                        <button
                                            className="checkout-next-btn"
                                            onClick={nextStep}
                                            disabled={
                                                !selectedAddress ||
                                                showAddAddress
                                            }
                                        >
                                            Continue to Payment →
                                        </button>

                                    </div>

                                </>

                            )}

                        </div>

                    )}

                    {/* =================================================
                        STEP 2 - PAYMENT
                    ================================================= */}

                    {step === 2 && (

                        <div className="checkout-card">

                            <div className="checkout-card-header">

                                <h2>
                                    💳 Payment Method
                                </h2>

                                <span>
                                    Step 2 of 3
                                </span>

                            </div>

                            {orderError && (

                                <div className="checkout-inline-error">
                                    ⚠️ {orderError}
                                </div>

                            )}

                            <div className="payment-methods">

                                {/* COD */}

                                <label
                                    className={
                                        paymentMethod === "COD"
                                            ? "payment-method selected"
                                            : "payment-method"
                                    }
                                >

                                    <input
                                        type="radio"
                                        name="payment"
                                        value="COD"
                                        checked={
                                            paymentMethod === "COD"
                                        }
                                        onChange={(e) =>
                                            setPaymentMethod(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <div>

                                        <strong>
                                            💵 Cash on Delivery
                                        </strong>

                                        <p>
                                            Pay when your order arrives.
                                        </p>

                                    </div>

                                </label>

                                {/* RAZORPAY */}

                                <label
                                    className={
                                        paymentMethod === "RAZORPAY"
                                            ? "payment-method selected"
                                            : "payment-method"
                                    }
                                >

                                    <input
                                        type="radio"
                                        name="payment"
                                        value="RAZORPAY"
                                        checked={
                                            paymentMethod === "RAZORPAY"
                                        }
                                        onChange={(e) =>
                                            setPaymentMethod(
                                                e.target.value
                                            )
                                        }
                                    />

                                    <div>

                                        <strong>
                                            💳 Razorpay
                                        </strong>

                                        <p>
                                            Pay securely using Card, UPI, Net Banking or Wallet.
                                        </p>

                                    </div>

                                </label>

                            </div>

                            <div className="checkout-navigation">

                                <button
                                    className="checkout-prev-btn"
                                    onClick={previousStep}
                                >
                                    ← Back
                                </button>

                                <button
                                    className="checkout-next-btn"
                                    onClick={nextStep}
                                    disabled={!paymentMethod}
                                >
                                    Review Order →
                                </button>

                            </div>

                        </div>

                    )}

                    {/* =================================================
                        STEP 3 - REVIEW
                    ================================================= */}

                    {step === 3 && (

                        <div className="checkout-card">

                            <div className="checkout-card-header">

                                <h2>
                                    🧾 Review Your Order
                                </h2>

                                <span>
                                    Step 3 of 3
                                </span>

                            </div>

                            {orderError && (

                                <div className="checkout-inline-error">
                                    ⚠️ {orderError}
                                </div>

                            )}

                            {/* ADDRESS */}

                            <div className="review-section">

                                <div className="review-section-header">

                                    <h3>
                                        📍 Delivery Address
                                    </h3>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setStep(1)
                                        }
                                        disabled={
                                            placingOrder ||
                                            paymentProcessing
                                        }
                                    >
                                        Change
                                    </button>

                                </div>

                                {selectedAddress && (

                                    <div className="review-address">

                                        <strong>
                                            {
                                                selectedAddress.addressLine
                                            }
                                        </strong>

                                        <p>
                                            {
                                                selectedAddress.city
                                            }
                                            ,{" "}
                                            {
                                                selectedAddress.state
                                            }{" "}
                                            {
                                                selectedAddress.postalCode
                                            }
                                        </p>

                                        <p>
                                            {
                                                selectedAddress.country
                                            }
                                        </p>

                                        <p>
                                            📞{" "}
                                            {
                                                selectedAddress.phoneNumber
                                            }
                                        </p>

                                    </div>

                                )}

                            </div>

                            {/* PAYMENT */}

                            <div className="review-section">

                                <div className="review-section-header">

                                    <h3>
                                        💳 Payment
                                    </h3>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setStep(2)
                                        }
                                        disabled={
                                            placingOrder ||
                                            paymentProcessing
                                        }
                                    >
                                        Change
                                    </button>

                                </div>

                                <p>
                                    {
                                        paymentMethod === "COD"
                                            ? "💵 Cash on Delivery"
                                            : "💳 Razorpay"
                                    }
                                </p>

                            </div>

                            {/* =================================================
                                COUPON
                            ================================================= */}

                            <div className="review-section">

                                <div className="review-section-header">

                                    <h3>
                                        🎟️ Coupon
                                    </h3>

                                </div>

                                {!appliedCoupon ? (

                                    <div className="coupon-box">

                                        <div className="coupon-select-wrapper">

                                            <select
                                                className="coupon-dropdown"
                                                value={couponCode}
                                                onChange={(e) => {

                                                    const selectedCode =
                                                        e.target.value;

                                                    setCouponCode(
                                                        selectedCode
                                                    );

                                                    setCouponError("");
                                                    setCouponMessage("");

                                                }}
                                            >

                                                <option value="">
                                                    Select an available coupon
                                                </option>

                                                {coupons.length > 0 ? (

                                                    coupons.map(
                                                        (coupon) => {

                                                            const discountValue =
                                                                coupon.discountValue ??
                                                                coupon.discount ??
                                                                coupon.discountPercentage;

                                                            const discountType =
                                                                String(
                                                                    coupon.discountType ??
                                                                    "PERCENTAGE"
                                                                ).toUpperCase();

                                                            return (

                                                                <option
                                                                    key={
                                                                        coupon.id ||
                                                                        coupon.code
                                                                    }
                                                                    value={
                                                                        coupon.code
                                                                    }
                                                                >

                                                                    {
                                                                        coupon.code
                                                                    }

                                                                    {
                                                                        discountValue !== undefined &&
                                                                        discountValue !== null
                                                                            ? discountType === "FIXED" ||
                                                                              discountType === "FLAT" ||
                                                                              discountType === "AMOUNT"
                                                                                ? ` - ₹${discountValue} OFF`
                                                                                : ` - ${discountValue}% OFF`
                                                                            : ""
                                                                    }

                                                                </option>
                                                            );
                                                        }
                                                    )

                                                ) : (

                                                    <option
                                                        value=""
                                                        disabled
                                                    >
                                                        No coupons available
                                                    </option>

                                                )}

                                            </select>

                                            <span
                                                className="coupon-dropdown-arrow"
                                                aria-hidden="true"
                                            >
                                                ▾
                                            </span>

                                        </div>

                                        <button
                                            type="button"
                                            onClick={
                                                handleApplyCoupon
                                            }
                                            disabled={
                                                couponLoading ||
                                                !couponCode
                                            }
                                        >
                                            {
                                                couponLoading
                                                    ? "Applying..."
                                                    : "Apply Coupon"
                                            }
                                        </button>

                                    </div>

                                ) : (

                                    <div className="applied-coupon">

                                        <span>

                                            ✓{" "}
                                            {
                                                appliedCoupon.code
                                            }

                                            {" • "}

                                            Saved ₹
                                            {
                                                Number(
                                                    appliedCoupon.discountAmount
                                                ).toFixed(2)
                                            }

                                        </span>

                                        <button
                                            type="button"
                                            className="remove-coupon-btn"
                                            onClick={
                                                handleRemoveCoupon
                                            }
                                            disabled={
                                                placingOrder ||
                                                paymentProcessing
                                            }
                                        >
                                            Remove
                                        </button>

                                    </div>

                                )}

                                {couponMessage && (

                                    <p className="coupon-success">

                                        ✓{" "}
                                        {
                                            couponMessage
                                        }

                                    </p>

                                )}

                                {couponError && (

                                    <p className="coupon-error">

                                        ⚠️{" "}
                                        {
                                            couponError
                                        }

                                    </p>

                                )}

                            </div>

                            {/* PRODUCTS */}

                            <div className="review-section">

                                <h3>
                                    🛒 Products
                                </h3>

                                <div className="review-products">

                                    {cart.map(
                                        (item) => {

                                            const quantity =
                                                getCartQuantity(
                                                    item
                                                );

                                            const itemTotal =
                                                Number(
                                                    item.price ?? 0
                                                ) *
                                                quantity;

                                            return (

                                                <div
                                                    className="review-product"
                                                    key={
                                                        item.id
                                                    }
                                                >

                                                    <span>
                                                        {
                                                            item.name
                                                        }
                                                        {" × "}
                                                        {
                                                            quantity
                                                        }
                                                    </span>

                                                    <strong>
                                                        ₹
                                                        {
                                                            itemTotal.toFixed(
                                                                2
                                                            )
                                                        }
                                                    </strong>

                                                </div>
                                            );

                                        }
                                    )}

                                </div>

                            </div>

                            {/* NAVIGATION */}

                            <div className="checkout-navigation">

                                <button
                                    className="checkout-prev-btn"
                                    onClick={previousStep}
                                    disabled={
                                        placingOrder ||
                                        paymentProcessing
                                    }
                                >
                                    ← Back
                                </button>

                                <button
                                    className="place-order-btn"
                                    onClick={handlePlaceOrder}
                                    disabled={
                                        placingOrder ||
                                        paymentProcessing
                                    }
                                >

                                    {
                                        placingOrder
                                            ? paymentMethod === "RAZORPAY"
                                                ? "Opening Razorpay..."
                                                : "Placing Order..."
                                            : `Place Order • ₹${finalTotal.toFixed(2)}`
                                    }

                                </button>

                            </div>

                        </div>

                    )}

                </div>

                {/* =================================================
                    ORDER SUMMARY
                ================================================= */}

                <aside className="checkout-summary">

                    <div className="summary-content">

                        <h2>
                            Order Summary
                        </h2>

                        <div className="summary-items">

                            {cart.map(
                                (item) => {

                                    const quantity =
                                        getCartQuantity(
                                            item
                                        );

                                    const itemTotal =
                                        Number(
                                            item.price ?? 0
                                        ) *
                                        quantity;

                                    return (

                                        <div
                                            className="summary-item"
                                            key={
                                                item.id
                                            }
                                        >

                                            <span>
                                                {
                                                    item.name
                                                }
                                                {" × "}
                                                {
                                                    quantity
                                                }
                                            </span>

                                            <strong>
                                                ₹
                                                {
                                                    itemTotal.toFixed(
                                                        2
                                                    )
                                                }
                                            </strong>

                                        </div>
                                    );

                                }
                            )}

                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row">

                            <span>
                                Subtotal
                            </span>

                            <strong>
                                ₹
                                {
                                    subtotal.toFixed(
                                        2
                                    )
                                }
                            </strong>

                        </div>

                        {discount > 0 && (

                            <div className="summary-row discount-row">

                                <span>
                                    Discount
                                </span>

                                <strong>
                                    -₹
                                    {
                                        discount.toFixed(
                                            2
                                        )
                                    }
                                </strong>

                            </div>

                        )}

                        <div className="summary-row">

                            <span>
                                Delivery
                            </span>

                            <strong>
                                Free
                            </strong>

                        </div>

                        <div className="summary-row">

                            <span>
                                Platform Charge
                            </span>

                            <strong>
                                Free
                            </strong>

                        </div>

                        <div className="summary-final-total">

                            <span>
                                Total
                            </span>

                            <strong>
                                ₹
                                {
                                    finalTotal.toFixed(
                                        2
                                    )
                                }
                            </strong>

                        </div>

                    </div>

                </aside>

            </div>

            {/* =================================================
                PAYMENT PROCESSING
            ================================================= */}

            {paymentProcessing && (

                <div className="payment-processing-overlay">

                    <div className="payment-processing-card">

                        <div className="payment-animation">
                            💳
                        </div>

                        <h2>
                            Processing Payment
                        </h2>

                        <p>
                            Please wait while we securely process your order...
                        </p>

                    </div>

                </div>

            )}

        </div>
    );
}

export default CustomerCheckout;