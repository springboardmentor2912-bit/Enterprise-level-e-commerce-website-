import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { setWishlistItems, setWishlistLoading } from '../store/slices/wishlistSlice';
import { setCartItems } from '../store/slices/cartSlice';
import { Heart, Trash2, ShoppingCart, ShoppingBag, Store, AlertTriangle } from 'lucide-react';
import { getErrorMessage } from '../api/errorUtils';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: wishlistItems, loading } = useSelector((state) => state.wishlist);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchWishlist = async () => {
    dispatch(setWishlistLoading(true));
    setErrorMsg('');
    try {
      const res = await axiosClient.get('/wishlist');
      dispatch(setWishlistItems(res.data));
    } catch (err) {
      console.error('Failed to load wishlist', err);
      setErrorMsg(getErrorMessage(err, 'Failed to load wishlist. Please try refreshing.'));
    } finally {
      dispatch(setWishlistLoading(false));
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveWishlist = async (productId) => {
    try {
      await axiosClient.delete(`/wishlist/${productId}`);
      fetchWishlist();
    } catch (err) {
      showMessage(getErrorMessage(err, 'Failed to remove wishlist item. Please try again.'));
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await axiosClient.post('/cart', { productId, quantity: 1 });
      const cartRes = await axiosClient.get('/cart');
      dispatch(setCartItems(cartRes.data));
      await axiosClient.delete(`/wishlist/${productId}`);
      fetchWishlist();
      showMessage('Moved product to cart!');
    } catch (err) {
      showMessage('Failed to move item to cart.');
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
              <Heart className="w-7 h-7 mr-3 text-rose-400 fill-rose-400" /> Saved Wishlist
            </h1>
            <p className="text-xs text-slate-400">Keep track of products you want to purchase later</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="text-xs font-semibold text-indigo-400 hover:underline flex items-center"
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Browse Catalog
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div className="bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 p-4 rounded-2xl text-sm">
            {message}
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 mt-2">Loading wishlist items...</p>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <Heart className="w-16 h-16 text-slate-700 mx-auto" />
            <h2 className="text-xl font-bold text-white">Your wishlist is empty</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click the heart icon on any product in our catalog to save it to your personal wishlist.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              Explore Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div
                    className="h-44 bg-slate-950 rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/products/${item.product?.id}`)}
                  >
                    <img
                      src={
                        item.product?.images && item.product.images.length > 0
                          ? item.product.images[0]
                          : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-indigo-400 block">{item.product?.category?.name}</span>
                    <h3
                      onClick={() => navigate(`/products/${item.product?.id}`)}
                      className="text-sm font-bold text-white hover:text-indigo-400 cursor-pointer line-clamp-1"
                    >
                      {item.product?.name}
                    </h3>
                    <div className="flex items-center text-[11px] text-slate-400 mt-1">
                      <Store className="w-3 h-3 mr-1 text-purple-400" />
                      <span>{item.product?.vendor?.businessName || 'Verified Merchant'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-base font-extrabold text-white">${Number(item.product?.price || 0).toFixed(2)}</span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRemoveWishlist(item.product?.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleMoveToCart(item.product?.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Move to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
