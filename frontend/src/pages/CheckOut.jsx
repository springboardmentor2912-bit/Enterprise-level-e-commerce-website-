import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCart } from "../services/cartService";
import { getProductById } from "../services/productService";
import {
  createRazorpayOrder,
  verifyPayment,
  placeCodOrder,
  createRazorpayOrderForProduct,
  verifyBuyNowPayment,
  placeCodBuyNowOrder,
} from "../services/paymentService";
import { getAddresses, addAddress } from "../services/AddressService";
import { applyCoupon, getAvailableCoupons } from "../services/couponService";

const emptyForm = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

// Payment Method Configurations
const PAYMENT_METHODS = [
  {
    id: "upi",
    name: "UPI / QR Code",
    description: "Instant payment via Google Pay, PhonePe, Paytm, or BHIM",
    icon: "📱",
    badges: ["Google Pay", "PhonePe", "Paytm", "BHIM"],
    isRazorpay: true,
  },
  {
    id: "card",
    name: "Credit / Debit Card",
    description: "All major cards accepted (Visa, Mastercard, RuPay, Amex)",
    icon: "💳",
    badges: ["Visa", "Mastercard", "RuPay"],
    isRazorpay: true,
  },
  {
    id: "netbanking",
    name: "Net Banking",
    description: "All major Indian banks supported (SBI, HDFC, ICICI, Axis)",
    icon: "🏦",
    badges: ["HDFC", "SBI", "ICICI", "Axis"],
    isRazorpay: true,
  },
  {
    id: "wallet",
    name: "Wallets & Pay Later",
    description: "Paytm, Mobikwik, Amazon Pay, LazyPay, Simpl",
    icon: "👛",
    badges: ["Wallets", "PayLater"],
    isRazorpay: true,
  },
  {
    id: "cod",
    name: "Cash on Delivery (COD)",
    description: "Pay with cash or UPI when your package arrives at your doorstep",
    icon: "💵",
    badges: ["Pay at doorstep"],
    isRazorpay: false,
  },
];

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  // If we arrived here via a "Buy Now" click, this holds
  // { productId, quantity, productName }. Its presence is what switches
  // this whole page from "checkout the cart" to "checkout just this one
  // product" — the cart is never read or written in that mode.
  const buyNow = location.state?.buyNow || null;

  const [orderSummary, setOrderSummary] = useState(null); // { items, totalAmount } — cart OR single-product, same shape
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [savingAddress, setSavingAddress] = useState(false);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("upi");

  // Coupon state — appliedCoupon is the backend's preview response
  // ({ couponCode, discountAmount, finalAmount, ... }) once validated.
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);

  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    fetchOrderSummary();
    fetchAddresses();
    // Re-run if the buyNow product changes (e.g. clicking Buy Now on a
    // different product while already on this page via browser back/forward).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyNow?.productId]);

  const fetchAvailableCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const data = await getAvailableCoupons({
        productId: buyNow ? buyNow.productId : undefined,
        quantity: buyNow ? buyNow.quantity : undefined,
      });
      setAvailableCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load available coupons", err);
      setAvailableCoupons([]);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const fetchOrderSummary = async () => {
    setLoading(true);
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
    fetchAvailableCoupons();
    try {
      if (buyNow) {
        // Single-product mode — fetch just that product's current price/
        // discount, never touch the cart.
        const product = await getProductById(buyNow.productId);
        const finalPrice = product.finalPrice ?? product.price;
        const quantity = buyNow.quantity || 1;
        const lineTotal = Math.round(finalPrice * quantity * 100) / 100;

        setOrderSummary({
          items: [
            {
              id: `buynow-${product.id}`,
              productName: product.name,
              quantity,
              lineTotal,
            },
          ],
          totalAmount: lineTotal,
        });
      } else {
        const data = await getCart();
        setOrderSummary(data);
      }
    } catch (err) {
      console.error("Failed to load order summary", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(data);

      const defaultAddr = data.find((a) => a.default) || data[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      } else {
        setShowAddForm(true);
      }
    } catch (err) {
      console.error("Failed to load addresses", err);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      await addAddress(form);
      const updated = await getAddresses();
      setAddresses(updated);
      const newest = updated[updated.length - 1];
      if (newest) {
        setSelectedAddressId(newest.id);
      }
      setShowAddForm(false);
      setForm(emptyForm);
    } catch (err) {
      alert(err.response?.data || "Failed to save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleApplyCoupon = async (codeOverride) => {
    const codeToApply = (typeof codeOverride === "string" ? codeOverride : couponInput).trim();
    if (!codeToApply) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const result = await applyCoupon({
        code: codeToApply,
        productId: buyNow ? buyNow.productId : undefined,
        quantity: buyNow ? buyNow.quantity : undefined,
      });
      setAppliedCoupon(result);
      setCouponInput(codeToApply);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data || "Failed to apply this coupon.");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert("Please add or select a shipping address first.");
      return;
    }

    setPlacing(true);
    const couponCode = appliedCoupon ? appliedCoupon.couponCode : null;

    // ---- Cash on Delivery ----
    if (selectedPaymentMethod === "cod") {
      try {
        const order = buyNow
          ? await placeCodBuyNowOrder(selectedAddressId, buyNow.productId, buyNow.quantity, couponCode)
          : await placeCodOrder(selectedAddressId, couponCode);

        navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
      } catch (err) {
        alert(err.response?.data || "Failed to place COD order.");
        setPlacing(false);
      }
      return;
    }

    // ---- Online Payments via Razorpay ----
    try {
      const razorpayOrder = buyNow
        ? await createRazorpayOrderForProduct(buyNow.productId, buyNow.quantity, couponCode)
        : await createRazorpayOrder(couponCode);

      const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
      const currentAddressId = selectedAddressId; // Scope lock

      const options = {
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amountInPaise,
        currency: razorpayOrder.currency,
        name: "ShopStack",
        description: buyNow ? buyNow.productName : "Order Payment",
        order_id: razorpayOrder.razorpayOrderId,
        prefill: {
          name: selectedAddr?.fullName || "",
          contact: selectedAddr?.phone || "",
        },
        config: {
          display: {
            blocks: {
              banks: {
                name: "Pay via " + selectedPaymentMethod.toUpperCase(),
                instruments: [
                  {
                    method: selectedPaymentMethod,
                  },
                ],
              },
            },
            sequence: ["block.banks"],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        handler: async (response) => {
          try {
            const order = buyNow
              ? await verifyBuyNowPayment({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  addressId: currentAddressId,
                  productId: buyNow.productId,
                  quantity: buyNow.quantity,
                  couponCode,
                })
              : await verifyPayment({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  addressId: currentAddressId,
                  couponCode,
                });

            navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
          } catch (err) {
            alert(
              err.response?.data ||
                "Payment verification failed. Please contact support if you were charged."
            );
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
          },
        },
        theme: {
          color: "#0f172a",
        },
      };

      if (!window.Razorpay) {
        alert("Payment gateway failed to load. Please refresh and try again.");
        setPlacing(false);
        return;
      }

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      alert(
        err.response?.data || "Failed to start payment. Please review your order."
      );
      setPlacing(false);
      fetchOrderSummary();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Loading checkout...</p>
        </div>
      </div>
    );
  }

  const items = orderSummary?.items || [];
  const finalAmount = appliedCoupon ? appliedCoupon.finalAmount : orderSummary?.totalAmount;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-medium text-slate-600">
          {buyNow ? "This product is unavailable." : "Your cart is empty."}
        </h2>
        <button
          onClick={() => navigate("/products")}
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-xl font-semibold transition shadow-xs cursor-pointer"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/60 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mb-2">
          Checkout
        </h1>
        {buyNow && (
          <p className="text-sm text-slate-500 mb-6">
            Buying <span className="font-semibold text-slate-700">{buyNow.productName}</span> directly — your cart is untouched.
          </p>
        )}
        {!buyNow && <div className="mb-8" />}

        {/* 1. Shipping Address Section */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>📍</span> Shipping Address
            </h2>
            {addresses.length > 0 && !showAddForm && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="text-emerald-700 hover:text-emerald-800 text-xs font-bold transition cursor-pointer"
              >
                + Add New Address
              </button>
            )}
          </div>

          {addresses.length > 0 && (
            <div className="space-y-3 mb-4">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                    selectedAddressId === addr.id
                      ? "border-slate-900 bg-stone-50/60 shadow-xs"
                      : "border-stone-200/80 hover:border-stone-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1 accent-slate-900"
                  />
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900">
                      {addr.fullName}
                      {addr.default && (
                        <span className="ml-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full uppercase">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                    </p>
                    <p className="text-slate-600">
                      {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">📞 {addr.phone}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {showAddForm && (
            <form
              onSubmit={handleSaveAddress}
              className="space-y-3 border-t border-stone-100 pt-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  name="fullName"
                  placeholder="Full Name"
                  required
                  value={form.fullName}
                  onChange={handleFormChange}
                  className="border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  name="phone"
                  placeholder="Phone Number"
                  required
                  value={form.phone}
                  onChange={handleFormChange}
                  className="border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
              <input
                name="addressLine1"
                placeholder="Address Line 1"
                required
                value={form.addressLine1}
                onChange={handleFormChange}
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <input
                name="addressLine2"
                placeholder="Address Line 2 (optional)"
                value={form.addressLine2}
                onChange={handleFormChange}
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <div className="grid grid-cols-3 gap-3">
                <input
                  name="city"
                  placeholder="City"
                  required
                  value={form.city}
                  onChange={handleFormChange}
                  className="border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  name="state"
                  placeholder="State"
                  required
                  value={form.state}
                  onChange={handleFormChange}
                  className="border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
                <input
                  name="postalCode"
                  placeholder="Postal Code"
                  required
                  value={form.postalCode}
                  onChange={handleFormChange}
                  className="border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
              <input
                name="country"
                placeholder="Country"
                required
                value={form.country}
                onChange={handleFormChange}
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  {savingAddress ? "Saving..." : "Save Address"}
                </button>
                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 border border-stone-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-stone-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* 2. Payment Options Section */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>💳</span> Payment Method
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">
              🔒 100% Encrypted & Secure
            </span>
          </div>

          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedPaymentMethod === method.id;
              return (
                <div
                  key={method.id}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-slate-900 bg-stone-50/80 shadow-xs"
                      : "border-stone-200/80 hover:border-stone-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={isSelected}
                        onChange={() => setSelectedPaymentMethod(method.id)}
                        className="mt-1 accent-slate-900 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{method.icon}</span>
                          <span className="font-semibold text-slate-900 text-sm">
                            {method.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {method.description}
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-wrap gap-1.5 justify-end max-w-[180px]">
                      {method.badges.map((b, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-stone-100 text-slate-600 px-2 py-0.5 rounded-md font-medium border border-stone-200/60"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Order Summary Section */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>🛍️</span> Order Summary
          </h2>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-1">
                <span className="text-slate-600">
                  {item.productName}{" "}
                  <span className="text-slate-400 font-medium">
                    × {item.quantity}
                  </span>
                </span>
                <span className="font-semibold text-slate-900">
                  ₹{item.lineTotal}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-100 pt-4 mt-4">
            {/* Coupon input */}
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-xl px-4 py-3 mb-3">
                <div>
                  <p className="text-sm font-bold text-emerald-800">
                    🎟️ {appliedCoupon.couponCode} applied
                  </p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    You saved ₹{appliedCoupon.discountAmount}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    placeholder="Enter coupon code"
                    className="flex-1 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    disabled={applyingCoupon || !couponInput.trim()}
                    className="px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition disabled:opacity-50 cursor-pointer"
                  >
                    {applyingCoupon ? "Checking..." : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-rose-600 mt-1.5">{couponError}</p>
                )}
              </div>
            )}
            {/* Available coupons the customer can pick from */}
            {!appliedCoupon && !loadingCoupons && availableCoupons.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Available Coupons
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {availableCoupons.map((coupon) => (
                    <div
                      key={coupon.code}
                      className={`flex items-center justify-between gap-3 border rounded-xl px-3.5 py-2.5 ${
                        coupon.eligible
                          ? "border-stone-200 bg-white"
                          : "border-stone-100 bg-stone-50/60"
                      }`}
                    >
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-bold font-mono ${
                            coupon.eligible ? "text-slate-900" : "text-slate-400"
                          }`}
                        >
                          🎟️ {coupon.code}
                        </p>
                        <p className={`text-[11px] mt-0.5 ${coupon.eligible ? "text-slate-500" : "text-slate-400"}`}>
                          {coupon.discountType === "PERCENTAGE"
                            ? `${Number(coupon.discountValue).toFixed(0)}% off${
                                coupon.maxDiscount ? ` (up to ₹${coupon.maxDiscount})` : ""
                              }`
                            : `₹${coupon.discountValue} off`}
                          {coupon.minOrderAmount ? ` on orders above ₹${coupon.minOrderAmount}` : ""}
                        </p>
                        {!coupon.eligible && coupon.message && (
                          <p className="text-[11px] text-amber-600 mt-0.5">{coupon.message}</p>
                        )}
                      </div>
                      {coupon.eligible ? (
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon(coupon.code)}
                          disabled={applyingCoupon}
                          className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition disabled:opacity-50 cursor-pointer"
                        >
                          Apply
                        </button>
                      ) : (
                        <span className="shrink-0 text-[11px] font-semibold text-slate-300">Locked</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span>₹{orderSummary.totalAmount}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-xs text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span>− ₹{appliedCoupon.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-slate-500">
                <span>Delivery Charges</span>
                <span className="text-emerald-600 font-semibold uppercase">Free</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-stone-100 pt-3 mt-1">
                <span>Total Payable</span>
                <span className="text-xl">₹{finalAmount}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Submit Action Button */}
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={placing || !selectedAddressId}
          className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
        >
          {placing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing Order...</span>
            </>
          ) : selectedPaymentMethod === "cod" ? (
            `Place Order (COD) • ₹${finalAmount}`
          ) : (
            `Pay ₹${finalAmount} via ${
              PAYMENT_METHODS.find((m) => m.id === selectedPaymentMethod)?.name
            }`
          )}
        </button>
        <button
          type="button"
          onClick={() => navigate(buyNow ? -1 : "/cart")}
          className="w-full mt-3 bg-white hover:bg-stone-50 border border-stone-200/80 text-slate-700 py-3 rounded-xl font-semibold text-xs transition cursor-pointer"
        >
          {buyNow ? "Back" : "Back to Cart"}
        </button>
      </div>
    </div>
  );
}

export default Checkout;