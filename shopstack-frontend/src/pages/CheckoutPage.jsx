import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { setCartItems, setCartLoading } from '../store/slices/cartSlice';
import {
  CreditCard, ShoppingBag, MapPin, ShieldCheck, CheckCircle,
  Package, Zap, ArrowLeft, Loader2, AlertTriangle, Lock, RefreshCw,
  User, Phone, Home, Building2, Map, Hash, Ticket, Tag, Check, X, Mail
} from 'lucide-react';

import { getErrorMessage } from '../api/errorUtils';

// Load official Razorpay SDK script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.getElementById('razorpay-sdk');
    if (existing) {
      existing.onload = () => resolve(true);
      existing.onerror = () => resolve(false);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems, loading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  // Delivery Address Form Fields
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name ? user.name : (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : ''),
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    state: '',
    pincode: '',
  });

  // Keep addressForm in sync if user profile loads after component mount
  useEffect(() => {
    if (user) {
      setAddressForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : ''),
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || '',
      }));
    }
  }, [user]);

  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');
  const [paymentFailed, setPaymentFailed] = useState(false);

  // Coupon Engine States
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });
  const [availableCoupons, setAvailableCoupons] = useState([]);

  const paymentSucceeded = useRef(false);

  const fetchCart = async () => {
    dispatch(setCartLoading(true));
    try {
      const res = await axiosClient.get('/cart');
      dispatch(setCartItems(res.data));
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to load shopping cart. Please try refreshing.'));
    } finally {
      dispatch(setCartLoading(false));
    }
  };

  const fetchActiveCoupons = async () => {
    try {
      const res = await axiosClient.get('/coupons/active');
      setAvailableCoupons(res.data);
    } catch (err) {
      console.error('Failed to load active coupons', err);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchActiveCoupons();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate cart totals
  const rawTotals = cartItems.reduce((acc, item) => {
    const original = Number(item.product?.price || 0);
    const final = Number(item.product?.finalPrice || item.product?.price || 0);
    const qty = item.quantity || 1;
    acc.originalTotal += original * qty;
    acc.subtotal += final * qty;
    acc.productDiscount += (original - final) * qty;
    return acc;
  }, { originalTotal: 0, subtotal: 0, productDiscount: 0 });

  const finalOrderAmount = Math.max(0, rawTotals.subtotal - couponDiscount);

  // Coupon application handler
  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponCodeInput;
    if (!code || !code.trim()) {
      setCouponMsg({ type: 'error', text: 'Please enter a coupon code.' });
      return;
    }

    setCouponLoading(true);
    setCouponMsg({ type: '', text: '' });

    try {
      const res = await axiosClient.post('/coupons/validate', {
        code: code.trim(),
        cartTotal: rawTotals.subtotal,
      });

      if (res.data.valid) {
        setAppliedCoupon(res.data);
        setCouponDiscount(Number(res.data.discountAmount || 0));
        setCouponMsg({ type: 'success', text: res.data.message });
      } else {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponMsg({ type: 'error', text: res.data.message });
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      setCouponMsg({ type: 'error', text: getErrorMessage(err, 'Failed to validate coupon.') });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCodeInput('');
    setCouponMsg({ type: '', text: '' });
  };

  const handleRazorpayPayment = async (e) => {
    if (e) e.preventDefault();

    const { fullName, email, phone, address, city, state, pincode } = addressForm;
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      setErrorMsg('Please complete all delivery address fields before proceeding.');
      return;
    }

    const shippingAddr = `${fullName.trim()}, Phone: ${phone.trim()}, ${address.trim()}, ${city.trim()}, ${state.trim()} - ${pincode.trim()}`;

    setErrorMsg('');
    setPaymentFailed(false);
    setPaying(true);
    paymentSucceeded.current = false;

    try {
      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded || !window.Razorpay) {
        setErrorMsg('Unable to load Razorpay payment gateway. Please check your internet connection.');
        setPaying(false);
        return;
      }

      const orderRes = await axiosClient.post('/payment/create-order', {
        couponCode: appliedCoupon ? appliedCoupon.code : null,
      });
      const { key, amount, razorpay_order_id, razorpayOrderId } = orderRes.data;
      const rzpOrderId = razorpay_order_id || razorpayOrderId;

      if (!key || !rzpOrderId) {
        throw new Error('Failed to obtain Razorpay order credentials from backend.');
      }

      const contactName = fullName.trim();
      const contactEmail = (email || user?.email || 'customer@shopstack.com').trim();
      const contactPhone = phone.trim();

      const options = {
        key: key,
        amount: amount,
        currency: 'INR',
        name: 'ShopStack',
        description: `Order of ${cartItems.length} item(s)`,
        order_id: rzpOrderId,
        remember_customer: false,
        prefill: {
          name: contactName,
          email: contactEmail,
          contact: contactPhone,
        },
        notes: {
          shippingAddress: shippingAddr,
          couponCode: appliedCoupon ? appliedCoupon.code : '',
        },
        theme: {
          color: '#6366f1',
        },

        handler: async (response) => {
          paymentSucceeded.current = true;
          try {
            const verifyRes = await axiosClient.post('/payment/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              shippingAddress: shippingAddr,
              couponCode: appliedCoupon ? appliedCoupon.code : null,
            });

            dispatch(setCartItems([]));
            setPaymentFailed(false);
            setErrorMsg('');
            setOrderSuccess(`Order #${verifyRes.data.id} confirmed! 🎉 Payment verified successfully.`);
            setTimeout(() => navigate('/orders'), 2500);
          } catch (verifyErr) {
            paymentSucceeded.current = false;
            setPaymentFailed(true);
            setErrorMsg(
              getErrorMessage(
                verifyErr,
                'Payment was received but order creation failed. Please contact support with payment ID: ' + response.razorpay_payment_id
              )
            );
          } finally {
            setPaying(false);
          }
        },

        modal: {
          ondismiss: () => {
            if (paymentSucceeded.current) return;
            setPaying(false);
            setPaymentFailed(true);
            setErrorMsg('Payment was cancelled. Your cart items remain safe.');
            axiosClient.post('/payment/cancel', { razorpay_order_id: rzpOrderId }).catch(() => {});
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', function (response) {
        if (paymentSucceeded.current) return;
        setPaying(false);
        setPaymentFailed(true);
        const errDesc = response?.error?.description || 'Transaction declined.';
        setErrorMsg(`Payment failed: ${errDesc} Please try a different payment method.`);
      });

      razorpayInstance.open();

    } catch (err) {
      setPaying(false);
      setPaymentFailed(true);
      setErrorMsg(getErrorMessage(err, 'Payment initialization failed.'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto" />
          <h2 className="text-xl font-bold text-white">Your cart is empty</h2>
          <p className="text-xs text-slate-400">Add products to your cart before proceeding to checkout.</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all cursor-pointer"
          >
            Browse Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
              <CreditCard className="w-7 h-7 mr-3 text-indigo-400" /> Secure Checkout
            </h1>
            <p className="text-xs text-slate-400">Review order details, apply coupons & pay via Razorpay</p>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </button>
        </div>

        {/* Success message banner */}
        {orderSuccess && (
          <div className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-5 rounded-2xl text-sm shadow-lg">
            <CheckCircle className="w-6 h-6 flex-shrink-0 text-emerald-400" />
            <div>
              <p className="font-bold text-base">{orderSuccess}</p>
              <p className="text-xs text-emerald-300 mt-0.5">Redirecting to order tracking...</p>
            </div>
          </div>
        )}

        {/* Failure alert banner */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-2xl text-sm space-y-2">
            <div className="flex items-center space-x-2 font-bold text-rose-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{paymentFailed ? 'Payment Issue' : 'Notice'}</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">{errorMsg}</p>
          </div>
        )}

        {!orderSuccess && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column: Delivery Address + Order Items Summary */}
            <div className="lg:col-span-3 space-y-6">

              {/* Delivery Address Section */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <MapPin className="w-5 h-5 text-indigo-400" /> Delivery Address
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-indigo-400" /> Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={addressForm.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. John Doe"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-indigo-400" /> Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={addressForm.email}
                      onChange={handleInputChange}
                      placeholder="e.g. customer@example.com"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" /> Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={addressForm.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 9876543210"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-400 font-medium flex items-center gap-1">
                      <Home className="w-3.5 h-3.5 text-indigo-400" /> Street Address / House No *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={addressForm.address}
                      onChange={handleInputChange}
                      placeholder="e.g. House 42, Green Park Main Road"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" /> City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={addressForm.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Mumbai"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium flex items-center gap-1">
                      <Map className="w-3.5 h-3.5 text-indigo-400" /> State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={addressForm.state}
                      onChange={handleInputChange}
                      placeholder="e.g. Maharashtra"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-400 font-medium flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-indigo-400" /> Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={addressForm.pincode}
                      onChange={handleInputChange}
                      placeholder="e.g. 400001"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Order Items List */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-400" />
                    Order Items ({cartItems.length})
                  </h2>
                </div>
                <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto">
                  {cartItems.map((item) => {
                    const originalPrice = Number(item.product?.price || 0);
                    const finalPrice = Number(item.product?.finalPrice || item.product?.price || 0);
                    const qty = item.quantity || 1;

                    return (
                      <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-slate-800/30 transition-all">
                        <img
                          src={
                            item.product?.images?.length > 0
                              ? item.product.images[0]
                              : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'
                          }
                          alt={item.product?.name}
                          className="w-14 h-14 rounded-xl object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-white line-clamp-1">{item.product?.name}</h3>
                          <p className="text-xs text-slate-400">{item.product?.vendor?.businessName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-indigo-300">₹{finalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-slate-400">Qty: {qty}</p>
                          <p className="text-sm font-extrabold text-white">₹{(finalPrice * qty).toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column: Coupon Section + Payment Summary + Pay Button */}
            <div className="lg:col-span-2 space-y-4">

              {/* Coupon Engine Box */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Ticket className="w-5 h-5 text-amber-400" /> Apply Coupon Code
                </h2>

                {appliedCoupon ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-amber-400 font-mono text-sm tracking-wider">{appliedCoupon.code}</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">APPLIED</span>
                      </div>
                      <p className="text-xs text-emerald-300 mt-1 font-bold">
                        🎉 Saving ₹{couponDiscount.toFixed(2)} on this order!
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-800 transition-all cursor-pointer"
                      title="Remove Coupon"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE (e.g. WELCOME10)"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white uppercase font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        disabled={couponLoading || !couponCodeInput.trim()}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
                      >
                        {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                      </button>
                    </div>

                    {couponMsg.text && (
                      <p className={`text-xs font-medium ${couponMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {couponMsg.text}
                      </p>
                    )}

                    {/* Available Promotions Quick Click */}
                    {availableCoupons.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <p className="text-[11px] font-bold text-slate-400">Available Promotional Codes:</p>
                        <div className="space-y-1.5">
                          {availableCoupons.slice(0, 3).map((c) => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setCouponCodeInput(c.code);
                                handleApplyCoupon(c.code);
                              }}
                              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 hover:border-amber-500/40 rounded-xl flex items-center justify-between cursor-pointer transition-all group"
                            >
                              <div>
                                <span className="font-mono font-black text-amber-400 text-xs tracking-wider">{c.code}</span>
                                <p className="text-[10px] text-slate-400 line-clamp-1">{c.description}</p>
                              </div>
                              <span className="text-[10px] font-bold text-indigo-400 group-hover:underline">Use</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Summary */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-5 sticky top-6">
                <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">
                  Payment Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="text-slate-200">₹{rawTotals.subtotal.toFixed(2)}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-amber-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Ticket className="w-3.5 h-3.5" /> Coupon ({appliedCoupon?.code})
                      </span>
                      <span>− ₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400">
                    <span>Delivery Charge</span>
                    <span className="text-emerald-400 font-semibold">FREE</span>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-white text-base">Net Total Amount</span>
                    <span className="text-2xl font-black text-indigo-400">₹{finalOrderAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Pay with Razorpay Button */}
                <button
                  onClick={handleRazorpayPayment}
                  disabled={paying || cartItems.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  {paying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Opening Razorpay Popup...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay ₹{finalOrderAmount.toFixed(2)} with Razorpay</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Razorpay Official Checkout · SSL Encrypted</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
