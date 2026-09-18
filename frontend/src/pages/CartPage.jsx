import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Box, AlertCircle } from 'lucide-react';

const formatPrice = (val) => {
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const [stockError, setStockError] = useState('');
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    // Check if any cart item has insufficient stock
    const outOfStockItem = cart.find(i => (i.product.stockQuantity || 0) < i.quantity);
    if (outOfStockItem) {
      setStockError(`Item "${outOfStockItem.product.title}" exceeds available warehouse stock (${outOfStockItem.product.stockQuantity} available). Please adjust quantity.`);
      return;
    }

    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout');
  };

  const calculateTotals = () => {
    let originalTotal = 0;
    let finalTotal = 0;

    cart.forEach(item => {
      const p = item.product;
      const price = p.discountPrice || p.price || 0;
      const original = p.price || price; 
      
      finalTotal += price * item.quantity;
      originalTotal += original * item.quantity;
    });

    const totalDiscount = originalTotal - finalTotal;
    return { originalTotal, finalTotal, totalDiscount };
  };

  const { originalTotal, finalTotal, totalDiscount } = calculateTotals();

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <ShoppingCart size={64} color="#334155" style={{ marginBottom: '1.5rem' }} />
        <h2 style={{ fontSize: '1.8rem', color: '#f8fafc', marginBottom: '1rem', fontWeight: 800 }}>Your cart is empty</h2>
        <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1200px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.8rem', color: '#f8fafc', fontWeight: 800, margin: 0 }}>
            <ShoppingCart size={28} color="#818cf8" />
            Shopping Cart
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>Review items before checkout</p>
        </div>
        <Link to="/" style={{ color: '#818cf8', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Box size={16} /> Continue Shopping
        </Link>
      </div>

      {stockError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.85rem 1.25rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{stockError}</span>
        </div>
      )}

      {/* Main Grid: Item List & Order Summary */}
      <div className="cart-checkout-layout" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Cart Item Cards */}
        <div style={{ flex: '1 1 540px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cart.map(({ product, quantity }) => {
            const currentPrice = product.discountPrice || product.price || 0;
            const originalPrice = product.price || currentPrice;
            const hasDiscount = originalPrice > currentPrice;
            const isNearStockLimit = quantity >= (product.stockQuantity || 0);

            return (
              <div
                key={product.id}
                className="cart-item-row"
                style={{ 
                  display: 'flex', 
                  gap: '1.25rem', 
                  padding: '1.25rem', 
                  background: '#111827', 
                  borderRadius: '12px', 
                  border: '1px solid #1f2937',
                  alignItems: 'center',
                  width: '100%'
                }}
              >
                {/* Product Info Row (Thumbnail + Details) */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: '1 1 280px', minWidth: 0 }}>
                  {/* Thumbnail */}
                  <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                    <img src={product.imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', background: '#0f172a' }} />
                    {hasDiscount && (
                      <span style={{ position: 'absolute', top: '-6px', left: '-6px', background: '#ef4444', color: '#fff', fontSize: '0.62rem', fontWeight: 800, padding: '2px 5px', borderRadius: '4px' }}>
                        {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% OFF
                      </span>
                    )}
                  </div>
                  
                  {/* Product Title & Seller */}
                  <div style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.3 }}>{product.title}</h3>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      Seller: <strong style={{ color: '#cbd5e1' }}>{product.vendorProfile?.storeName || 'Verified Vendor'}</strong>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.15rem' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>₹{formatPrice(currentPrice)}</span>
                      {hasDiscount && (
                        <span style={{ fontSize: '0.82rem', color: '#64748b', textDecoration: 'line-through' }}>₹{formatPrice(originalPrice)}</span>
                      )}
                    </div>
                    {isNearStockLimit && (
                      <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 600 }}>Max stock limit ({product.stockQuantity} available)</span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls & Subtotal */}
                <div className="cart-item-controls-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
                  
                  {/* Quantity Counter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#030712', border: '1px solid #1f2937', borderRadius: '8px', padding: '4px 8px' }}>
                    <button
                      onClick={() => {
                        setStockError('');
                        updateQuantity(product.id, quantity - 1);
                      }}
                      disabled={quantity <= 1}
                      style={{ background: 'none', border: 'none', color: '#f8fafc', cursor: quantity <= 1 ? 'not-allowed' : 'pointer', opacity: quantity <= 1 ? 0.4 : 1, display: 'flex' }}
                    >
                      <Minus size={15} />
                    </button>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc', width: '22px', textAlign: 'center' }}>{quantity}</span>
                    <button
                      onClick={() => {
                        if (quantity >= (product.stockQuantity || 0)) {
                          setStockError(`Cannot add more. Only ${product.stockQuantity} units available.`);
                          return;
                        }
                        setStockError('');
                        updateQuantity(product.id, quantity + 1);
                      }}
                      disabled={quantity >= product.stockQuantity}
                      style={{ background: 'none', border: 'none', color: '#f8fafc', cursor: quantity >= product.stockQuantity ? 'not-allowed' : 'pointer', opacity: quantity >= product.stockQuantity ? 0.4 : 1, display: 'flex' }}
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Subtotal</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc' }}>₹{formatPrice(currentPrice * quantity)}</span>
                  </div>

                  {/* Delete Button */}
                  <button 
                    onClick={() => {
                      setStockError('');
                      removeFromCart(product.id);
                    }} 
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '50%', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>

                </div>

              </div>
            );
          })}
        </div>

        {/* Order Summary Sticky Panel */}
        <div className="cart-checkout-sidebar" style={{ 
          width: '100%', 
          maxWidth: '380px', 
          background: '#111827', 
          borderRadius: '14px', 
          border: '1px solid #1f2937',
          padding: '1.5rem',
          position: 'sticky',
          top: '85px',
          boxShadow: '0 4px 25px rgba(0,0,0,0.25)'
        }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem', color: '#f8fafc', fontWeight: 800, marginBottom: '1.25rem', marginTop: 0 }}>
            <Box size={20} color="#818cf8" />
            Order Summary
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', borderBottom: '1px solid #1f2937', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.88rem' }}>
              <span>Items ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
              <span>₹{formatPrice(originalTotal)}</span>
            </div>
            
            {totalDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontSize: '0.88rem', fontWeight: 600 }}>
                <span>Store Discounts</span>
                <span>- ₹{formatPrice(totalDiscount)}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.88rem' }}>
              <span>Express Delivery</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>FREE</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.05rem', color: '#f8fafc', fontWeight: 700 }}>Total</span>
            <span style={{ fontSize: '1.45rem', color: '#818cf8', fontWeight: 800 }}>₹{formatPrice(finalTotal)}</span>
          </div>

          {totalDiscount > 0 && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.65rem 0.85rem', borderRadius: '8px', color: '#10b981', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
              🎉 You save ₹{formatPrice(totalDiscount)} on this order!
            </div>
          )}

          {/* Promo Preview */}
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.08)', 
            border: '1px dashed rgba(99, 102, 241, 0.3)', 
            borderRadius: '8px', 
            padding: '0.75rem', 
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <span style={{ fontSize: '1.1rem' }}>🏷️</span>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c7d2fe' }}>Coupons Applicable</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Apply SAVE20 or WELCOME50 at checkout</div>
            </div>
          </div>

          <button 
            onClick={handleCheckoutClick}
            className="btn btn-primary btn-mobile-full"
            style={{ 
              padding: '0.85rem 1.25rem',
              fontSize: '0.98rem',
              fontWeight: 700,
              gap: '0.5rem',
              borderRadius: 'var(--radius-md)',
              width: '100%',
              justifyContent: 'center'
            }}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', color: '#10b981', fontSize: '0.74rem', fontWeight: 600 }}>
            <ShieldCheck size={14} /> Guaranteed Regional Warehouse Delivery
          </div>
        </div>

      </div>
    </div>
  );
};

export default CartPage;

