import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addressApi } from '../api/addressApi'
import { orderApi } from '../api/orderApi'
import { couponApi } from '../api/couponApi'
import { clearCartState } from '../features/cart/cartSlice'
import { loadRazorpayScript } from '../utils/loadRazorpayScript'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

export default function CheckoutPage() {
  const cart = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')

  const [couponCode, setCouponCode] = useState('')
  const [couponStatus, setCouponStatus] = useState('') // '', 'checking', 'applied', 'invalid'
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')

  useEffect(() => {
    addressApi.list().then(({ data }) => {
      setAddresses(data.data)
      const def = data.data.find((a) => a.default) || data.data[0]
      if (def) setSelectedAddressId(def.id)
    }).finally(() => setLoading(false))
  }, [])

  const total = Math.max(0, Number(cart.subtotal) - Number(couponDiscount))

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponStatus('checking')
    setCouponError('')
    try {
      const { data } = await couponApi.validate(couponCode.trim(), cart.subtotal)
      setCouponDiscount(data.data.discountAmount)
      setCouponStatus('applied')
    } catch (err) {
      setCouponStatus('invalid')
      setCouponDiscount(0)
      setCouponError(err.response?.data?.message || 'Invalid or expired coupon code')
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setCouponStatus('')
    setCouponDiscount(0)
    setCouponError('')
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please select or add a shipping address first')
      return
    }
    setError('')
    setPlacing(true)

    try {
      // Step 1: create the order server-side. This reserves stock, applies
      // the coupon (if any), and opens a Razorpay order in test mode.
      const checkoutPayload = { shippingAddressId: selectedAddressId }
      if (couponStatus === 'applied') {
        checkoutPayload.couponCode = couponCode.trim()
      }
      const { data: orderData } = await orderApi.checkout(checkoutPayload)
      const order = orderData.data

      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        setError('Could not load the payment widget. Please check your connection and try again.')
        setPlacing(false)
        return
      }

      // Step 2: open Razorpay Checkout using the order id the backend created.
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(Number(order.totalAmount) * 100),
        currency: 'INR',
        name: 'ShopStack',
        description: `Order ${order.orderNumber}`,
        order_id: order.razorpayOrderId,
        prefill: {
          name: user?.fullName,
          email: user?.email,
        },
        theme: { color: '#4f46e5' },
        handler: async (response) => {
          // Step 3: send the payment result back to the server for signature
          // verification. The order is only confirmed once the backend
          // verifies it — the client's word alone is never trusted.
          try {
            await orderApi.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            dispatch(clearCartState())
            navigate(`/orders/${order.id}`)
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed. Please contact support if you were charged.')
          } finally {
            setPlacing(false)
          }
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your order. Please try again.')
      setPlacing(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-3xl mx-auto mt-8 px-2">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <ErrorBanner message={error} />

      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <h2 className="font-semibold mb-3">Shipping address</h2>
        {addresses.length === 0 ? (
          <p className="text-sm text-gray-500">
            You don't have any saved addresses yet. <a href="/profile" className="text-brand-600">Add one in your profile</a> before checking out.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {addresses.map((a) => (
              <label key={a.id} className="flex items-start gap-3 border border-gray-200 rounded-md p-3 cursor-pointer">
                <input type="radio" name="address" checked={selectedAddressId === a.id}
                  onChange={() => setSelectedAddressId(a.id)} className="mt-1" />
                <div className="text-sm">
                  <p className="font-medium">{a.label}</p>
                  <p className="text-gray-500">{a.addressLine1}, {a.addressLine2 && `${a.addressLine2}, `}{a.city}, {a.state} {a.postalCode}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <h2 className="font-semibold mb-3">Have a coupon?</h2>
        {couponStatus === 'applied' ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2 text-sm">
            <span className="text-green-700 font-medium">"{couponCode.toUpperCase()}" applied — you saved ₹{couponDiscount}</span>
            <button onClick={handleRemoveCoupon} className="text-green-700 underline">Remove</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm uppercase" />
            <button onClick={handleApplyCoupon} disabled={couponStatus === 'checking' || !couponCode.trim()}
              className="bg-gray-800 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-900 disabled:opacity-50">
              {couponStatus === 'checking' ? 'Checking...' : 'Apply'}
            </button>
          </div>
        )}
        {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
        <h2 className="font-semibold mb-3">Order summary</h2>
        <div className="flex flex-col gap-2 text-sm">
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.productName} × {item.quantity}</span>
              <span>₹{item.lineTotal}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1 border-t border-gray-100 pt-3 mt-3 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{cart.subtotal}</span></div>
          {couponDiscount > 0 && (
            <div className="flex justify-between text-green-600"><span>Coupon discount</span><span>−₹{couponDiscount}</span></div>
          )}
          <div className="flex justify-between font-semibold text-base border-t border-gray-100 pt-2 mt-1">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>
      </div>

      <button onClick={handlePlaceOrder} disabled={placing || cart.items.length === 0 || !selectedAddressId}
        className="w-full bg-brand-600 text-white rounded-md py-3 font-medium hover:bg-brand-700 disabled:opacity-50">
        {placing ? 'Processing...' : `Pay ₹${total} with Razorpay`}
      </button>
      <p className="text-xs text-gray-400 text-center mt-3">
        Test mode — use Razorpay's test card 4111 1111 1111 1111, any future expiry, any CVV.
      </p>
    </div>
  )
}
