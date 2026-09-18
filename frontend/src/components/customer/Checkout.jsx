import { useCallback, useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaCheckCircle, FaCreditCard, FaLock, FaMapMarkerAlt, FaMoneyBillWave, FaMobileAlt, FaShieldAlt, FaShoppingCart, FaTruck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import { getApiErrorMessage, paymentErrorMessage } from "../../utils/apiError";
import { readCustomerStorage, writeCustomerStorage } from "../../utils/customerStorage";
import "./Checkout.css";
import "./CheckoutCoupons.css";
import "./CheckoutCouponsOverrides.css";

function savedAddressDetails() {
    return readCustomerStorage("shopstack-saved-address", {});
}

function Checkout() {

    const navigate = useNavigate();
    const cart = useMemo(
        () => readCustomerStorage("shopstack-cart", []),
        []
    );
    const savedAddress = useMemo(savedAddressDetails, []);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [placedOrderId, setPlacedOrderId] = useState("");
    const [paymentError, setPaymentError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        fullName: savedAddress.fullName || localStorage.getItem("username") || "",
        phone: savedAddress.phone || "",
        email: savedAddress.email || localStorage.getItem("email") || "",
        address: savedAddress.address || "",
        city: savedAddress.city || "",
        state: savedAddress.state || "",
        postalCode: savedAddress.postalCode || "",
        delivery: "standard",
        payment: "online",
        onlineMethod: "upi"
    });

    const subtotal = useMemo(
        () => cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
        [cart]
    );
    const [pricing, setPricing] = useState(null);
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponMessage, setCouponMessage] = useState("");
    const [availableCoupons, setAvailableCoupons] = useState([]);

    const deliveryFee = form.delivery === "express" ? 99 : 0;
    const quotedSubtotal = pricing?.subtotal ?? subtotal;
    const total = (pricing?.total ?? subtotal) + deliveryFee;

    function handleChange(event) {
        setForm({ ...form, [event.target.name]: event.target.value });
    }

    async function useSavedAddress() {
        const saved = savedAddressDetails();
        if (saved.address || saved.city || saved.state || saved.postalCode) {
            setForm(current => ({ ...current, fullName: saved.fullName || current.fullName, email: saved.email || current.email, phone: saved.phone || current.phone, address: saved.address || current.address, city: saved.city || current.city, state: saved.state || current.state, postalCode: saved.postalCode || current.postalCode }));
            return;
        }
        const response = await fetch("https://shopstack-backend-gjv6.onrender.com/api/users/me", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        if (!response.ok) throw new Error("Unable to load your saved address.");
        const profile = await response.json();
        setForm(current => ({ ...current, fullName: profile.name || current.fullName, email: profile.email || current.email, phone: profile.phone || current.phone, address: profile.address || current.address }));
    }

    const fetchQuote = useCallback(async () => {
        const response = await fetch("https://shopstack-backend-gjv6.onrender.com/api/orders/quote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("token") || localStorage.getItem("token")}`
            },
            body: JSON.stringify({ items: cart.map(item => ({ productId: item.id, quantity: item.quantity })), couponCode: appliedCoupon?.code || null })
        });
        const quote = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(quote.message || "Unable to calculate the order total.");
        setPricing(quote);
        return quote;
    }, [cart, appliedCoupon]);

    async function applyCouponCode(code) {
        setCouponMessage("");
        if (!code.trim()) { setCouponMessage("Enter a coupon code."); return; }
        try {
            const response = await fetch("https://shopstack-backend-gjv6.onrender.com/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionStorage.getItem("token") || localStorage.getItem("token")}` }, body: JSON.stringify({ code: code.trim(), subtotal }) });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) { setCouponMessage(response.status === 400 ? "This coupon is invalid or expired." : await getApiErrorMessage(response, "This coupon is invalid or expired.")); return; }
            setAppliedCoupon(result); setCouponMessage(result.message || "Coupon applied successfully.");
        } catch (error) {
            setCouponMessage(error.message || "Unable to connect to the coupon service.");
        }
    }

    async function applyCoupon(event) {
        event.preventDefault();
        await applyCouponCode(couponInput);
    }

    function removeCoupon() { setAppliedCoupon(null); setCouponInput(""); setCouponMessage(""); }

    useEffect(() => {
        if (cart.length === 0) return;

        fetchQuote().catch(error => {
            setPaymentError(error.message || "Unable to calculate the order total.");
        });
    }, [cart, fetchQuote]);

    const refreshAvailableCoupons = useCallback(() => {
        if (cart.length === 0) {
            setAvailableCoupons([]);
            return;
        }
        fetch(`https://shopstack-backend-gjv6.onrender.com/api/coupons/available?subtotal=${encodeURIComponent(subtotal)}`)
            .then(response => response.ok ? response.json() : [])
            .then(coupons => setAvailableCoupons(Array.isArray(coupons) ? coupons : []))
            .catch(() => setAvailableCoupons([]));
    }, [cart.length, subtotal]);

    useEffect(() => {
        refreshAvailableCoupons();
    }, [refreshAvailableCoupons]);

    useEffect(() => {
        const onCouponsUpdated = () => refreshAvailableCoupons();
        const onFocus = () => refreshAvailableCoupons();
        const onVisibilityChange = () => {
            if (!document.hidden) refreshAvailableCoupons();
        };

        window.addEventListener("storage", (event) => {
            if (event.key === "shopstack-coupons-updated") onCouponsUpdated();
        });
        window.addEventListener("shopstack-coupons-updated", onCouponsUpdated);
        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            window.removeEventListener("storage", (event) => {
                if (event.key === "shopstack-coupons-updated") onCouponsUpdated();
            });
            window.removeEventListener("shopstack-coupons-updated", onCouponsUpdated);
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [refreshAvailableCoupons]);

    async function completeOrder(paymentDetails = {}, quote) {
        const orderQuote = quote || await fetchQuote();
        const orderTotal = orderQuote.total + deliveryFee;
        const orderId = `SS-${Date.now()}`;
        const stockResponse = await fetch("https://shopstack-backend-gjv6.onrender.com/api/products/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cart.map(item => ({ productId: item.id, quantity: item.quantity })))
        });

        if (!stockResponse.ok) {
            const stockError = await stockResponse.json().catch(() => ({}));
            setPaymentError(stockResponse.status === 409 ? (stockError.message || "Only the available stock can be ordered.") : await getApiErrorMessage(stockResponse, "Unable to place the order. Please try again."));
            return;
        }

        const notificationResponse = await fetch("https://shopstack-backend-gjv6.onrender.com/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionStorage.getItem("token") || localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                orderReference: orderId,
                customerName: form.fullName,
                customerPhone: form.phone,
                deliveryAddress: `${form.address}, ${form.city}, ${form.state} ${form.postalCode}`,
                paymentMethod: form.payment === "online" ? form.onlineMethod : "Cash on Delivery",
                deliveryMethod: form.delivery,
                couponCode: orderQuote.couponCode || appliedCoupon?.code || null,
                    razorpayPaymentId:
                    paymentDetails?.razorpayPaymentId ||
                    paymentDetails?.razorpay_payment_id ||
                    null,
                items: cart.map(item => ({ productId: item.id, quantity: item.quantity }))
            })
        });
        if (!notificationResponse.ok) {
            setPaymentError(await getApiErrorMessage(notificationResponse, "Unable to place the order. Please try again."));
            return;
        }

        const order = {
            id: orderId,
            items: cart,
            subtotal: orderQuote.subtotal,
            discount: orderQuote.discount || 0,
            couponCode: orderQuote.couponCode || appliedCoupon?.code || null,
            total: orderTotal,
            delivery: form.delivery,
            payment: form.payment,
            onlineMethod: form.onlineMethod,
            paymentDetails,
            address: form,
            placedAt: new Date().toISOString()
        };

        const previousOrders = readCustomerStorage("shopstack-orders", []);
        writeCustomerStorage("shopstack-orders", [order, ...previousOrders]);
        window.dispatchEvent(new Event("ordersUpdated"));
        writeCustomerStorage("shopstack-cart", []);
        window.dispatchEvent(new Event("productsUpdated"));
        setPlacedOrderId(orderId);
        setOrderPlaced(true);
    }

    function loadRazorpayScript() {
        return new Promise(resolve => {
            if (window.Razorpay) return resolve(true);
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    }

    async function startRazorpayPayment() {
        setPaymentError("");
        const quote = await fetchQuote();
        const paymentTotal = quote.total + deliveryFee;
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            setPaymentError("Unable to load Razorpay. Check your internet connection and try again.");
            return;
        }

        const response = await fetch("https://shopstack-backend-gjv6.onrender.com/api/payments/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amountInPaise: Math.round(paymentTotal * 100), receipt: `shopstack_${Date.now()}` })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            setPaymentError(error.message || "Could not start the Razorpay payment.");
            return;
        }

        const razorpayOrder = await response.json();
        const razorpay = new window.Razorpay({
            key: razorpayOrder.keyId,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: "ShopStack",
            description: "ShopStack product order",
            order_id: razorpayOrder.orderId,
            prefill: { name: form.fullName, email: form.email, contact: form.phone },
            method: { upi: true, card: true, netbanking: true, wallet: true },
            theme: { color: "#2563eb" },
            handler: async payment => {
                const verification = await fetch("https://shopstack-backend-gjv6.onrender.com/api/payments/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        razorpayOrderId: payment.razorpay_order_id,
                        razorpayPaymentId: payment.razorpay_payment_id,
                        razorpaySignature: payment.razorpay_signature
                    })
                });
                const result = await verification.json();
                if (result.verified) await completeOrder(payment, quote);
                else setPaymentError(paymentErrorMessage());
            },
            modal: { ondismiss: () => setPaymentError("Payment was cancelled. You can try again.") }
        });
        razorpay.on("payment.failed", async response => {
            setPaymentError(paymentErrorMessage());

            try {
                const paymentId =
                    response?.error?.metadata?.payment_id || null;

                await fetch(
                    "https://shopstack-backend-gjv6.onrender.com/api/payments/failed",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization":
                                `Bearer ${sessionStorage.getItem("token") || localStorage.getItem("token")}`
                        },
                        body: JSON.stringify({
                            razorpayPaymentId: paymentId,
                            amount: paymentTotal,
                            message:
                                response?.error?.description ||
                                "Your payment could not be completed."
                        })
                    }
                );
            } catch (error) {
                console.error(
                    "Failed to create payment failure notification:",
                    error
                );
            }
        });
        razorpay.open();
    }

    async function placeOrder(event) {
        event.preventDefault();
        if (isSubmitting) return;
        setPaymentError("");
        setIsSubmitting(true);
        try {
            if (form.payment === "online") await startRazorpayPayment();
            else await completeOrder({ method: "cash_on_delivery" });
        } catch (error) {
            setPaymentError(error.message || "Unable to place the order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (orderPlaced) {
        return (
            <div className="customer-checkout-layout">
                <CustomerSidebar />
                <main className="checkout-page checkout-success">
                    <FaCheckCircle />
                    <h1>Order Placed Successfully</h1>
                    <p>Your order has been confirmed. We’ll deliver it to the address you provided.</p>
                    <strong className="checkout-success-reference">Order ID: {placedOrderId}</strong>
                    <button onClick={() => navigate("/customer/products")}>Continue Shopping</button>
                </main>
            </div>
        );
    }

    return (
        <div className="customer-checkout-layout">
            <CustomerSidebar />

            <main className="checkout-page">
                <div className="checkout-heading">
                    <div>
                        <button className="back-to-cart" onClick={() => navigate("/customer/cart")}>
                            <FaArrowLeft /> Back to Cart
                        </button>
                        <h1>Checkout</h1>
                        <p>Enter your delivery and payment details to complete your order.</p>
                    </div>
                    <div className="secure-checkout"><FaLock /> Secure Checkout</div>
                    <div className="checkout-progress" aria-label="Checkout progress">
                        <div className="progress-step active"><span>1</span><b>Details</b></div>
                        <i></i>
                        <div className="progress-step"><span>2</span><b>Payment</b></div>
                        <i></i>
                        <div className="progress-step"><span>3</span><b>Confirmation</b></div>
                    </div>
                </div>

                {cart.length === 0 ? (
                    <div className="checkout-empty">
                        <h2>Your cart is empty</h2>
                        <p>Add a product before going to checkout.</p>
                        <button onClick={() => navigate("/customer/products")}>Browse Products</button>
                    </div>
                ) : (
                    <form className="checkout-layout" onSubmit={placeOrder}>
                        <div className="checkout-form-column">
                            <section className="checkout-card">
                                <div className="section-title"><FaMapMarkerAlt /><div><h2>Delivery Address</h2><p>Where should we deliver your order?</p></div><button type="button" className="use-saved-address-btn" onClick={() => useSavedAddress().catch(error => setPaymentError(error.message))}>Use saved address</button></div>

                                <div className="form-grid">
                                    <label>Full Name<input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Enter your full name" /></label>
                                    <label>Phone Number<input name="phone" value={form.phone} onChange={handleChange} required pattern="[0-9]{10}" placeholder="10-digit mobile number" /></label>
                                    <label className="full-field">Email Address<input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" /></label>
                                    <label className="full-field">Address<input name="address" value={form.address} onChange={handleChange} required placeholder="House number, street and landmark" /></label>
                                    <label>City<input name="city" value={form.city} onChange={handleChange} required placeholder="City" /></label>
                                    <label>State<input name="state" value={form.state} onChange={handleChange} required placeholder="State" /></label>
                                    <label>Postal Code<input name="postalCode" value={form.postalCode} onChange={handleChange} required pattern="[0-9]{6}" placeholder="6-digit PIN code" /></label>
                                </div>
                            </section>

                            <section className="checkout-card">
                                <div className="section-title"><FaMoneyBillWave /><div><h2>Payment Method</h2><p>Select how you would like to pay.</p></div></div>
                                <div className="choice-list">
                                    <label className={`choice-card online-payment-choice ${form.payment === "online" ? "selected" : ""}`}><input type="radio" name="payment" value="online" checked={form.payment === "online"} onChange={handleChange} /><span><b>Online Payment</b><small>UPI, cards and net banking through a secure gateway</small></span><em>Recommended</em></label>

                                    {form.payment === "online" && (
                                        <div className="online-payment-options">
                                            <div className="online-payment-header"><div><b>Choose a payment method</b><small>Your payment details are encrypted and secure</small></div><span><FaLock /> Secure</span></div>
                                            <label className={`payment-mode ${form.onlineMethod === "upi" ? "selected" : ""}`}><input type="radio" name="onlineMethod" value="upi" checked={form.onlineMethod === "upi"} onChange={handleChange} /><FaMobileAlt className="payment-mode-icon" /><span><b>UPI</b><small>Google Pay, PhonePe or Paytm</small></span></label>
                                            <label className={`payment-mode ${form.onlineMethod === "razorpay" ? "selected" : ""}`}><input type="radio" name="onlineMethod" value="razorpay" checked={form.onlineMethod === "razorpay"} onChange={handleChange} /><FaShieldAlt className="payment-mode-icon" /><span><b>Razorpay</b><small>Secure payment gateway</small></span></label>
                                            <label className={`payment-mode ${form.onlineMethod === "credit" ? "selected" : ""}`}><input type="radio" name="onlineMethod" value="credit" checked={form.onlineMethod === "credit"} onChange={handleChange} /><FaCreditCard className="payment-mode-icon" /><span><b>Credit Card</b><small>Enter the Razorpay test card, then click Pay.</small></span></label>
                                            <label className={`payment-mode ${form.onlineMethod === "debit" ? "selected" : ""}`}><input type="radio" name="onlineMethod" value="debit" checked={form.onlineMethod === "debit"} onChange={handleChange} /><FaCreditCard className="payment-mode-icon" /><span><b>Debit Card</b><small>Use a domestic Indian card</small></span></label>
                                        </div>
                                    )}

                                    <label className={`choice-card cod-card ${form.payment === "cod" ? "selected" : ""}`}><input type="radio" name="payment" value="cod" checked={form.payment === "cod"} onChange={handleChange} /><FaMoneyBillWave className="payment-mode-icon" /><span><b>Cash on Delivery</b><small>Pay when your order arrives</small></span><strong>COD</strong></label>
                                </div>
                            </section>

                            <div className="checkout-note"><FaLock /><span><b>Your information is safe</b><br />We use your details only to process and deliver your order.</span></div>
                        </div>

                        <div className="checkout-side-column">
                        <aside className="checkout-summary">
                            <div className="summary-heading"><FaShoppingCart /><div><h2>Order Summary</h2><p>{cart.length} product{cart.length === 1 ? "" : "s"} in your order</p></div></div>
                            <div className="summary-products">
                                {cart.map(item => <div key={item.id}><span>{item.name} <b>× {item.quantity}</b></span><strong>₹{(Number(item.price) * item.quantity).toLocaleString()}</strong></div>)}
                            </div>
                            <div className="coupon-box"><b>Have a coupon?</b>{appliedCoupon ? <div className="applied-coupon"><span>{appliedCoupon.code} applied</span><button type="button" onClick={removeCoupon}>Remove</button></div> : <div className="coupon-entry"><input value={couponInput} onChange={(event) => setCouponInput(event.target.value.toUpperCase())} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); applyCoupon(event); } }} placeholder="Enter coupon code" aria-label="Coupon code" /><button type="button" onClick={applyCoupon}>Apply</button></div>}{availableCoupons.length > 0 && !appliedCoupon && <div className="available-coupons"><span>Available coupons</span>{availableCoupons.map(coupon => <button type="button" key={coupon.code} onClick={() => { setCouponInput(coupon.code); applyCouponCode(coupon.code); }}><b>{coupon.code}</b><small>{coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}{coupon.minimumOrderAmount ? ` · Min ₹${Number(coupon.minimumOrderAmount).toLocaleString("en-IN")}` : ""}</small></button>)}</div>}{availableCoupons.length === 0 && !appliedCoupon && <small className="coupon-empty-text">No active coupons are available right now.</small>}{couponMessage && <small className={appliedCoupon ? "coupon-success-text" : "coupon-error-text"}>{couponMessage}</small>}</div>
                            <hr />
                            <div><span>Subtotal</span><strong>₹{quotedSubtotal.toLocaleString()}</strong></div>
                            {pricing?.discount > 0 && <div className="coupon-discount-row"><span>Coupon discount</span><strong>-₹{Number(pricing.discount).toLocaleString()}</strong></div>}
                            <div><span>Delivery</span><strong>{deliveryFee ? `₹${deliveryFee}` : "FREE"}</strong></div>
                            <hr />
                            <div className="checkout-total"><span>Total</span><strong>₹{total.toLocaleString()}</strong></div>
                            <button className="place-order-btn" type="submit" disabled={isSubmitting}>{isSubmitting ? "Processing..." : "Place Order"}</button>
                            {paymentError && <p className="payment-error">{paymentError}</p>}
                            <div className="important-details"><b>Important Details</b><br />Please check your address and phone number carefully. Orders cannot be edited after confirmation.</div>
                        </aside>
                            <section className="checkout-card">
                                <div className="section-title"><FaTruck /><div><h2>Delivery Details</h2><p>Choose how quickly you want your order.</p></div></div>
                                <div className="choice-list">
                                    <label className={`choice-card ${form.delivery === "standard" ? "selected" : ""}`}><input type="radio" name="delivery" value="standard" checked={form.delivery === "standard"} onChange={handleChange} /><span><b>Standard Delivery</b><small>Arrives in 3–5 business days</small></span><strong>FREE</strong></label>
                                    <label className={`choice-card ${form.delivery === "express" ? "selected" : ""}`}><input type="radio" name="delivery" value="express" checked={form.delivery === "express"} onChange={handleChange} /><span><b>Express Delivery</b><small>Arrives in 1–2 business days</small></span><strong>₹99</strong></label>
                                </div>
                            </section>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}

export default Checkout;
