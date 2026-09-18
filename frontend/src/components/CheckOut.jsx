import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentApi, couponApi } from '../api';
import { getErrorMessage } from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Lock, ArrowLeft, RefreshCw, AlertTriangle, ShieldCheck, Check, 
  CreditCard, Smartphone, Building2, Banknote, CheckCircle2, ChevronRight, HelpCircle,
  Tag, Percent, Sparkles, X, CheckCircle
} from 'lucide-react';
import PaymentProcessingModal from './PaymentProcessingModal';

const formatPrice = (val) => {
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

// Card Brand Detector Helper
const detectCardBrand = (number = '') => {
  const clean = number.replace(/\s+/g, '');
  if (/^4/.test(clean)) return { brand: 'VISA', label: 'Visa', color: '#1a1f71', bg: '#e0e7ff' };
  if (/^(5[1-5]|2[2-7])/.test(clean)) return { brand: 'MASTERCARD', label: 'Mastercard', color: '#eb001b', bg: '#fee2e2' };
  if (/^(60|65|81|82|508)/.test(clean)) return { brand: 'RUPAY', label: 'RuPay', color: '#097939', bg: '#dcfce7' };
  if (/^3[47]/.test(clean)) return { brand: 'AMEX', label: 'Amex', color: '#007bc1', bg: '#e0f2fe' };
  return { brand: 'GENERIC', label: 'Card', color: '#6366f1', bg: '#ede9fe' };
};

const POPULAR_BANKS = [
  { id: 'HDFC', name: 'HDFC Bank', code: 'HDFC' },
  { id: 'SBI', name: 'State Bank of India', code: 'SBIN' },
  { id: 'ICICI', name: 'ICICI Bank', code: 'ICIC' },
  { id: 'AXIS', name: 'Axis Bank', code: 'UTIB' },
  { id: 'KOTAK', name: 'Kotak Mahindra Bank', code: 'KKBK' },
  { id: 'PNB', name: 'Punjab National Bank', code: 'PUNB' },
];

const CheckOut = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [activeOffers, setActiveOffers] = useState([]);

  useEffect(() => {
    couponApi.getActive()
      .then(res => setActiveOffers(res.data || []))
      .catch(() => setActiveOffers([]));
  }, []);

  // Calculate Order Totals with Coupon Discounts
  const calculateTotals = () => {
    let originalTotal = 0;
    let catalogSubtotal = 0;

    cart.forEach(item => {
      const p = item.product;
      const currentPrice = p.discountPrice || p.price || 0;
      const originalPrice = p.price || currentPrice;
      catalogSubtotal += currentPrice * item.quantity;
      originalTotal += originalPrice * item.quantity;
    });

    catalogSubtotal = Math.round(catalogSubtotal * 100) / 100;
    originalTotal = Math.round(originalTotal * 100) / 100;
    const catalogDiscount = Math.max(0, Math.round((originalTotal - catalogSubtotal) * 100) / 100);

    let couponDiscount = 0;
    if (appliedCoupon && appliedCoupon.discountAmount) {
      couponDiscount = Math.min(appliedCoupon.discountAmount, catalogSubtotal);
    }

    const finalTotal = Math.max(0, Math.round((catalogSubtotal - couponDiscount) * 100) / 100);
    const totalDiscount = Math.round((catalogDiscount + couponDiscount) * 100) / 100;

    return {
      originalTotal,
      catalogSubtotal,
      catalogDiscount,
      couponDiscount,
      finalTotal,
      totalDiscount
    };
  };

  const { originalTotal, catalogSubtotal, catalogDiscount, couponDiscount, finalTotal, totalDiscount } = calculateTotals();

  // Coupon Handlers
  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await couponApi.validate({
        code,
        orderAmount: catalogSubtotal
      });

      if (res.data && res.data.valid) {
        setAppliedCoupon(res.data);
        setCouponInput('');
        setCouponError('');
      } else {
        setCouponError(res.data?.message || 'Invalid or expired coupon code.');
        setAppliedCoupon(null);
      }
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to validate coupon code.');
      setCouponError(msg);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handleRetryPayment = () => {
    setPaymentState('IDLE');
    setPaymentDetails({ amount: 0, paymentId: '', orderId: '', errorReason: '' });
    setError('');
  };

  const handleCloseModal = () => {
    setPaymentState('IDLE');
    setPaymentDetails({ amount: 0, paymentId: '', orderId: '', errorReason: '' });
  };

  // Payment Processing State: 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
  const [paymentState, setPaymentState] = useState('IDLE');
  const [paymentDetails, setPaymentDetails] = useState({
    amount: 0,
    paymentId: '',
    orderId: '',
    errorReason: '',
  });

  // Delivery Address Form
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    streetAddress: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Payment Method Selection: 'CARD' | 'UPI' | 'NETBANKING' | 'COD'
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CARD');

  // Test Mode Payment Method Fields
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: user?.fullName || '',
    expiryDate: '',
    cvv: '',
  });

  const [upiData, setUpiData] = useState({
    upiApp: 'GPAY',
    vpaId: 'success@razorpay',
  });

  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Address Field Errors
  const [addressFieldErrors, setAddressFieldErrors] = useState({});

  const validateAddressForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters.';
    }

    const cleanPhone = formData.phoneNumber.replace(/[\s\-()]/g, '');
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone Number is required.';
    } else if (!/^\+?[0-9]{10,13}$/.test(cleanPhone)) {
      errors.phoneNumber = 'Please enter a valid 10-digit phone number.';
    }

    if (!formData.streetAddress.trim()) {
      errors.streetAddress = 'Street Address / Flat No is required.';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required.';
    }

    if (!formData.state.trim()) {
      errors.state = 'State is required.';
    }

    const cleanPin = formData.pincode.trim();
    if (!cleanPin) {
      errors.pincode = 'Pincode is required.';
    } else if (!/^[0-9]{6}$/.test(cleanPin)) {
      errors.pincode = 'Please enter a valid 6-digit postal pincode.';
    }

    setAddressFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (addressFieldErrors[name]) {
      setAddressFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePaymentSubmit = async () => {
    // Validate delivery address fields
    if (!validateAddressForm()) {
      setError('Please resolve the highlighted delivery address errors before proceeding.');
      return;
    }

    const fullAddress = `${formData.streetAddress.trim()}, ${formData.city.trim()}, ${formData.state.trim()} - ${formData.pincode.trim()}`;
    
    setLoading(true);
    setError('');

    // ================= 1. Cash on Delivery (COD) Flow =================
    if (selectedPaymentMethod === 'COD') {
      try {
        const payload = {
          shippingAddress: fullAddress,
          paymentMethod: 'COD',
          couponCode: appliedCoupon?.couponCode || null,
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        };
        await paymentApi.createOrder(payload);
        
        setSuccessMessage('Order Placed Successfully! Cash will be collected upon delivery.');
        setShowSuccessPopup(true);
        setTimeout(() => {
          clearCart();
          navigate('/orders', { state: { message: 'Order Placed Successfully via Cash on Delivery!' } });
        }, 2500);
      } catch (err) {
        const errMsg = getErrorMessage(err, 'COD Order creation failed. Please try again.');
        setError(errMsg);
        setLoading(false);
      }
      return;
    }

    // ================= 2. Online Payment Flow (Razorpay Test Mode) =================
    setPaymentState('PROCESSING');
    setPaymentDetails({
      amount: finalTotal,
      paymentId: '',
      orderId: '',
      errorReason: '',
    });

    try {
      const payload = {
        shippingAddress: fullAddress,
        paymentMethod: selectedPaymentMethod,
        couponCode: appliedCoupon?.couponCode || null,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      // Create Payment Order in backend (amount verified server-side)
      const res = await paymentApi.createOrder(payload);
      const paymentOrderData = res.data;

      // Backend calculated amount in paise (1 INR = 100 Paise)
      const amountInPaise = paymentOrderData.amountInPaise || Math.round(finalTotal * 100);

      setPaymentDetails((prev) => ({
        ...prev,
        orderId: paymentOrderData.razorpayOrderId || '',
        amount: finalTotal,
      }));

      const keyStr = String(paymentOrderData.keyId || '');
      const isMockOrder = !paymentOrderData.razorpayOrderId || 
        paymentOrderData.razorpayOrderId.startsWith('order_mock_') || 
        paymentOrderData.razorpayOrderId.startsWith('COD-');
      const isRealRazorpayKey = (keyStr.startsWith('rzp_live_') || keyStr.startsWith('rzp_test_')) && 
        !keyStr.includes('shopstack') && 
        !keyStr.includes('mock') && 
        !keyStr.includes('COD_MODE');
      const isRealRazorpay = !isMockOrder && isRealRazorpayKey;

      const runSimulationFlow = () => {
        // ================= 3. Razorpay Test Mode Simulation Flow =================
        // Automatically simulates payment processing & backend verification
        const simulatedPaymentId = 'pay_test_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
        
        setTimeout(async () => {
          try {
            await paymentApi.verify({
              razorpayOrderId: paymentOrderData.razorpayOrderId,
              razorpayPaymentId: simulatedPaymentId,
              razorpaySignature: 'simulated_signature',
            });

            setPaymentDetails({
              amount: finalTotal,
              paymentId: simulatedPaymentId,
              orderId: paymentOrderData.razorpayOrderId,
              errorReason: '',
            });
            setPaymentState('SUCCESS');

            setTimeout(() => {
              clearCart();
              navigate('/orders', { state: { message: 'Payment Successful! Your order has been placed in Test Mode.' } });
            }, 2000);
          } catch (verifyErr) {
            const verifyMsg = getErrorMessage(verifyErr, 'Payment verification failed.');
            setPaymentDetails({
              amount: finalTotal,
              paymentId: simulatedPaymentId,
              orderId: paymentOrderData.razorpayOrderId,
              errorReason: verifyMsg,
            });
            setPaymentState('FAILED');
            setLoading(false);
          }
        }, 1200);
      };

      // If Razorpay SDK is loaded in window and a valid live/test key is configured:
      if (typeof window !== 'undefined' && window.Razorpay && isRealRazorpay) {
        try {
          const options = {
            key: paymentOrderData.keyId,
            amount: amountInPaise,
            currency: paymentOrderData.currency || 'INR',
            name: 'ShopStack Enterprise',
            description: `Order Payment (${selectedPaymentMethod})`,
            order_id: paymentOrderData.razorpayOrderId,
            prefill: {
              name: formData.fullName,
              contact: formData.phoneNumber,
              email: user?.email || 'customer@example.com',
              method: selectedPaymentMethod === 'CARD' ? 'card' : selectedPaymentMethod === 'UPI' ? 'upi' : 'netbanking',
            },
            theme: { color: '#6366f1' },
            handler: async function (response) {
              setPaymentState('PROCESSING');
              try {
                // Cryptographic HMAC-SHA256 verification on the backend
                await paymentApi.verify({
                  razorpayOrderId: response.razorpay_order_id || paymentOrderData.razorpayOrderId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                });

                setPaymentDetails({
                  amount: finalTotal,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id || paymentOrderData.razorpayOrderId,
                  errorReason: '',
                });
                setPaymentState('SUCCESS');

                setTimeout(() => {
                  clearCart();
                  navigate('/orders', { state: { message: 'Payment Verified Successfully! Your order has been placed.' } });
                }, 2000);
              } catch (verifyErr) {
                const verifyMsg = getErrorMessage(verifyErr, 'Payment signature verification failed.');
                setPaymentDetails({
                  amount: finalTotal,
                  paymentId: response.razorpay_payment_id || '',
                  orderId: response.razorpay_order_id || paymentOrderData.razorpayOrderId,
                  errorReason: verifyMsg,
                });
                setPaymentState('FAILED');
                setLoading(false);
              }
            },
            modal: {
              ondismiss: function () {
                paymentApi.handleFailure(paymentOrderData.razorpayOrderId, 'Payment dismissed by customer.');
                setPaymentDetails({
                  amount: finalTotal,
                  paymentId: '',
                  orderId: paymentOrderData.razorpayOrderId,
                  errorReason: 'Payment window was closed before completion. You can retry anytime.',
                });
                setPaymentState('FAILED');
                setLoading(false);
              },
            },
          };

          const razorpayInstance = new window.Razorpay(options);
          
          if (typeof razorpayInstance.on === 'function') {
            razorpayInstance.on('payment.failed', function (resp) {
              const failReason = resp.error?.description || 'Transaction declined by issuer bank or payment gateway.';
              paymentApi.handleFailure(paymentOrderData.razorpayOrderId, failReason);
              setPaymentDetails({
                amount: finalTotal,
                paymentId: resp.error?.metadata?.payment_id || '',
                orderId: paymentOrderData.razorpayOrderId,
                errorReason: failReason,
              });
              setPaymentState('FAILED');
              setLoading(false);
            });
          }

          razorpayInstance.open();
        } catch (sdkErr) {
          console.warn('Razorpay SDK popup invocation failed, falling back to Test Simulation mode:', sdkErr);
          runSimulationFlow();
        }
      } else {
        runSimulationFlow();
      }
    } catch (err) {
      const errMsg = getErrorMessage(err, 'Order creation failed. Please try again.');
      setPaymentDetails({
        amount: finalTotal,
        paymentId: '',
        orderId: '',
        errorReason: errMsg,
      });
      setPaymentState('FAILED');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ color: '#f8fafc', fontSize: '1.75rem', fontWeight: 800 }}>Your cart is empty</h2>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Add some products to your cart before proceeding to checkout.</p>
        <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontWeight: 600 }}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  const detectedCard = detectCardBrand(cardData.cardNumber);

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1140px' }}>
      
      {/* Header Breadcrumb & Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.85rem', color: '#f8fafc', fontWeight: 800, margin: 0 }}>
            <Lock size={26} color="#818cf8" />
            Secure Checkout
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '0.25rem' }}>
            Complete your order with Razorpay Test Mode or Cash on Delivery
          </p>
        </div>
        <Link 
          to="/cart" 
          style={{ 
            color: '#818cf8', 
            textDecoration: 'none', 
            fontSize: '0.9rem', 
            fontWeight: 600, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem',
            padding: '0.5rem 0.85rem',
            borderRadius: '8px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}
        >
          <ArrowLeft size={16} /> Back to Cart
        </Link>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem 1.25rem', 
          background: 'rgba(239, 68, 68, 0.15)', 
          border: '1px solid rgba(239, 68, 68, 0.3)', 
          color: '#fca5a5', 
          borderRadius: '10px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.6rem', 
          marginBottom: '1.75rem',
          fontSize: '0.92rem',
          fontWeight: 600
        }}>
          <AlertTriangle size={20} color="#ef4444" />
          {error}
        </div>
      )}

      <div className="cart-checkout-layout" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Left Column: Delivery Address & Payment Options */}
        <div style={{ flex: '1 1 540px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* 1. Delivery Address Form */}
          <div style={{ background: '#111827', borderRadius: '14px', border: '1px solid #1f2937', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.2rem', color: '#f8fafc', fontWeight: 800, marginBottom: '1.5rem', marginTop: 0 }}>
              <MapPin size={22} color="#818cf8" />
              1. Delivery Address
            </h2>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div className="input-group" style={{ flex: '1 1 240px', marginBottom: 0 }}>
                <label className="input-label" style={{ color: '#cbd5e1', fontSize: '0.88rem', fontWeight: 600 }}>Full Name *</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleAddressChange} 
                  placeholder="e.g. John Doe"
                  className={`input-field ${addressFieldErrors.fullName ? 'input-error' : ''}`}
                  style={{ background: '#1f2937', color: '#f8fafc', border: addressFieldErrors.fullName ? '1px solid #ef4444' : '1px solid #374151' }} 
                  required 
                />
                {addressFieldErrors.fullName && <span className="field-error-text">{addressFieldErrors.fullName}</span>}
              </div>
              <div className="input-group" style={{ flex: '1 1 240px', marginBottom: 0 }}>
                <label className="input-label" style={{ color: '#cbd5e1', fontSize: '0.88rem', fontWeight: 600 }}>Phone Number *</label>
                <input 
                  type="tel" 
                  name="phoneNumber" 
                  value={formData.phoneNumber} 
                  onChange={handleAddressChange} 
                  placeholder="e.g. 9876543210"
                  className={`input-field ${addressFieldErrors.phoneNumber ? 'input-error' : ''}`}
                  style={{ background: '#1f2937', color: '#f8fafc', border: addressFieldErrors.phoneNumber ? '1px solid #ef4444' : '1px solid #374151' }} 
                  required 
                />
                {addressFieldErrors.phoneNumber && <span className="field-error-text">{addressFieldErrors.phoneNumber}</span>}
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '1rem' }}>
              <label className="input-label" style={{ color: '#cbd5e1', fontSize: '0.88rem', fontWeight: 600 }}>Street Address / Flat No *</label>
              <input 
                type="text" 
                name="streetAddress" 
                value={formData.streetAddress} 
                onChange={handleAddressChange} 
                placeholder="e.g. 102, Green Valley Apartments, MG Road"
                className={`input-field ${addressFieldErrors.streetAddress ? 'input-error' : ''}`}
                style={{ background: '#1f2937', color: '#f8fafc', border: addressFieldErrors.streetAddress ? '1px solid #ef4444' : '1px solid #374151' }} 
                required 
              />
              {addressFieldErrors.streetAddress && <span className="field-error-text">{addressFieldErrors.streetAddress}</span>}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div className="input-group" style={{ flex: '1 1 160px', marginBottom: 0 }}>
                <label className="input-label" style={{ color: '#cbd5e1', fontSize: '0.88rem', fontWeight: 600 }}>City *</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleAddressChange} 
                  placeholder="e.g. Bangalore"
                  className={`input-field ${addressFieldErrors.city ? 'input-error' : ''}`}
                  style={{ background: '#1f2937', color: '#f8fafc', border: addressFieldErrors.city ? '1px solid #ef4444' : '1px solid #374151' }} 
                  required 
                />
                {addressFieldErrors.city && <span className="field-error-text">{addressFieldErrors.city}</span>}
              </div>
              <div className="input-group" style={{ flex: '1 1 160px', marginBottom: 0 }}>
                <label className="input-label" style={{ color: '#cbd5e1', fontSize: '0.88rem', fontWeight: 600 }}>State *</label>
                <input 
                  type="text" 
                  name="state" 
                  value={formData.state} 
                  onChange={handleAddressChange} 
                  placeholder="e.g. Karnataka"
                  className={`input-field ${addressFieldErrors.state ? 'input-error' : ''}`}
                  style={{ background: '#1f2937', color: '#f8fafc', border: addressFieldErrors.state ? '1px solid #ef4444' : '1px solid #374151' }} 
                  required 
                />
                {addressFieldErrors.state && <span className="field-error-text">{addressFieldErrors.state}</span>}
              </div>
              <div className="input-group" style={{ flex: '1 1 140px', marginBottom: 0 }}>
                <label className="input-label" style={{ color: '#cbd5e1', fontSize: '0.88rem', fontWeight: 600 }}>Pincode *</label>
                <input 
                  type="text" 
                  name="pincode" 
                  value={formData.pincode} 
                  onChange={handleAddressChange} 
                  placeholder="e.g. 560001" 
                  className={`input-field ${addressFieldErrors.pincode ? 'input-error' : ''}`}
                  style={{ background: '#1f2937', color: '#f8fafc', border: addressFieldErrors.pincode ? '1px solid #ef4444' : '1px solid #374151' }} 
                  required 
                />
                {addressFieldErrors.pincode && <span className="field-error-text">{addressFieldErrors.pincode}</span>}
              </div>
            </div>
          </div>

          {/* 2. Payment Options */}
          <div style={{ background: '#111827', borderRadius: '14px', border: '1px solid #1f2937', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.2rem', color: '#f8fafc', fontWeight: 800, margin: 0 }}>
                <ShieldCheck size={22} color="#818cf8" />
                2. Select Payment Method
              </h2>
              <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 600 }}>
                Razorpay Test Mode Active
              </span>
            </div>
            
            {/* Payment Method Selector Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
              
              {/* Card Option */}
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('CARD')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.9rem 0.5rem',
                  borderRadius: '10px',
                  border: selectedPaymentMethod === 'CARD' ? '2px solid #6366f1' : '1px solid #374151',
                  background: selectedPaymentMethod === 'CARD' ? 'rgba(99, 102, 241, 0.12)' : '#1f2937',
                  color: selectedPaymentMethod === 'CARD' ? '#f8fafc' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <CreditCard size={22} color={selectedPaymentMethod === 'CARD' ? '#818cf8' : '#94a3b8'} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Card</span>
              </button>

              {/* UPI Option */}
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('UPI')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.9rem 0.5rem',
                  borderRadius: '10px',
                  border: selectedPaymentMethod === 'UPI' ? '2px solid #6366f1' : '1px solid #374151',
                  background: selectedPaymentMethod === 'UPI' ? 'rgba(99, 102, 241, 0.12)' : '#1f2937',
                  color: selectedPaymentMethod === 'UPI' ? '#f8fafc' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Smartphone size={22} color={selectedPaymentMethod === 'UPI' ? '#818cf8' : '#94a3b8'} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>UPI</span>
              </button>

              {/* NetBanking Option */}
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('NETBANKING')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.9rem 0.5rem',
                  borderRadius: '10px',
                  border: selectedPaymentMethod === 'NETBANKING' ? '2px solid #6366f1' : '1px solid #374151',
                  background: selectedPaymentMethod === 'NETBANKING' ? 'rgba(99, 102, 241, 0.12)' : '#1f2937',
                  color: selectedPaymentMethod === 'NETBANKING' ? '#f8fafc' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Building2 size={22} color={selectedPaymentMethod === 'NETBANKING' ? '#818cf8' : '#94a3b8'} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>NetBanking</span>
              </button>

              {/* Cash on Delivery Option */}
              <button
                type="button"
                onClick={() => setSelectedPaymentMethod('COD')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.9rem 0.5rem',
                  borderRadius: '10px',
                  border: selectedPaymentMethod === 'COD' ? '2px solid #6366f1' : '1px solid #374151',
                  background: selectedPaymentMethod === 'COD' ? 'rgba(99, 102, 241, 0.12)' : '#1f2937',
                  color: selectedPaymentMethod === 'COD' ? '#f8fafc' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Banknote size={22} color={selectedPaymentMethod === 'COD' ? '#818cf8' : '#94a3b8'} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>COD</span>
              </button>
            </div>

            {/* TAB CONTENT: Credit / Debit Card */}
            {selectedPaymentMethod === 'CARD' && (
              <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
                {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem' }}>Card Details (Test Mode)</span>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', padding: '2px 6px', background: detectedCard.bg, color: detectedCard.color, borderRadius: '4px', fontWeight: 800 }}>
                      {detectedCard.label}
                    </span>
                    <span style={{ fontSize: '0.72rem', padding: '2px 6px', background: '#334155', color: '#94a3b8', borderRadius: '4px' }}>Visa / MC / RuPay</span>
                  </div>
                </div> */}

                {/* <div className="input-group" style={{ marginBottom: '0.9rem' }}>
                  <label className="input-label" style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>Card Number</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      value={cardData.cardNumber} 
                      onChange={handleCardNumberChange} 
                      placeholder="4111 2222 3333 4444" 
                      className="input-field" 
                      style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #475569', letterSpacing: '0.05em' }} 
                    />
                    <CreditCard size={18} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div> */}

                {/* <div style={{ display: 'flex', gap: '0.9rem', marginBottom: '0.9rem' }}>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label" style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>Valid Thru (MM/YY)</label>
                    <input 
                      type="text" 
                      value={cardData.expiryDate} 
                      onChange={handleExpiryChange} 
                      placeholder="12/28" 
                      className="input-field" 
                      style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #475569' }} 
                    />
                  </div>
                  <div className="input-group" style={{ flex: 1 }}>
                    <label className="input-label" style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>CVV</label>
                    <input 
                      type="password" 
                      value={cardData.cvv} 
                      onChange={handleCvvChange} 
                      placeholder="•••" 
                      maxLength={4}
                      className="input-field" 
                      style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #475569', letterSpacing: '0.2em' }} 
                    />
                  </div>
                </div> */}

                <div className="input-group" style={{ marginBottom: '0.5rem' }}>
                  <label className="input-label" style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>Name on Card</label>
                  <input 
                    type="text" 
                    value={cardData.cardHolder} 
                    onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value })} 
                    placeholder="John Doe" 
                    className="input-field" 
                    style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #475569' }} 
                  />
                </div>

                <div style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.75rem' }}>
                  <HelpCircle size={14} color="#818cf8" />
                  <span>Razorpay Test Mode: Enter any test card or proceed to the official modal.</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: UPI Payment */}
            {selectedPaymentMethod === 'UPI' && (
              <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
                <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem', display: 'block', marginBottom: '0.75rem' }}>
                  UPI Test Flow
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                  {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setUpiData({ ...upiData, upiApp: app })}
                      style={{
                        padding: '0.6rem 0.4rem',
                        background: upiData.upiApp === app ? '#3730a3' : '#0f172a',
                        border: upiData.upiApp === app ? '1px solid #818cf8' : '1px solid #334155',
                        borderRadius: '6px',
                        color: '#f8fafc',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {app}
                    </button>
                  ))}
                </div>

                <div className="input-group" style={{ marginBottom: '0.5rem' }}>
                  <label className="input-label" style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>UPI ID (VPA)</label>
                  <input 
                    type="text" 
                    value={upiData.vpaId} 
                    onChange={(e) => setUpiData({ ...upiData, vpaId: e.target.value })} 
                    className="input-field" 
                    style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #475569' }} 
                  />
                </div>
                <p style={{ fontSize: '0.76rem', color: '#34d399', margin: '0.5rem 0 0' }}>
                  Tip: <code style={{ background: '#0f172a', padding: '2px 5px', borderRadius: '4px' }}>success@razorpay</code> guarantees auto-approval in Razorpay Sandbox.
                </p>
              </div>
            )}

            {/* TAB CONTENT: NetBanking */}
            {selectedPaymentMethod === 'NETBANKING' && (
              <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
                <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem', display: 'block', marginBottom: '0.75rem' }}>
                  Select Bank (NetBanking)
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
                  {POPULAR_BANKS.map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBank(bank.id)}
                      style={{
                        padding: '0.65rem 0.5rem',
                        background: selectedBank === bank.id ? '#3730a3' : '#0f172a',
                        border: selectedBank === bank.id ? '1px solid #818cf8' : '1px solid #334155',
                        borderRadius: '6px',
                        color: '#f8fafc',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: 0 }}>
                  You will be securely redirected to {POPULAR_BANKS.find(b => b.id === selectedBank)?.name} portal for authorization.
                </p>
              </div>
            )}

            {/* TAB CONTENT: Cash on Delivery */}
            {selectedPaymentMethod === 'COD' && (
              <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '10px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                  <Banknote size={20} color="#34d399" />
                  <span>Cash on Delivery</span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                  Pay with exact cash or digital UPI upon receiving package at your doorstep. No prepayment required.
                </p>
              </div>
            )}

          </div>

          {/* 3. Order Items Mini List */}
          <div style={{ background: '#111827', borderRadius: '14px', border: '1px solid #1f2937', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: 800, marginBottom: '1rem', marginTop: 0 }}>
              Order Items ({cart.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {cart.map(({ product, quantity }) => (
                <div key={product.id} style={{ display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
                  <img src={product.imageUrl} alt={product.title} style={{ width: '46px', height: '46px', objectFit: 'cover', borderRadius: '6px', background: '#fff' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>{product.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Qty: {quantity}</div>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                    ₹{formatPrice((product.discountPrice || product.price) * quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Checkout Button */}
        <div className="cart-checkout-sidebar" style={{ 
          width: '100%', 
          maxWidth: '380px', 
          background: '#111827', 
          borderRadius: '14px', 
          border: '1px solid #1f2937',
          padding: '1.75rem',
          position: 'sticky',
          top: '90px',
          boxShadow: '0 4px 25px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ fontSize: '1.2rem', color: '#f8fafc', fontWeight: 800, marginBottom: '1.25rem', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tag size={20} color="#818cf8" />
            Payment Summary
          </h2>

          {/* Coupon Code Section */}
          <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '10px', border: '1px solid #334155', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={14} color="#fbbf24" /> Apply Promo Coupon
              </span>
            </div>

            {!appliedCoupon ? (
              <div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="e.g. SAVE20, WELCOME50"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      setCouponError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyCoupon();
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.75rem',
                      background: '#0f172a',
                      border: couponError ? '1px solid #ef4444' : '1px solid #334155',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      letterSpacing: '0.5px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    disabled={couponLoading || !couponInput.trim()}
                    style={{
                      padding: '0.6rem 1rem',
                      background: '#4f46e5',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: (couponLoading || !couponInput.trim()) ? 'not-allowed' : 'pointer',
                      opacity: (couponLoading || !couponInput.trim()) ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    {couponLoading ? <RefreshCw size={14} className="spin-icon" /> : 'Apply'}
                  </button>
                </div>

                {couponError && (
                  <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertTriangle size={13} /> {couponError}
                  </div>
                )}

                {/* Available Quick Offers */}
                {activeOffers.length > 0 && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Available Offers:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {activeOffers.slice(0, 3).map(offer => (
                        <button
                          key={offer.id}
                          type="button"
                          onClick={() => handleApplyCoupon(offer.code)}
                          style={{
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px dashed #818cf8',
                            borderRadius: '4px',
                            padding: '3px 8px',
                            color: '#c7d2fe',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          title={offer.description}
                        >
                          🏷️ {offer.code} ({offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '6px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={16} color="#10b981" />
                    <div>
                      <span style={{ fontWeight: 800, color: '#34d399', fontSize: '0.9rem' }}>{appliedCoupon.couponCode}</span>
                      <div style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>{appliedCoupon.message}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#f87171',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}
                  >
                    <X size={13} /> Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', borderBottom: '1px solid #1f2937', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '0.92rem' }}>
              <span>Cart Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
              <span style={{ fontWeight: 600, color: '#f8fafc' }}>₹{formatPrice(originalTotal)}</span>
            </div>
            
            {catalogDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.92rem' }}>
                <span>Store Product Discounts</span>
                <span>- ₹{formatPrice(catalogDiscount)}</span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399', fontSize: '0.92rem', fontWeight: 700 }}>
                <span>Coupon ({appliedCoupon?.couponCode})</span>
                <span>- ₹{formatPrice(couponDiscount)}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '0.92rem' }}>
              <span>Delivery Charges</span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>FREE</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: 700 }}>Total Payable</span>
            <span style={{ fontSize: '1.65rem', color: '#818cf8', fontWeight: 800 }}>₹{formatPrice(finalTotal)}</span>
          </div>

          {totalDiscount > 0 && (
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.6rem', borderRadius: '8px', color: '#34d399', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
              🎉 You save ₹{formatPrice(totalDiscount)} on this order!
            </div>
          )}

          {/* Pay Button */}
          <button 
            type="button"
            onClick={handlePaymentSubmit}
            disabled={loading || paymentState !== 'IDLE'}
            style={{ 
              width: '100%', 
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', 
              color: '#ffffff',
              border: 'none',
              padding: '1.1rem',
              borderRadius: '10px',
              fontSize: '1.05rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: (loading || paymentState !== 'IDLE') ? 'not-allowed' : 'pointer',
              opacity: (loading || paymentState !== 'IDLE') ? 0.7 : 1,
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            {loading ? <RefreshCw size={19} className="spin-icon" /> : <Lock size={19} />}
            {selectedPaymentMethod === 'COD' ? 'Place Order (Cash on Delivery)' : 'Pay Securely'}
          </button>

          {/* Security Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.75rem', fontWeight: 600 }}>
              <ShieldCheck size={16} /> 256-Bit SSL Encrypted Checkout
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center' }}>
              Powered by Razorpay Payment Gateway (Test Mode)
            </div>
          </div>

        </div>

      </div>

      {/* Razorpay-Style Payment Processing Modal */}
      <PaymentProcessingModal 
        paymentState={paymentState}
        paymentDetails={paymentDetails}
        onRetry={handleRetryPayment}
        onClose={handleCloseModal}
      />

      {/* Cash on Delivery Success Popup */}
      {showSuccessPopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#111827', border: '1px solid #1f2937', borderRadius: '14px',
            padding: '2.5rem', textAlign: 'center', maxWidth: '420px', width: '90%',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)', animation: 'popIn 0.3s ease-out'
          }}>
            <div style={{ width: '64px', height: '64px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Check size={34} color="#fff" />
            </div>
            <h2 style={{ color: '#f8fafc', fontSize: '1.45rem', fontWeight: 800, marginBottom: '0.5rem' }}>Order Confirmed!</h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>{successMessage}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.82rem' }}>
              <RefreshCw size={14} className="spin-icon" color="#818cf8" />
              <span>Redirecting to your orders...</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CheckOut;
