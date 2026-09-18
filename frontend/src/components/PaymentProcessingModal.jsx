import React from 'react';
import { ShieldCheck, Check, AlertTriangle, RefreshCw, ArrowLeft, Lock, CreditCard } from 'lucide-react';

const formatPrice = (val) => {
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const PaymentProcessingModal = ({ paymentState, paymentDetails, onRetry, onClose }) => {
  if (!paymentState || paymentState === 'IDLE') {
    return null;
  }

  const { amount = 0, paymentId = '', orderId = '', errorReason = '' } = paymentDetails || {};

  return (
    <div 
      className="rzp-overlay" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="payment-modal-title"
    >
      <div className="rzp-card">
        {/* Top Progress bar (active during PROCESSING) */}
        {paymentState === 'PROCESSING' && (
          <div className="rzp-progress-track">
            <div className="rzp-progress-bar" />
          </div>
        )}

        {/* ===================== PROCESSING STATE ===================== */}
        {paymentState === 'PROCESSING' && (
          <div>
            {/* Razorpay Animated Payment Graphic */}
            <div className="rzp-anim-container">
              <div className="rzp-pulse-ring-outer" />
              <div className="rzp-pulse-ring-inner" />
              <div className="rzp-orbit-spinner">
                <div className="rzp-orbit-dot" />
              </div>
              <div className="rzp-center-badge">
                <CreditCard size={26} strokeWidth={2.2} />
              </div>
            </div>

            <h3 
              id="payment-modal-title"
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '0.35rem',
                letterSpacing: '-0.01em',
              }}
            >
              Confirming Payment
            </h3>

            <p 
              style={{
                fontSize: '0.92rem',
                color: '#64748b',
                marginBottom: '1.25rem',
                lineHeight: 1.5,
              }}
            >
              This will only take a few seconds.
            </p>

            {/* Amount & Status Info */}
            <div 
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Amount Payable
                </span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.1rem' }}>
                  ₹{formatPrice(amount)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0c6cf2', fontSize: '0.82rem', fontWeight: 600 }}>
                <RefreshCw size={14} className="spin-icon" />
                <span>Verifying...</span>
              </div>
            </div>

            {/* Razorpay Trust Badge */}
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#475569',
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '0.4rem 0.85rem',
                background: '#f1f5f9',
                borderRadius: '9999px',
                border: '1px solid #e2e8f0',
              }}
            >
              <ShieldCheck size={15} color="#0c6cf2" />
              <span>Secured by <strong style={{ color: '#0c2340', fontWeight: 800 }}>Razorpay</strong></span>
            </div>
          </div>
        )}

        {/* ===================== SUCCESS STATE ===================== */}
        {paymentState === 'SUCCESS' && (
          <div>
            {/* Animated Checkmark */}
            <div className="rzp-success-badge">
              <Check size={40} strokeWidth={3} />
            </div>

            <h3 
              id="payment-modal-title"
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '0.35rem',
                letterSpacing: '-0.01em',
              }}
            >
              Payment Successful
            </h3>

            <p 
              style={{
                fontSize: '0.92rem',
                color: '#64748b',
                marginBottom: '1.25rem',
                lineHeight: 1.5,
              }}
            >
              Your payment has been verified successfully.
            </p>

            {/* Receipt Summary Card */}
            <div 
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.25rem',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Amount Paid</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>
                  ₹{formatPrice(amount)}
                </span>
              </div>

              {paymentId && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: orderId ? '0.6rem' : 0 }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Payment ID</span>
                  <span 
                    style={{
                      fontSize: '0.78rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: '#0f172a',
                      background: '#e2e8f0',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      maxWidth: '180px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={paymentId}
                  >
                    {paymentId}
                  </span>
                </div>
              )}

              {orderId && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Order Ref</span>
                  <span 
                    style={{
                      fontSize: '0.78rem',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: '#64748b',
                      maxWidth: '180px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={orderId}
                  >
                    {orderId}
                  </span>
                </div>
              )}
            </div>

            {/* Redirect Notice */}
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.82rem',
                color: '#64748b',
                marginBottom: '1rem',
              }}
            >
              <RefreshCw size={14} className="spin-icon" color="#10b981" />
              <span>Redirecting to My Orders in a few seconds...</span>
            </div>

            {/* Razorpay Trust Badge */}
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#475569',
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '0.35rem 0.85rem',
                background: '#f1f5f9',
                borderRadius: '9999px',
                border: '1px solid #e2e8f0',
              }}
            >
              <ShieldCheck size={15} color="#10b981" />
              <span>Secured by <strong style={{ color: '#0c2340', fontWeight: 800 }}>Razorpay</strong></span>
            </div>
          </div>
        )}

        {/* ===================== FAILED STATE ===================== */}
        {paymentState === 'FAILED' && (
          <div>
            {/* Animated Alert / Error Badge */}
            <div className="rzp-failed-badge">
              <AlertTriangle size={38} strokeWidth={2.5} />
            </div>

            <h3 
              id="payment-modal-title"
              style={{
                fontSize: '1.35rem',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '0.35rem',
                letterSpacing: '-0.01em',
              }}
            >
              Payment Failed
            </h3>

            <p 
              style={{
                fontSize: '0.92rem',
                color: '#64748b',
                marginBottom: '1.25rem',
                lineHeight: 1.5,
              }}
            >
              We couldn't complete your payment.
            </p>

            {/* Error Detail Box */}
            <div 
              style={{
                background: '#fff1f2',
                border: '1px solid #ffe4e6',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                marginBottom: '1.5rem',
                color: '#be123c',
                fontSize: '0.86rem',
                lineHeight: 1.45,
                textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Notice:</span>
              </div>
              <p style={{ margin: 0, color: '#9f1239' }}>
                {errorReason || 'Transaction was cancelled or verification could not be completed. No amount was charged to your account.'}
              </p>
            </div>

            {/* Actions: Try Again & Back to Checkout */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={onRetry}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0c6cf2 0%, #2563eb 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(12, 108, 242, 0.25)',
                  transition: 'transform 0.1s, box-shadow 0.2s',
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <RefreshCw size={17} />
                Try Again
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '0.8rem 1.25rem',
                  borderRadius: '10px',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#94a3b8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
              >
                <ArrowLeft size={16} />
                Back to Checkout
              </button>
            </div>

            {/* Razorpay Trust Badge */}
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#64748b',
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '0.35rem 0.85rem',
                background: '#f8fafc',
                borderRadius: '9999px',
                border: '1px solid #e2e8f0',
              }}
            >
              <Lock size={13} color="#64748b" />
              <span>Secured by <strong style={{ color: '#0c2340', fontWeight: 800 }}>Razorpay</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentProcessingModal;
