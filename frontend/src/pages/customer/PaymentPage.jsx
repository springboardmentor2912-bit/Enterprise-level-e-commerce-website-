import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCart } from "../../api/customerApi";
import { verifyPayment } from "../../api/paymentApi";

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addressId, razorpayOrder, couponCode, discountAmount } = location.state || {};

  const [cart, setCart] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!addressId || !razorpayOrder) {
      navigate("/checkout");
      return;
    }
    loadCart();
  }, [addressId, razorpayOrder]);

  async function loadCart() {
    try {
      const res = await getCart();
      setCart(res.data);
    } catch (e) {
      navigate("/checkout");
    }
  }

  const discount = Number(discountAmount || 0);
  const payable = cart ? Number(cart.totalAmount) - discount : 0;

  async function handlePayNow() {
    if (!window.Razorpay) {
      alert("Razorpay not loaded");
      return;
    }

    setProcessing(true);
    try {
      const options = {
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amountInPaise,
        currency: "INR",
        name: "ShopStack Enterprise",
        description: "Secure Transaction",
        order_id: razorpayOrder.razorpayOrderId,

        handler: async function (response) {
          try {
            await verifyPayment(
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              addressId,
              couponCode
            );

            alert("🎉 Payment Successful! Order placed.");
            window.dispatchEvent(new Event("cart-updated"));
            navigate("/orders");
          } catch (err) {
            alert("❌ Verification Failed");
          }
        },

        prefill: {
          name: "Customer",
          email: "customer@example.com",
        },
        theme: {
          color: "#065f46",
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      alert("Payment failed");
      setProcessing(false);
    }
  }

  if (!cart) return <div className="p-10 text-center bg-white">Loading...</div>;

  return (
    // 🆕 Changed to bg-white
    <div className="min-h-screen bg-white flex items-center justify-center p-5 font-['Manrope',sans-serif]">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            Secure Checkout
          </p>
          <h1 className="mt-2 font-['Fraunces',serif] text-3xl font-semibold text-stone-900">
            Review & Pay
          </h1>
        </div>

        <div className="space-y-4 border-b border-stone-200 pb-6 mb-6">
          <div className="flex justify-between text-[15px] text-stone-600">
            <span>Items ({cart.totalItems})</span>
            <span className="font-semibold text-stone-900">₹{cart.totalAmount}</span>
          </div>

          <div className="flex justify-between text-[15px] text-stone-600">
            <span>Shipping</span>
            <span className="font-semibold text-emerald-700">Free</span>
          </div>

          {couponCode && (
            <div className="flex justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[14px]">
              <span className="font-semibold text-emerald-800">🎟️ Coupon: {couponCode.toUpperCase()}</span>
              <span className="font-semibold text-emerald-700">−₹{discount}</span>
            </div>
          )}

          <div className="flex items-baseline justify-between pt-2">
            <span className="text-[16px] font-semibold text-stone-700">Total Payable</span>
            <span className="font-['Fraunces',serif] text-4xl font-bold text-stone-900">
              ₹{payable}
            </span>
          </div>
        </div>

        <button
          onClick={handlePayNow}
          disabled={processing}
          className="w-full rounded-xl bg-emerald-800 py-4 text-[16px] font-semibold text-white shadow-lg shadow-emerald-800/25 transition-all hover:bg-emerald-900 active:scale-[0.99] disabled:bg-stone-300"
        >
          {processing ? "Opening Razorpay..." : `Pay ₹${payable} Now`}
        </button>

        <p className="mt-4 text-center text-[11px] text-stone-400">
          Powered by Razorpay • 256-bit SSL Encrypted
        </p>
      </div>
    </div>
  );
}