import { useState } from "react";
import "./CustomerCart.css";

function CustomerCart({ cart, setCart, onCheckout }) {
    const [error, setError] = useState("");

    // =========================================================
    // UPDATE QUANTITY
    // =========================================================

    const updateQuantity = (productId, quantity) => {
        const product = cart.find(
            (item) => item.id === productId
        );

        if (!product) {
            return;
        }

        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        if (quantity > Number(product.quantity)) {
            setError(
                `Only ${product.quantity} units are available for ${product.name}.`
            );
            return;
        }

        setError("");

        setCart((previousCart) =>
            previousCart.map((item) =>
                item.id === productId
                    ? {
                          ...item,
                          cartQuantity: quantity,
                      }
                    : item
            )
        );
    };

    // =========================================================
    // REMOVE PRODUCT
    // =========================================================

    const removeFromCart = (productId) => {
        setCart((previousCart) =>
            previousCart.filter(
                (item) => item.id !== productId
            )
        );

        setError("");
    };

    // =========================================================
    // TOTAL ITEMS
    // =========================================================

    const getTotalItems = () => {
        return cart.reduce(
            (total, item) =>
                total + Number(item.cartQuantity || 0),
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
                Number(item.price || 0) *
                    Number(item.cartQuantity || 0),
            0
        );
    };

    // =========================================================
    // PROCEED TO CHECKOUT
    // =========================================================

    const handleCheckout = () => {
        setError("");

        if (!cart || cart.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        for (const item of cart) {
            if (
                Number(item.cartQuantity) <= 0 ||
                Number(item.cartQuantity) >
                    Number(item.quantity)
            ) {
                setError(
                    `Invalid quantity for ${item.name}.`
                );
                return;
            }
        }

        if (onCheckout) {
            onCheckout();
        } else {
            setError(
                "Checkout is currently unavailable."
            );
        }
    };

    return (
        <div className="customer-cart">

            {/* =====================================================
                CART HEADER
            ===================================================== */}

            <div className="cart-header">
                <div>
                    <h2>🛒 My Cart</h2>

                    <p>
                        Review your products before proceeding
                        to checkout.
                    </p>
                </div>
            </div>

            {/* =====================================================
                ERROR MESSAGE
            ===================================================== */}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {/* =====================================================
                EMPTY CART
            ===================================================== */}

            {cart.length === 0 ? (
                <div className="empty-cart">

                    <div>🛒</div>

                    <h3>
                        Your Cart is Empty
                    </h3>

                    <p>
                        Add products to your cart before
                        proceeding to checkout.
                    </p>

                </div>
            ) : (
                <div className="cart-container">

                    {/* =================================================
                        CART ITEMS
                    ================================================= */}

                    <div className="cart-items">

                        {cart.map((item) => (
                            <div
                                className="cart-item"
                                key={item.id}
                            >

                                {/* PRODUCT */}

                                <div className="cart-product">

                                    <div className="cart-image-wrapper">

                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="cart-product-image"
                                                onError={(event) => {
                                                    event.currentTarget.style.display =
                                                        "none";

                                                    if (
                                                        event
                                                            .currentTarget
                                                            .nextElementSibling
                                                    ) {
                                                        event
                                                            .currentTarget
                                                            .nextElementSibling
                                                            .style.display =
                                                            "flex";
                                                    }
                                                }}
                                            />
                                        ) : null}

                                        <div
                                            className="cart-product-placeholder"
                                            style={{
                                                display:
                                                    item.imageUrl
                                                        ? "none"
                                                        : "flex",
                                            }}
                                        >
                                            📦
                                        </div>

                                    </div>

                                    <div className="cart-item-info">

                                        <h3>
                                            {item.name}
                                        </h3>

                                        {item.brand && (
                                            <p className="cart-brand">
                                                {item.brand}
                                            </p>
                                        )}

                                        <p className="cart-price">
                                            ₹
                                            {Number(
                                                item.price || 0
                                            ).toFixed(2)}
                                        </p>

                                        <small>
                                            {item.quantity} available
                                        </small>

                                    </div>

                                </div>

                                {/* =================================================
                                    QUANTITY CONTROLS
                                ================================================= */}

                                <div className="cart-quantity-controls">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateQuantity(
                                                item.id,
                                                Number(
                                                    item.cartQuantity
                                                ) - 1
                                            )
                                        }
                                    >
                                        −
                                    </button>

                                    <span>
                                        {item.cartQuantity}
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateQuantity(
                                                item.id,
                                                Number(
                                                    item.cartQuantity
                                                ) + 1
                                            )
                                        }
                                        disabled={
                                            Number(
                                                item.cartQuantity
                                            ) >=
                                            Number(
                                                item.quantity
                                            )
                                        }
                                    >
                                        +
                                    </button>

                                </div>

                                {/* =================================================
                                    SUBTOTAL
                                ================================================= */}

                                <div className="cart-subtotal">

                                    <span>
                                        Subtotal
                                    </span>

                                    <strong>
                                        ₹
                                        {(
                                            Number(
                                                item.price || 0
                                            ) *
                                            Number(
                                                item.cartQuantity || 0
                                            )
                                        ).toFixed(2)}
                                    </strong>

                                </div>

                                {/* =================================================
                                    REMOVE
                                ================================================= */}

                                <button
                                    type="button"
                                    className="cart-remove-button"
                                    onClick={() =>
                                        removeFromCart(
                                            item.id
                                        )
                                    }
                                >
                                    Remove
                                </button>

                            </div>
                        ))}

                    </div>

                    {/* =================================================
                        ORDER SUMMARY
                    ================================================= */}

                    <div className="cart-summary">

                        <h3>
                            Order Summary
                        </h3>

                        <div className="cart-summary-row">

                            <span>
                                Total Items
                            </span>

                            <strong>
                                {getTotalItems()}
                            </strong>

                        </div>

                        <div className="cart-summary-total">

                            <span>
                                Total Amount
                            </span>

                            <strong>
                                ₹{getTotal().toFixed(2)}
                            </strong>

                        </div>

                        {/* CHECKOUT */}

                        <button
                            type="button"
                            className="place-order-button"
                            onClick={handleCheckout}
                        >
                            Proceed to Checkout →
                        </button>

                    </div>

                </div>
            )}
        </div>
    );
}

export default CustomerCart;