import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { setCartItems, setCartLoading } from '../store/slices/cartSlice';
import {
  ShoppingCart, Trash2, ArrowRight, ShieldCheck, ShoppingBag, Tag,
  AlertTriangle, Package, Zap
} from 'lucide-react';
import { getErrorMessage } from '../api/errorUtils';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems, loading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [errorMsg, setErrorMsg] = useState('');

  const fetchCart = async () => {
    dispatch(setCartLoading(true));
    try {
      const res = await axiosClient.get('/cart');
      dispatch(setCartItems(res.data));
    } catch (err) {
      setErrorMsg('Failed to load cart items. Please make sure you are logged in.');
    } finally {
      dispatch(setCartLoading(false));
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (itemId, newQty, maxStock) => {
    if (newQty < 1) return;
    if (maxStock !== undefined && newQty > maxStock) {
      setErrorMsg(`Only ${maxStock} units available in stock.`);
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }
    try {
      await axiosClient.put(`/cart/items/${itemId}`, { quantity: newQty });
      fetchCart();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to update quantity. Please try again.'));
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await axiosClient.delete(`/cart/items/${itemId}`);
      fetchCart();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to remove item. Please try again.'));
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Compute totals using finalPrice
  const cartTotals = cartItems.reduce((acc, item) => {
    const original = Number(item.product?.price || 0);
    const final = Number(item.product?.finalPrice || item.product?.price || 0);
    const qty = item.quantity || 1;
    acc.originalTotal += original * qty;
    acc.finalTotal += final * qty;
    acc.totalDiscount += (original - final) * qty;
    return acc;
  }, { originalTotal: 0, finalTotal: 0, totalDiscount: 0 });

  const hasDiscount = cartTotals.totalDiscount > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
              <ShoppingCart className="w-7 h-7 mr-3 text-indigo-400" /> Shopping Cart
            </h1>
            <p className="text-xs text-slate-400">Review items before checkout</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="text-xs font-semibold text-indigo-400 hover:underline flex items-center"
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Continue Shopping
          </button>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="flex items-center space-x-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 mt-2">Loading cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <ShoppingCart className="w-16 h-16 text-slate-700 mx-auto" />
            <h2 className="text-xl font-bold text-white">Your cart is empty</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Explore our catalog and discover products from verified merchants.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const originalPrice = Number(item.product?.price || 0);
                const finalPrice = Number(item.product?.finalPrice || item.product?.price || 0);
                const discountPct = Number(item.product?.discountPercentage || 0);
                const hasItemDiscount = discountPct > 0;
                const qty = item.quantity || 1;
                const maxStock = item.product?.stockQuantity ?? 999;
                const subtotal = finalPrice * qty;

                return (
                  <div
                    key={item.id}
                    className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-md hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Image + Info */}
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <img
                            src={
                              item.product?.images && item.product.images.length > 0
                                ? item.product.images[0]
                                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'
                            }
                            alt={item.product?.name}
                            className="w-20 h-20 rounded-xl object-cover bg-slate-950 border border-slate-800"
                          />
                          {hasItemDiscount && (
                            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full">
                              {discountPct.toFixed(0)}%OFF
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3
                            onClick={() => navigate(`/products/${item.product?.id}`)}
                            className="font-bold text-sm text-white hover:text-indigo-400 cursor-pointer line-clamp-1"
                          >
                            {item.product?.name}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {item.product?.vendor?.businessName || 'Merchant'}
                          </p>
                          {/* Price display */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-base font-extrabold text-indigo-300">
                              ₹{finalPrice.toFixed(2)}
                            </span>
                            {hasItemDiscount && (
                              <>
                                <span className="text-xs text-slate-500 line-through">₹{originalPrice.toFixed(2)}</span>
                                <span className="text-[11px] text-emerald-400 font-medium">
                                  Save ₹{((originalPrice - finalPrice) * qty).toFixed(2)}
                                </span>
                              </>
                            )}
                          </div>
                          {/* Category & Brand tags */}
                          <div className="flex items-center gap-2 mt-1">
                            {item.product?.category?.name && (
                              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                <Tag className="w-2.5 h-2.5" />{item.product.category.name}
                              </span>
                            )}
                            {item.product?.brand && (
                              <span className="text-[10px] text-slate-500">{item.product.brand}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Qty + Subtotal + Remove */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                        {/* Quantity stepper */}
                        <div className="flex items-center border border-slate-700 rounded-xl bg-slate-950 overflow-hidden">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, qty - 1, maxStock)}
                            className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 font-bold text-sm cursor-pointer transition-colors"
                          >
                            −
                          </button>
                          <span className="px-3 py-1.5 text-xs font-bold text-white min-w-[2rem] text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, qty + 1, maxStock)}
                            disabled={qty >= maxStock}
                            className={`px-3 py-1.5 font-bold text-sm cursor-pointer transition-colors ${
                              qty >= maxStock
                                ? 'text-slate-600 cursor-not-allowed'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right min-w-[5rem]">
                          <span className="text-[10px] text-slate-400 block">Subtotal</span>
                          <span className="text-sm font-extrabold text-white">₹{subtotal.toFixed(2)}</span>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-all cursor-pointer flex-shrink-0"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Sidebar */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl h-fit space-y-5">
              <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" /> Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Items ({cartItems.length})</span>
                  <span className="font-semibold text-slate-200">₹{cartTotals.originalTotal.toFixed(2)}</span>
                </div>

                {hasDiscount && (
                  <div className="flex justify-between text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Total Discount
                    </span>
                    <span className="font-bold">− ₹{cartTotals.totalDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-semibold">FREE</span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-white">Total</span>
                  <span className="text-2xl font-black text-indigo-400">₹{cartTotals.finalTotal.toFixed(2)}</span>
                </div>

                {hasDiscount && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                    <p className="text-emerald-400 text-xs font-semibold">
                      🎉 You save ₹{cartTotals.totalDiscount.toFixed(2)} on this order!
                    </p>
                  </div>
                )}
              </div>

              {/* Proceed to Checkout button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Secured by ShopStack Guaranteed Delivery</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
