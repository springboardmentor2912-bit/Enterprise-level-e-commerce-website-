import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaLaptop, FaMinus, FaMobileAlt, FaPlus, FaShoppingBag, FaShoppingCart, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import "./Cart.css";
import { readCustomerStorage, writeCustomerStorage } from "../../utils/customerStorage";

function getProductIcon(category) {

    const productCategory = category?.toLowerCase() || "";

    if (productCategory.includes("laptop")) return <FaLaptop />;
    if (productCategory.includes("mobile") || productCategory.includes("phone")) return <FaMobileAlt />;

    return <FaShoppingBag />;

}

function Cart() {

    const navigate = useNavigate();
    const [cart, setCart] = useState(() =>
        readCustomerStorage("shopstack-cart", [])
    );

    useEffect(() => {
        writeCustomerStorage("shopstack-cart", cart);
        window.dispatchEvent(new Event("cartUpdated"));
    }, [cart]);

    async function changeReservedStock(id, quantity, release = false) {
        const response = await fetch(`https://shopstack-backend-gjv6.onrender.com/api/products/${release ? "release" : "reserve"}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{ productId: id, quantity }])
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || "Unable to update stock");
        }
    }

    async function updateQuantity(id, change) {
        const item = cart.find(cartItem => cartItem.id === id);
        if (!item || (change < 0 && item.quantity <= 1)) return;

        try {
            await changeReservedStock(id, Math.abs(change), change < 0);
            setCart(items => items.map(current => current.id === id
                ? { ...current, quantity: current.quantity + change, stock: Math.max(0, Number(current.stock || 0) - change) }
                : current));
            window.dispatchEvent(new Event("productsUpdated"));
        } catch (error) {
            alert(error.message);
        }
    }

    async function removeItem(id) {
        const item = cart.find(cartItem => cartItem.id === id);
        if (!item) return;

        try {
            await changeReservedStock(id, item.quantity, true);
            setCart(items => items.filter(current => current.id !== id));
            window.dispatchEvent(new Event("productsUpdated"));
        } catch (error) {
            alert(error.message);
        }
    }

    const subtotal = useMemo(
        () => cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
        [cart]
    );

    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="customer-cart-layout">

            <CustomerSidebar />

            <main className="cart-page">

                <div className="cart-heading">
                    <div>
                        <p className="cart-eyebrow">YOUR SHOPPING BAG</p>
                        <h1>Shopping Cart</h1>
                        <p>{itemCount} {itemCount === 1 ? "item" : "items"} ready for checkout</p>
                    </div>

                    <button className="continue-shopping" onClick={() => navigate("/customer/products")}>
                        <FaArrowLeft /> Continue Shopping
                    </button>
                </div>

                {cart.length === 0 ? (
                    <div className="empty-cart">
                        <FaShoppingCart />
                        <h2>Your cart is empty</h2>
                        <p>Browse our products and add something you love.</p>
                        <button onClick={() => navigate("/customer/products")}>Browse Products</button>
                    </div>
                ) : (
                    <div className="cart-content">
                        <section className="cart-items">
                            {cart.map(item => (
                                <article className="cart-item" key={item.id}>
                                    <div className="cart-item-image">
                                        <span className="cart-product-icon">
                                            {getProductIcon(item.category)}
                                        </span>
                                        {item.imageUrl && (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                onError={(event) => {
                                                    event.currentTarget.onerror = null;
                                                    event.currentTarget.style.display = "none";
                                                }}
                                            />
                                        )}
                                    </div>

                                    <div className="cart-item-details">
                                        <span>{item.category}</span>
                                        <h2>{item.name}</h2>
                                        <p>{item.description}</p>
                                        <strong>₹{Number(item.price).toLocaleString()}</strong>
                                        {Number(item.originalPrice || 0) > Number(item.price) && <del className="cart-original-price">₹{Number(item.originalPrice).toLocaleString()}</del>}
                                        <small className={Number(item.stock || 0) > 0 ? "cart-stock-available" : "cart-stock-unavailable"}>
                                            {Number(item.stock || 0) > 0 ? `${item.stock} available` : "Unavailable"}
                                        </small>
                                    </div>

                                    <div className="cart-item-actions">
                                        <div className="quantity-control">
                                            <button onClick={() => updateQuantity(item.id, -1)} aria-label="Decrease quantity"><FaMinus /></button>
                                            <b>{item.quantity}</b>
                                            <button onClick={() => updateQuantity(item.id, 1)} aria-label="Increase quantity"><FaPlus /></button>
                                        </div>
                                        <b className="item-total">₹{(Number(item.price) * item.quantity).toLocaleString()}</b>
                                        <button className="remove-item" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}><FaTrash /></button>
                                    </div>
                                </article>
                            ))}
                        </section>

                        <aside className="cart-summary">
                            <h2>Order Summary</h2>
                            <div><span>Subtotal</span><strong>₹{subtotal.toLocaleString()}</strong></div>
                            <div><span>Delivery</span><strong className="free-delivery">FREE</strong></div>
                            <hr />
                            <div className="summary-total"><span>Total</span><strong>₹{subtotal.toLocaleString()}</strong></div>
                            <button
                                className="checkout-btn"
                                onClick={() => navigate("/customer/checkout")}
                            >
                                Proceed to Checkout
                            </button>
                        </aside>
                    </div>
                )}

            </main>
        </div>
    );
}

export default Cart;
