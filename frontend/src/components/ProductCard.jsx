import React from 'react';
import { Star, ShoppingCart, Store, Eye, Tag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, onSelect, rankBadge }) => {
  const { addToCart } = useCart();

  const isOutOfStock = product.stockQuantity <= 0 || product.status === 'OUT_OF_STOCK';
  const isLowStock = !isOutOfStock && product.stockQuantity < 10;

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
  };

  return (
    <div
      className="product-card"
      onClick={() => onSelect(product)}
      style={{
        cursor: 'pointer',
        position: 'relative',
        opacity: isOutOfStock ? 0.88 : 1,
        border: isOutOfStock ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-color)'
      }}
    >
      {/* Badges Overlay */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {isOutOfStock ? (
          <span className="badge badge-danger" style={{ background: '#ef4444', color: '#fff', fontWeight: 800, boxShadow: '0 2px 10px rgba(239,68,68,0.5)' }}>
            OUT OF STOCK
          </span>
        ) : isLowStock ? (
          <span className="badge badge-warning" style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 800 }}>
            ONLY {product.stockQuantity} LEFT
          </span>
        ) : rankBadge ? (
          <span className="badge badge-warning" style={{ background: '#f59e0b', color: '#0f172a', fontWeight: 800 }}>
            {rankBadge}
          </span>
        ) : product.featured ? (
          <span className="badge" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: '#fff' }}>
            FEATURED
          </span>
        ) : null}

        {hasDiscount && !isOutOfStock && (
          <span className="badge badge-admin" style={{ background: 'rgba(236, 72, 153, 0.9)', color: '#fff', fontWeight: 800 }}>
            <Tag size={11} /> {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Product Image Container */}
      <div className="product-img-wrapper">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'}
          alt={product.title}
          className="product-img"
          style={{ filter: isOutOfStock ? 'grayscale(40%)' : 'none' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
          }}
        />

        <div className="product-card-overlay">
          <button className="btn btn-primary btn-sm" style={{ boxShadow: 'var(--shadow-md)' }}>
            <Eye size={15} /> Quick View
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="product-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span className="product-vendor-tag" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Store size={12} color="#818cf8" />
            {product.vendorProfile?.storeName || 'Verified Merchant'}
          </span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#fbbf24', fontSize: '0.82rem', fontWeight: 700 }}>
            <Star size={13} fill="#fbbf24" color="#fbbf24" />
            {product.rating ? Number(product.rating).toFixed(1) : '5.0'}
            <span style={{ color: 'var(--text-subtle)', fontWeight: 500, fontSize: '0.75rem' }}>
              ({product.reviewCount || 12})
            </span>
          </div>
        </div>

        <h3 className="product-title">{product.title}</h3>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
          {product.description}
        </p>

        {/* Price & Action Row */}
        <div className="product-price-row">
          <div>
            <span className="price-current">₹{(product.discountPrice || product.price).toFixed(2)}</span>
            {hasDiscount && (
              <span className="price-original" style={{ marginLeft: '0.4rem' }}>₹{product.price.toFixed(2)}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`btn ${isOutOfStock ? 'btn-danger btn-sm' : 'btn-primary btn-sm'}`}
            style={{ marginLeft: 'auto', opacity: isOutOfStock ? 0.7 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
          >
            <ShoppingCart size={15} />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>

      </div>

    </div>
  );
};

export default ProductCard;
