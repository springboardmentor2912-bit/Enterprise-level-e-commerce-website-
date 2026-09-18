import React, { useState, useEffect } from 'react';
import { X, Star, Store, ShieldCheck, ShoppingCart, MessageSquare, Plus, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { productApi } from '../api';
import { useCart } from '../context/CartContext';

const ProductDetailModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = product?.stockQuantity <= 0 || product?.status === 'OUT_OF_STOCK';
  const maxStock = product?.stockQuantity || 0;

  useEffect(() => {
    if (product?.id) {
      productApi.getReviews(product.id)
        .then((res) => setReviews(res.data))
        .catch(() => setReviews([]))
        .finally(() => setLoadingReviews(false));
    }
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const success = addToCart(product, quantity);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <span className="badge badge-vendor" style={{ marginBottom: '0.4rem' }}>{product.category?.name}</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{product.title}</h2>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.5rem', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
          
          {/* Left Column: Image */}
          <div>
            <div style={{ width: '100%', height: '260px', maxHeight: '320px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#0f172a', border: '1px solid var(--border-color)', position: 'relative' }}>
              <img
                src={product.imageUrl}
                alt={product.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isOutOfStock ? 'grayscale(40%)' : 'none' }}
              />

              {isOutOfStock && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="badge badge-danger" style={{ background: '#ef4444', color: '#fff', fontSize: '1rem', padding: '0.5rem 1.25rem', fontWeight: 800 }}>
                    OUT OF STOCK
                  </span>
                </div>
              )}
            </div>

            {/* Vendor Info Box */}
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Fulfilled & Shipped by Merchant</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Store size={18} color="var(--primary)" />
                <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.98rem' }}>{product.vendorProfile?.storeName}</span>
                <ShieldCheck size={16} color="#34d399" title="Verified Marketplace Vendor" />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.3rem' }}>
                {product.vendorProfile?.description}
              </p>
            </div>
          </div>

          {/* Right Column: Pricing & Specs */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
                  ₹{(product.discountPrice || product.price).toFixed(2)}
                </span>
                {product.discountPrice && (
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-subtle)', textDecoration: 'line-through' }}>
                    ₹{product.price.toFixed(2)}
                  </span>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', marginTop: '0.3rem', fontSize: '0.9rem', fontWeight: 700 }}>
                <Star size={16} fill="#fbbf24" />
                {product.rating} ({product.reviewCount} customer reviews)
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                {product.description}
              </p>
            </div>

            {/* Stock & SKU Stats Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 700 }}>STOCK AVAILABILITY</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isOutOfStock ? '#ef4444' : maxStock < 10 ? '#fbbf24' : '#34d399', marginTop: '0.2rem' }}>
                  {isOutOfStock ? 'Out of Stock' : maxStock < 10 ? `Low Stock (${maxStock} left)` : `${maxStock} Units Available`}
                </div>
              </div>

              <div style={{ padding: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 700 }}>SKU CODE</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {product.sku || 'N/A'}
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-muted)' }}>Quantity:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '4px 10px' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: quantity <= 1 ? 0.3 : 1 }}
                  >
                    <Minus size={16} />
                  </button>

                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', minWidth: '24px', textAlign: 'center' }}>
                    {quantity}
                  </span>

                  <button
                    onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                    disabled={quantity >= maxStock}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: quantity >= maxStock ? 0.3 : 1 }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Max limit: {maxStock}</span>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`btn ${isOutOfStock ? 'btn-danger' : 'btn-primary'}`}
              style={{ marginTop: 'auto', width: '100%', padding: '0.88rem', fontSize: '0.98rem', opacity: isOutOfStock ? 0.7 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
            >
              <ShoppingCart size={18} />
              {isOutOfStock ? 'Currently Out of Stock' : `Add ${quantity} to Cart (₹${((product.discountPrice || product.price) * quantity).toFixed(2)})`}
            </button>

          </div>

        </div>

        {/* Customer Reviews Section */}
        <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={18} color="var(--primary)" />
            Customer Ratings & Reviews ({reviews.length})
          </h3>

          {loadingReviews ? (
            <div style={{ color: 'var(--text-subtle)', fontSize: '0.85rem' }}>Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div style={{ color: 'var(--text-subtle)', fontSize: '0.88rem', fontStyle: 'italic' }}>No reviews posted yet for this product.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {reviews.map((r) => (
                <div key={r.id} style={{ padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>{r.user?.fullName}</span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} size={13} fill="#fbbf24" color="#fbbf24" />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductDetailModal;
