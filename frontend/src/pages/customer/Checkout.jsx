import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, getAddresses, addAddress, validateCoupon } from "../../api/customerApi";
import { initiatePayment, placeCodOrder } from "../../api/paymentApi";
import api from "../../api/axios";

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);

  const [newAddress, setNewAddress] = useState({
    fullName: "", phone: "", addressLine: "", city: "",
    state: "", postalCode: "", country: "India", defaultAddress: false,
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [cartRes, addrRes] = await Promise.all([getCart(), getAddresses()]);
      if (!cartRes.data || cartRes.data.items.length === 0) {
        navigate("/cart");
        return;
      }
      setCart(cartRes.data);
      setAddresses(addrRes.data || []);
      
      const defaultAddr = addrRes.data?.find(a => a.defaultAddress);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);

      try {
        const couponRes = await api.get("/customer/coupons/active");
        setAvailableCoupons(couponRes.data || []);
      } catch (e) {
        console.warn("Could not load coupons:", e);
      }
    } catch (e) {
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAddress(e) {
    e.preventDefault();
    try {
      await addAddress(newAddress);
      await loadData();
      setShowAddForm(false);
      setNewAddress({ fullName: "", phone: "", addressLine: "", city: "", state: "", postalCode: "", country: "India", defaultAddress: false });
    } catch (e) {
      alert("Failed to add address");
    }
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    applyCouponCode(couponInput.trim());
  }

  async function applyCouponCode(code) {
    setCouponInput(code);
    setCouponError("");
    try {
      const res = await validateCoupon(code, cart.totalAmount);
      if (res.data.valid) {
        setAppliedCoupon(res.data);
      } else {
        setAppliedCoupon(null);
        setCouponError(res.data.message);
      }
    } catch (e) {
      setCouponError("Failed to validate coupon");
    }
  }

  async function handlePlaceOrder() {
    if (!selectedAddressId) {
      alert("Please select a shipping address");
      return;
    }

    setProcessing(true);
    try {
      if (paymentMethod === "RAZORPAY") {
        const { data } = await initiatePayment(appliedCoupon?.code);
        navigate("/payment", {
          state: {
            addressId: selectedAddressId,
            razorpayOrder: data,
            couponCode: appliedCoupon?.code || null,
            discountAmount: appliedCoupon?.discountAmount || 0,
          },
        });
      } else {
        await placeCodOrder(selectedAddressId, appliedCoupon?.code);
        alert("🎉 Order placed successfully! Pay cash on delivery.");
        window.dispatchEvent(new Event("cart-updated"));
        navigate("/orders");
      }
    } catch (e) {
      alert("Failed to place order: " + (e.response?.data?.error || e.message));
      setProcessing(false);
    }
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center bg-white">Loading...</div>;

  const finalTotal = appliedCoupon ? Number(appliedCoupon.finalTotal) : Number(cart.totalAmount);

  return (
    // 🆕 Changed to bg-white
    <div className="min-h-screen bg-white py-8 font-['Manrope',sans-serif]">
      <div className="mx-auto max-w-6xl px-5">
        <h1 className="mb-8 font-['Fraunces',serif] text-4xl font-semibold text-stone-900">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-stone-900">Shipping Address</h2>
                <button onClick={() => setShowAddForm(!showAddForm)} className="text-[14px] font-semibold text-emerald-700 hover:text-emerald-800">+ Add New Address</button>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddAddress} className="mb-6 rounded-lg border border-stone-200 bg-stone-50 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} placeholder="Full Name" required className="rounded-lg border border-stone-300 px-3 py-2" />
                    <input value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} placeholder="Phone" required className="rounded-lg border border-stone-300 px-3 py-2" />
                    <input value={newAddress.addressLine} onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })} placeholder="Address Line" required className="col-span-full rounded-lg border border-stone-300 px-3 py-2" />
                    <input value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} placeholder="City" required className="rounded-lg border border-stone-300 px-3 py-2" />
                    <input value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} placeholder="State" required className="rounded-lg border border-stone-300 px-3 py-2" />
                    <input value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} placeholder="Postal Code" required className="rounded-lg border border-stone-300 px-3 py-2" />
                    <input value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} placeholder="Country" required className="rounded-lg border border-stone-300 px-3 py-2" />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="submit" className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Save Address</button>
                    <button type="button" onClick={() => setShowAddForm(false)} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100">Cancel</button>
                  </div>
                </form>
              )}

              {addresses.length === 0 ? (
                <p className="text-center text-stone-500">No addresses saved. Please add one.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label key={addr.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition ${selectedAddressId === addr.id ? "border-emerald-600 bg-emerald-50" : "border-stone-200 hover:border-stone-300"}`}>
                      <input type="radio" name="address" value={addr.id} checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-900">{addr.fullName}</span>
                          {addr.defaultAddress && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold uppercase text-emerald-700">Default</span>}
                        </div>
                        <p className="text-sm text-stone-600">{addr.phone}</p>
                        <p className="mt-1 text-sm text-stone-700">{addr.addressLine}</p>
                        <p className="text-sm text-stone-700">{addr.city}, {addr.state} {addr.postalCode}</p>
                        <p className="text-sm text-stone-700">{addr.country}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <h2 className="mb-4 text-xl font-semibold text-stone-900">Payment Method</h2>
              <div className="space-y-3">
                <label className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition ${paymentMethod === "RAZORPAY" ? "border-emerald-600 bg-emerald-50" : "border-stone-200 hover:border-stone-300"}`}>
                  <input type="radio" name="payment" value="RAZORPAY" checked={paymentMethod === "RAZORPAY"} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-900">Online Payment</span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold uppercase text-blue-700">Recommended</span>
                    </div>
                    <p className="mt-1 text-sm text-stone-600">Pay securely via UPI, Credit/Debit Card, or Net Banking</p>
                  </div>
                </label>
                <label className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition ${paymentMethod === "COD" ? "border-emerald-600 bg-emerald-50" : "border-stone-200 hover:border-stone-300"}`}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === "COD"} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><span className="font-semibold text-stone-900">Cash on Delivery</span></div>
                    <p className="mt-1 text-sm text-stone-600">Pay in cash when your order is delivered</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-stone-200 bg-white p-6 shadow-[0_12px_32px_-12px_rgba(6,35,31,0.15)]">
              <h2 className="mb-4 text-xl font-semibold text-stone-900">Order Summary</h2>
              
              <div className="space-y-3 border-b border-stone-200 pb-4">
                {cart.items.map((item) => (
                  <div key={item.cartId} className="flex justify-between text-sm">
                    <span className="text-stone-600">{item.productName} × {item.quantity}</span>
                    <span className="font-semibold text-stone-900">₹{item.subtotal}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{cart.totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-700">Free</span>
                </div>

                {/* COUPON BOX WITH AVAILABLE OFFERS */}
                <div className="mt-3 pt-3 border-t border-stone-200">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2.5">
                      <div>
                        <p className="text-[13px] font-bold text-emerald-800">🎟️ {appliedCoupon.code.toUpperCase()}</p>
                        <p className="text-[12px] text-emerald-700">You save ₹{appliedCoupon.discountAmount}!</p>
                      </div>
                      <button onClick={() => { setAppliedCoupon(null); setCouponInput(""); }} className="text-[12px] font-semibold text-rose-600 hover:underline">Remove</button>
                    </div>
                  ) : (
                    <>
                      {availableCoupons.length > 0 && (
                        <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-800">
                            🎁 Available Offers
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {availableCoupons.map((c) => (
                              <button
                                key={c.id}
                                onClick={() => applyCouponCode(c.code)}
                                className="flex items-center gap-2 rounded-lg border border-dashed border-emerald-400 bg-white px-2.5 py-1.5 text-[11px] font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-100 hover:shadow"
                              >
                                <span className="tracking-wider">{c.code}</span>
                                <span className="font-normal text-emerald-600">
                                  {c.discountPercentage ? `${c.discountPercentage}% OFF` : `₹${c.discountAmount || c.discountValue} OFF`}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <input
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-[13px] uppercase outline-none focus:border-emerald-500"
                        />
                        <button onClick={handleApplyCoupon} className="rounded-lg bg-stone-800 px-4 py-2 text-[13px] font-semibold text-white hover:bg-stone-900">Apply</button>
                      </div>
                      {couponError && <p className="mt-1.5 text-[12px] font-semibold text-rose-600">{couponError}</p>}
                    </>
                  )}
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-sm font-semibold text-emerald-700">
                    <span>Coupon Discount</span>
                    <span>−₹{appliedCoupon.discountAmount}</span>
                  </div>
                )}

                <div className="mt-3 border-t border-stone-200 pt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-semibold text-stone-900">Total</span>
                    <span className="font-['Fraunces',serif] text-3xl font-bold text-stone-900">₹{finalTotal}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={processing || !selectedAddressId}
                className="mt-6 w-full rounded-xl bg-emerald-800 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-emerald-800/25 transition-all hover:bg-emerald-900 active:scale-[0.99] disabled:bg-stone-300 disabled:shadow-none"
              >
                {processing ? "Processing..." : paymentMethod === "RAZORPAY" ? "Proceed to Online Payment" : `Place Order (COD) — ₹${finalTotal}`}
              </button>
              <p className="mt-4 text-center text-[11px] text-stone-400">
                {paymentMethod === "RAZORPAY" ? "Powered by Razorpay • 256-bit SSL Encrypted" : "Cash on Delivery • Pay on arrival"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}