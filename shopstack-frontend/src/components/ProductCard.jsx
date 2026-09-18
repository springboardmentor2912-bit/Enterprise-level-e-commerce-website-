import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Star, ShoppingCart, Heart, Tag, Store, PackageX, Zap } from 'lucide-react';

const ProductCard = ({ product, onAddToCart, onAddToWishlist, isWishlisted }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const primaryImage = product?.images && product.images.length > 0 && product.images[0]
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

  const isOutOfStock = !product || product.stockQuantity === undefined || product.stockQuantity <= 0;

  const originalPrice = Number(product?.price || 0);
  const discountPct = Number(product?.discountPercentage || 0);
  const finalPrice = Number(product?.finalPrice || product?.price || 0);
  const hasDiscount = discountPct > 0;
  const savedAmount = hasDiscount ? (originalPrice - finalPrice) : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-indigo-500/40 hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col group relative">
      {/* Image Preview Container */}
      <div
        className="relative h-52 bg-slate-950 overflow-hidden cursor-pointer"
        onClick={() => {
          navigate(`/products/${product.id}`);
        }}
      >
        <img
          src={primaryImage}
          alt={product?.name || 'Product'}
          loading="lazy"
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            isOutOfStock ? 'grayscale opacity-75' : ''
          }`}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Discount Badge */}
        {hasDiscount && !isOutOfStock && (
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            <span className="px-2 py-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-extrabold text-[11px] uppercase tracking-wide rounded-lg shadow-lg flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {discountPct.toFixed(0)}% OFF
            </span>
          </div>
        )}

        {/* Out of Stock Overlay Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1.5 bg-rose-600/90 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-lg border border-rose-400/40 flex items-center space-x-1">
              <PackageX className="w-3.5 h-3.5 mr-1" />
              Out of Stock
            </span>
          </div>
        )}

        {/* Category Badge — hidden when there's a discount badge */}
        {!hasDiscount && (
          <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-indigo-300 border border-slate-700/80 flex items-center">
            <Tag className="w-3 h-3 mr-1" />
            <span>{product?.category?.name || 'General'}</span>
          </div>
        )}

        {/* Wishlist Toggle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!isAuthenticated) {
              navigate('/auth');
              return;
            }
            onAddToWishlist && onAddToWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
            isWishlisted
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-rose-400'
          }`}
          title="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Brand + Rating row */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-indigo-400 uppercase tracking-wider text-[10px]">
              {product?.brand || 'ShopStack'}
            </span>
            <div className="flex items-center text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
              <span>{product?.rating ? Number(product.rating).toFixed(1) : '4.5'}</span>
              <span className="text-slate-500 font-normal ml-1">({product?.reviewCount || 0})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => {
              navigate(`/products/${product.id}`);
            }}
            className="text-sm font-bold text-white tracking-tight hover:text-indigo-400 transition-colors cursor-pointer line-clamp-2 leading-snug"
          >
            {product?.name}
          </h3>

          {/* Category + Stock row */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <div className="flex items-center">
              <Tag className="w-3 h-3 mr-1 text-indigo-400" />
              <span className="text-indigo-300">{product?.category?.name || 'General'}</span>
            </div>
            <span className={`font-semibold ${isOutOfStock ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isOutOfStock ? 'Out of Stock' : `Stock: ${product.stockQuantity}`}
            </span>
          </div>

          {/* Vendor name */}
          <div className="flex items-center text-[11px] text-slate-400">
            <Store className="w-3 h-3 mr-1 text-purple-400" />
            <span className="truncate max-w-[160px]">
              {product?.vendor?.businessName || 'Verified Vendor'}
            </span>
          </div>
        </div>

        {/* Footer: Price & Add to Cart */}
        <div className="pt-3 border-t border-slate-800 space-y-2.5">
          {/* Price section */}
          <div className="flex items-end justify-between">
            <div>
              {hasDiscount ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-extrabold text-emerald-400">
                      ₹{finalPrice.toFixed(2)}
                    </span>
                    <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded px-1">
                      {discountPct.toFixed(0)}% off
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-slate-500 line-through">₹{originalPrice.toFixed(2)}</span>
                    <span className="text-[11px] text-emerald-500 font-medium">Save ₹{savedAmount.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-[10px] uppercase text-slate-400 font-medium block">Price</span>
                  <span className="text-xl font-extrabold text-white">₹{finalPrice.toFixed(2)}</span>
                </>
              )}
            </div>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/auth');
                return;
              }
              onAddToCart && onAddToCart(product.id);
            }}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-75'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
