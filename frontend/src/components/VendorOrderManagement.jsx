import { useState } from "react";
import api from "../services/api";
import "./VendorOrderManagement.css";

function CustomerCheckout({ cart, onBackToCart, onOrderPlaced }) {
    const [step, setStep] = useState(1);

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);

    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);

    const [error, setError] = useState("");

    // =========================================================
    // TOTAL ITEMS
    // =========================================================

    const getTotalItems = () => {
        return cart.reduce(
            (total, item) =>
                total + Number(item.cartQuantity),
            0
        );
    };

    // =========================================================
    // TOTAL AMOUNT
    // =========================================================

    const getTotal = () => {
        return cart.reduce(
            (total, item) =>
                total +
                Number(item.price) *
                Number(item.cartQuantity),
            0
        );
    };

    // =========================================================
    // LOAD CUSTOMER ADDRESSES
    // =========================================================

    const loadAddresses = async () => {
        try {
            setLoadingAddresses(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please login as Customer.");
                return false;
            }

            const response = await api.get(
                "/customer/addresses"
            );

            if (Array.isArray(response.data)) {
                setAddresses(response.data);
            } else {
                setAddresses([]);
            }

            return true;
        } catch (err) {
            console.error(
                "Address loading error:",
                err
            );

            if (err.response?.status === 403) {
                setError(
                    "Access denied. Please login as Customer."
                );
            } else if (
                err.response?.status === 401
            ) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else {
                setError(
                    "Unable to load your addresses."
                );
            }

            return false;
        } finally {
            setLoadingAddresses(false);
        }
    };

    // =========================================================
    // GO TO ADDRESS STEP
    // =========================================================

    const goToAddressStep = async () => {
        if (!cart || cart.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        setError("");

        const success = await loadAddresses();

        if (success) {
            setStep(2);
        }
    };

    // =========================================================
    // SELECT ADDRESS
    // =========================================================

    const selectAddress = (address) => {
        setSelectedAddress(address);
        setError("");
    };

    // =========================================================
    // GO TO REVIEW STEP
    // =========================================================

    const goToReviewStep = () => {
        if (!selectedAddress) {
            setError(
                "Please select a delivery address."
            );

            return;
        }

        setError("");
        setStep(3);
    };

    // =========================================================
    // PLACE ORDER
    // =========================================================

    const placeOrder = async () => {
        try {
            setPlacingOrder(true);
            setError("");

            const token =
                localStorage.getItem("token");

            if (!token) {
                setError(
                    "Please login as Customer."
                );

                return;
            }

            // Validate cart

            if (!cart || cart.length === 0) {
                setError(
                    "Your cart is empty."
                );

                return;
            }

            // Validate address

            if (!selectedAddress) {
                setError(
                    "Please select a delivery address."
                );

                setStep(2);

                return;
            }

            // Validate quantities

            for (const item of cart) {
                if (
                    Number(item.cartQuantity) <= 0 ||
                    Number(item.cartQuantity) >
                    Number(item.quantity)
                ) {
                    setError(
                        `Invalid quantity for ${item.name}.`
                    );

                    setStep(1);

                    return;
                }
            }

            // Prepare order items

            const items = cart.map(
                (item) => ({
                    productId: item.id,
                    quantity: Number(item.cartQuantity)
                })
            );

            // =================================================
            // CREATE ORDER
            // =================================================

            const response = await api.post(
                "/customer/orders",
                {
                    items: items
                }
            );

            console.log(
                "Order placed successfully:",
                response.data
            );

            // Move to confirmation

            setStep(4);

            // Notify CustomerDashboard

            if (onOrderPlaced) {
                onOrderPlaced(
                    response.data
                );
            }
        } catch (err) {
            console.error(
                "Order placement error:",
                err
            );

            if (err.response?.status === 403) {
                setError(
                    "Access denied. Please login as Customer."
                );
            } else if (
                err.response?.status === 401
            ) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else if (
                err.response?.data?.message
            ) {
                setError(
                    err.response.data.message
                );
            } else if (
                typeof err.response?.data === "string"
            ) {
                setError(
                    err.response.data
                );
            } else {
                setError(
                    "Unable to place order. Please try again."
                );
            }
        } finally {
            setPlacingOrder(false);
        }
    };

    // =========================================================
    // EMPTY CART
    // =========================================================

    if (!cart || cart.length === 0) {
        return (
            <div className="customer-checkout">

                <div className="checkout-empty">

                    <div className="checkout-empty-icon">
                        🛒
                    </div>

                    <h2>
                        Your Cart is Empty
                    </h2>

                    <p>
                        Add some products before proceeding
                        to checkout.
                    </p>

                    <button
                        className="checkout-back-button"
                        onClick={onBackToCart}
                    >
                        ← Back to Cart
                    </button>

                </div>

            </div>
        );
    }

    return (
        <div className="customer-checkout">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="checkout-header">

                <div>

                    <h2>
                        🛒 Checkout
                    </h2>

                    <p>
                        Complete your order in a few
                        simple steps.
                    </p>

                </div>

            </div>

            {/* =================================================
                CHECKOUT STEPS
            ================================================= */}

            <div className="checkout-steps">

                <div
                    className={
                        step >= 1
                            ? "checkout-step active"
                            : "checkout-step"
                    }
                >
                    <span>1</span>

                    <small>
                        Cart
                    </small>
                </div>

                <div
                    className={
                        step >= 2
                            ? "checkout-step active"
                            : "checkout-step"
                    }
                >
                    <span>2</span>

                    <small>
                        Address
                    </small>
                </div>

                <div
                    className={
                        step >= 3
                            ? "checkout-step active"
                            : "checkout-step"
                    }
                >
                    <span>3</span>

                    <small>
                        Review
                    </small>
                </div>

                <div
                    className={
                        step >= 4
                            ? "checkout-step active"
                            : "checkout-step"
                    }
                >
                    <span>4</span>

                    <small>
                        Confirmation
                    </small>
                </div>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="checkout-error">
                    {error}
                </div>
            )}

            {/* =================================================
                STEP 1 - REVIEW CART
            ================================================= */}

            {step === 1 && (
                <div className="checkout-section">

                    <div className="checkout-section-header">

                        <div>

                            <h3>
                                🛍️ Review Cart
                            </h3>

                            <p>
                                Check your products and
                                quantities before continuing.
                            </p>

                        </div>

                    </div>

                    <div className="checkout-products">

                        {cart.map((item) => (
                            <div
                                className="checkout-product"
                                key={item.id}
                            >

                                <div className="checkout-product-left">

                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="checkout-product-image"
                                        />
                                    ) : (
                                        <div className="checkout-product-placeholder">
                                            📦
                                        </div>
                                    )}

                                    <div>

                                        <strong>
                                            {item.name}
                                        </strong>

                                        <p>
                                            {item.brand}
                                        </p>

                                        <p>
                                            ₹
                                            {Number(
                                                item.price
                                            ).toFixed(2)}
                                            {" × "}
                                            {item.cartQuantity}
                                        </p>

                                    </div>

                                </div>

                                <strong className="checkout-product-price">
                                    ₹
                                    {(
                                        Number(item.price) *
                                        Number(item.cartQuantity)
                                    ).toFixed(2)}
                                </strong>

                            </div>
                        ))}

                    </div>

                    {/* TOTAL ITEMS */}

                    <div className="checkout-total">

                        <span>
                            Total Items
                        </span>

                        <strong>
                            {getTotalItems()}
                        </strong>

                    </div>

                    {/* TOTAL AMOUNT */}

                    <div className="checkout-total checkout-grand-total">

                        <span>
                            Total Amount
                        </span>

                        <strong>
                            ₹{getTotal().toFixed(2)}
                        </strong>

                    </div>

                    {/* ACTIONS */}

                    <div className="checkout-actions">

                        <button
                            className="checkout-secondary-button"
                            onClick={onBackToCart}
                        >
                            ← Back to Cart
                        </button>

                        <button
                            className="checkout-primary-button"
                            onClick={goToAddressStep}
                        >
                            Continue to Address →
                        </button>

                    </div>

                </div>
            )}

            {/* =================================================
                STEP 2 - ADDRESS
            ================================================= */}

            {step === 2 && (
                <div className="checkout-section">

                    <div className="checkout-section-header">

                        <div>

                            <h3>
                                📍 Select Delivery Address
                            </h3>

                            <p>
                                Choose where you want your
                                order delivered.
                            </p>

                        </div>

                    </div>

                    {loadingAddresses ? (
                        <div className="checkout-loading">

                            <div>
                                ⏳
                            </div>

                            <p>
                                Loading your addresses...
                            </p>

                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="no-addresses">

                            <div>
                                📍
                            </div>

                            <h3>
                                No Saved Addresses
                            </h3>

                            <p>
                                You don't have any saved
                                delivery addresses.
                            </p>

                            <button
                                className="checkout-secondary-button"
                                onClick={onBackToCart}
                            >
                                ← Back to Cart
                            </button>

                        </div>
                    ) : (
                        <div className="checkout-addresses">

                            {addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className={
                                        selectedAddress?.id ===
                                        address.id
                                            ? "checkout-address selected"
                                            : "checkout-address"
                                    }
                                    onClick={() =>
                                        selectAddress(address)
                                    }
                                >

                                    <div className="address-radio">

                                        <span>
                                            {selectedAddress?.id ===
                                            address.id
                                                ? "✓"
                                                : ""}
                                        </span>

                                    </div>

                                    <div className="address-content">

                                        <strong>
                                            {address.addressLine}
                                        </strong>

                                        <p>
                                            {address.city},{" "}
                                            {address.state}
                                        </p>

                                        <p>
                                            {address.postalCode}
                                        </p>

                                        <p>
                                            {address.country}
                                        </p>

                                        <p>
                                            📞{" "}
                                            {address.phoneNumber}
                                        </p>

                                    </div>

                                    {selectedAddress?.id ===
                                        address.id && (
                                        <span className="selected-label">
                                            Selected
                                        </span>
                                    )}

                                </div>
                            ))}

                        </div>
                    )}

                    <div className="checkout-actions">

                        <button
                            className="checkout-secondary-button"
                            onClick={() => {
                                setError("");
                                setStep(1);
                            }}
                        >
                            ← Back
                        </button>

                        <button
                            className="checkout-primary-button"
                            onClick={goToReviewStep}
                            disabled={!selectedAddress}
                        >
                            Review Order →
                        </button>

                    </div>

                </div>
            )}

            {/* =================================================
                STEP 3 - REVIEW ORDER
            ================================================= */}

            {step === 3 && selectedAddress && (
                <div className="checkout-section">

                    <div className="checkout-section-header">

                        <div>

                            <h3>
                                📋 Review Your Order
                            </h3>

                            <p>
                                Verify your delivery details
                                and order before placing it.
                            </p>

                        </div>

                    </div>

                    {/* ADDRESS */}

                    <div className="review-address">

                        <div className="review-address-header">

                            <h4>
                                📍 Delivery Address
                            </h4>

                            <button
                                onClick={() => {
                                    setError("");
                                    setStep(2);
                                }}
                            >
                                Change
                            </button>

                        </div>

                        <p>
                            {selectedAddress.addressLine}
                        </p>

                        <p>
                            {selectedAddress.city},{" "}
                            {selectedAddress.state}
                            {" - "}
                            {selectedAddress.postalCode}
                        </p>

                        <p>
                            {selectedAddress.country}
                        </p>

                        <p>
                            📞{" "}
                            {selectedAddress.phoneNumber}
                        </p>

                    </div>

                    {/* PRODUCTS */}

                    <div className="review-products">

                        <h4>
                            🛍️ Order Items
                        </h4>

                        {cart.map((item) => (
                            <div
                                className="review-product"
                                key={item.id}
                            >

                                <div>

                                    <strong>
                                        {item.name}
                                    </strong>

                                    <p>
                                        ₹
                                        {Number(
                                            item.price
                                        ).toFixed(2)}
                                        {" × "}
                                        {item.cartQuantity}
                                    </p>

                                </div>

                                <strong>
                                    ₹
                                    {(
                                        Number(item.price) *
                                        Number(item.cartQuantity)
                                    ).toFixed(2)}
                                </strong>

                            </div>
                        ))}

                    </div>

                    {/* TOTAL */}

                    <div className="review-total">

                        <span>
                            Total Amount
                        </span>

                        <strong>
                            ₹{getTotal().toFixed(2)}
                        </strong>

                    </div>

                    {/* ACTIONS */}

                    <div className="checkout-actions">

                        <button
                            className="checkout-secondary-button"
                            onClick={() => {
                                setError("");
                                setStep(2);
                            }}
                        >
                            ← Change Address
                        </button>

                        <button
                            className="checkout-primary-button place-order-button"
                            onClick={placeOrder}
                            disabled={placingOrder}
                        >
                            {placingOrder
                                ? "⏳ Placing Order..."
                                : "✓ Place Order"}
                        </button>

                    </div>

                </div>
            )}

            {/* =================================================
                STEP 4 - CONFIRMATION
            ================================================= */}

            {step === 4 && (
                <div className="checkout-section checkout-confirmation">

                    <div className="confirmation-icon">
                        ✓
                    </div>

                    <h2>
                        Order Placed Successfully!
                    </h2>

                    <p>
                        Thank you for shopping with ShopStack.
                    </p>

                    <div className="confirmation-summary">

                        <div>

                            <span>
                                Total Items
                            </span>

                            <strong>
                                {getTotalItems()}
                            </strong>

                        </div>

                        <div>

                            <span>
                                Total Amount
                            </span>

                            <strong>
                                ₹{getTotal().toFixed(2)}
                            </strong>

                        </div>

                    </div>

                    <p className="confirmation-note">
                        Your order has been created successfully.
                        You can track it from{" "}
                        <strong>My Orders</strong>.
                    </p>

                    <button
                        className="checkout-primary-button"
                        onClick={() => {
                            if (onOrderPlaced) {
                                onOrderPlaced();
                            }
                        }}
                    >
                        View My Orders →
                    </button>

                </div>
            )}

        </div>
    );
}

export default CustomerCheckout;