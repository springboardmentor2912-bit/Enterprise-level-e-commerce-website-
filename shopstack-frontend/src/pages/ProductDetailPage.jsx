import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { getErrorMessage } from '../api/errorUtils';
import { setCartItems } from '../store/slices/cartSlice';
import { setWishlistItems } from '../store/slices/wishlistSlice';
import { Star, ShoppingCart, Heart, ArrowLeft, Tag, Store, ShieldCheck, CheckCircle2, MessageSquare, Send, AlertTriangle, RefreshCw } from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Review Form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [message, setMessage] = useState('');

  const fetchProductDetails = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const res = await axiosClient.get(`/products/${id}`);
      setProduct(res.data);
      if (res.data.images && res.data.images.length > 0) {
        setSelectedImage(res.data.images[0]);
      } else {
        setSelectedImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80');
      }

      const revRes = await axiosClient.get(`/products/${id}/reviews`);
      setReviews(revRes.data);
    } catch (err) {
      setFetchError(getErrorMessage(err, 'Failed to fetch product details.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    try {
      await axiosClient.post('/cart', { productId: product.id, quantity });
      const cartRes = await axiosClient.get('/cart');
      dispatch(setCartItems(cartRes.data));
      showMessage('Added to cart successfully!');
    } catch (err) {
      showMessage(getErrorMessage(err, 'Failed to add item to cart.'));
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    try {
      await axiosClient.post(`/wishlist/${product.id}`);
      const wishRes = await axiosClient.get('/wishlist');
      dispatch(setWishlistItems(wishRes.data));
      showMessage('Product saved to wishlist!');
    } catch (err) {
      showMessage(getErrorMessage(err, 'Failed to save to wishlist.'));
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    setReviewSubmitting(true);
    try {
      await axiosClient.post(`/products/${id}/reviews`, {
        rating: Number(newRating),
        comment: newComment,
      });

      setNewComment('');
      showMessage('Thank you! Review submitted successfully.');
      fetchProductDetails();
    } catch (err) {
      showMessage(getErrorMessage(err, 'Failed to submit product review.'));
    } finally {
      setReviewSubmitting(false);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-300">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !product) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center max-w-md space-y-4 shadow-xl">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">{fetchError || 'Product Not Found'}</h2>
          <p className="text-xs text-slate-400">The requested product could not be loaded or is no longer available.</p>
          <div className="flex gap-3 justify-center pt-2">
            <button onClick={fetchProductDetails} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
            <button onClick={() => navigate('/products')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs cursor-pointer">
              Return to Catalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation back button */}
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        {/* Message Banner */}
        {message && (
          <div className="flex items-center space-x-3 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 p-4 rounded-xl text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl">
          {/* Gallery Section */}
          <div className="space-y-4">
            <div className="h-80 sm:h-96 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
                }}
              />
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all ${
                      selectedImage === img ? 'border-indigo-500 scale-95' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold border border-indigo-500/20 flex items-center">
                  <Tag className="w-3 h-3 mr-1" /> {product?.category?.name || 'Category'}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{product.brand || 'Brand'}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{product.name}</h1>

              <div className="flex items-center space-x-4">
                <div className="flex items-center text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 mr-1" />
                  <span>{product.rating || '4.5'}</span>
                  <span className="text-slate-500 text-xs font-normal ml-1">({product.reviewCount || 0} reviews)</span>
                </div>

                <div className="flex items-center text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> In Stock ({product.stockQuantity} units)
                </div>
              </div>

              <div className="text-3xl font-black text-white">${Number(product.price).toFixed(2)}</div>

              <p className="text-sm text-slate-300 leading-relaxed border-t border-b border-slate-800/80 py-4">
                {product.description || 'High-performance multi-vendor e-commerce item verified by ShopStack.'}
              </p>

              {/* Vendor Info Card */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Sold & Shipped By</div>
                    <div className="text-sm font-bold text-white">{product?.vendor?.businessName || 'Verified Vendor'}</div>
                  </div>
                </div>
                <span className="text-[11px] text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                  Verified Merchant
                </span>
              </div>
            </div>

            {/* Actions: Quantity + Add to Cart & Wishlist */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center space-x-4">
                <label className="text-xs font-medium text-slate-300 uppercase">Quantity:</label>
                <div className="flex items-center border border-slate-800 rounded-xl bg-slate-950">
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/auth');
                        return;
                      }
                      setQuantity((q) => Math.max(1, q - 1));
                    }}
                    className="px-3 py-1.5 text-slate-400 hover:text-white font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/auth');
                        return;
                      }
                      setQuantity((q) => Math.min(product.stockQuantity, q + 1));
                    }}
                    className="px-3 py-1.5 text-slate-400 hover:text-white font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity <= 0}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleAddToWishlist}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-xl border border-slate-700 transition-all cursor-pointer"
                  title="Save to Wishlist"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-indigo-400" /> Customer Reviews ({reviews.length})
          </h2>

          {/* Submit Review Form */}
          <form onSubmit={handleReviewSubmit} className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Write a Review</h3>

            <div className="flex items-center space-x-3">
              <label className="text-xs text-slate-400">Rating:</label>
              <select
                value={newRating}
                onChange={(e) => setNewRating(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-amber-400 font-bold px-3 py-1.5 rounded-xl text-xs"
              >
                <option value="5">5 ★★★★★ (Excellent)</option>
                <option value="4">4 ★★★★☆ (Good)</option>
                <option value="3">3 ★★★☆☆ (Average)</option>
                <option value="2">2 ★★☆☆☆ (Fair)</option>
                <option value="1">1 ★☆☆☆☆ (Poor)</option>
              </select>
            </div>

            <textarea
              rows="3"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your feedback regarding product quality and vendor delivery..."
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            ></textarea>

            <button
              type="submit"
              disabled={reviewSubmitting}
              className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{reviewSubmitting ? 'Submitting...' : 'Post Review'}</span>
            </button>
          </form>

          {/* Review List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No reviews yet for this product. Be the first to post a review!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{rev.customerName}</span>
                    <div className="flex items-center text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                      <span>{rev.rating}/5</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                  <div className="text-[10px] text-slate-500">{new Date(rev.createdAt).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
