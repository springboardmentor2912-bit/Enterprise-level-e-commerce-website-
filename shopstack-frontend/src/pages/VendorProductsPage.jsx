import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import {
  Package, Plus, Edit2, Trash2, Tag, CheckCircle2, AlertCircle,
  RefreshCw, X, ShieldCheck, History, Percent, Zap
} from 'lucide-react';

import { getErrorMessage } from '../api/errorUtils';

const VendorProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFetchError, setCategoryFetchError] = useState('');

  // Add Product Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    price: '',
    discountPercentage: '',
    stockQuantity: '',
    categoryId: '',
    imageUrl: '',
  });

  // History modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState(null);

  // Inline edit state
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [editingStockId, setEditingStockId] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [editingDiscountId, setEditingDiscountId] = useState(null);
  const [newDiscount, setNewDiscount] = useState('');

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const vendorHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('shopstack_vendor_token')}`,
    },
  };

  const fetchVendorProducts = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/vendor/products', vendorHeaders);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch vendor products', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const catRes = await axiosClient.get('/categories');
      if (catRes.data && catRes.data.length > 0) {
        setCategories(catRes.data);
        setCategoryFetchError('');
      } else {
        setCategoryFetchError('No categories found. Please contact admin.');
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
      setCategoryFetchError('Failed to load categories. Is the backend running?');
    }
  };

  useEffect(() => {
    fetchVendorProducts();
    fetchCategories();
  }, []);

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) {
      showMessage('Please select a category before saving.', 'error');
      return;
    }
    try {
      const images = formData.imageUrl ? [formData.imageUrl] : [];
      await axiosClient.post(
        '/vendor/products',
        {
          name: formData.name,
          brand: formData.brand,
          description: formData.description,
          price: Number(formData.price),
          discountPercentage: formData.discountPercentage ? Number(formData.discountPercentage) : 0,
          stockQuantity: Number(formData.stockQuantity),
          categoryId: Number(formData.categoryId),
          images,
        },
        vendorHeaders
      );
      setShowAddModal(false);
      setFormData({ name: '', brand: '', description: '', price: '', discountPercentage: '', stockQuantity: '', categoryId: '', imageUrl: '' });
      showMessage('Product successfully created & added to inventory!');
      fetchVendorProducts();
    } catch (err) {
      showMessage(getErrorMessage(err, 'Failed to create product. Please check all fields.'), 'error');
    }
  };

  const handleUpdatePrice = async (id) => {
    try {
      await axiosClient.patch(`/vendor/products/${id}/price`, { price: Number(newPrice) }, vendorHeaders);
      setEditingPriceId(null);
      showMessage('Product price updated!');
      fetchVendorProducts();
    } catch (err) {
      showMessage(getErrorMessage(err, 'Failed to update price.'), 'error');
    }
  };

  const handleUpdateStock = async (id) => {
    try {
      await axiosClient.patch(`/vendor/products/${id}/stock`, { stockQuantity: Number(newStock) }, vendorHeaders);
      setEditingStockId(null);
      showMessage('Inventory stock updated!');
      fetchVendorProducts();
    } catch (err) {
      showMessage(getErrorMessage(err, 'Failed to update stock quantity.'), 'error');
    }
  };

  const handleUpdateDiscount = async (id) => {
    try {
      const discount = newDiscount === '' ? 0 : Number(newDiscount);
      await axiosClient.patch(`/vendor/products/${id}/discount`, { discountPercentage: discount }, vendorHeaders);
      setEditingDiscountId(null);
      showMessage(discount > 0 ? `${discount}% discount applied!` : 'Discount removed.');
      fetchVendorProducts();
    } catch (err) {
      showMessage(getErrorMessage(err, 'Failed to update discount.'), 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product listing?')) return;
    try {
      await axiosClient.delete(`/vendor/products/${id}`, vendorHeaders);
      showMessage('Product removed from inventory.');
      fetchVendorProducts();
    } catch (err) {
      showMessage(getErrorMessage(err, 'Failed to delete product.'), 'error');
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  // Preview final price in add modal
  const previewFinalPrice = () => {
    const price = Number(formData.price) || 0;
    const disc = Number(formData.discountPercentage) || 0;
    if (price <= 0) return null;
    const final = price * (1 - disc / 100);
    return final.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center">
              <Package className="w-7 h-7 mr-3 text-purple-400" /> Vendor Inventory & Price Management
            </h1>
            <p className="text-xs text-slate-400">List products, manage stock, set discounts, and update catalog pricing</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchVendorProducts}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 transition-all cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {message && (
          <div className={`p-4 rounded-2xl text-sm flex items-center space-x-2 ${
            messageType === 'error'
              ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
              : 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
          }`}>
            {messageType === 'error'
              ? <AlertCircle className="w-5 h-5 flex-shrink-0" />
              : <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
            <span>{message}</span>
          </div>
        )}

        {/* Products Table */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 mt-2">Loading merchant inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <Package className="w-16 h-16 text-slate-700 mx-auto" />
            <h2 className="text-xl font-bold text-white">No items in your vendor inventory</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Start selling on ShopStack by adding your first product.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price / Final</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {products.map((item) => {
                    const discountPct = Number(item.discountPercentage || 0);
                    const finalPrice = Number(item.finalPrice || item.price || 0);
                    const originalPrice = Number(item.price || 0);
                    const hasDiscount = discountPct > 0;

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Product */}
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                item.images && item.images.length > 0
                                  ? item.images[0]
                                  : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'
                              }
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800 flex-shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white line-clamp-1">{item.name}</div>
                              <div className="text-xs text-slate-400">{item.brand || 'ShopStack'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-1 bg-slate-950 text-indigo-300 rounded-full text-xs font-semibold border border-slate-800">
                            <Tag className="w-3 h-3 mr-1" />
                            {item.category?.name || 'General'}
                          </span>
                        </td>

                        {/* Price Column */}
                        <td className="p-4">
                          {editingPriceId === item.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                step="0.01"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                className="w-20 bg-slate-950 border border-purple-500 rounded-lg px-2 py-1 text-xs text-white"
                              />
                              <button onClick={() => handleUpdatePrice(item.id)} className="px-2 py-1 bg-purple-600 text-white rounded text-xs">Save</button>
                              <button onClick={() => setEditingPriceId(null)} className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs">X</button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div>
                                {hasDiscount ? (
                                  <>
                                    <div className="font-extrabold text-emerald-400">₹{finalPrice.toFixed(2)}</div>
                                    <div className="text-xs text-slate-500 line-through">₹{originalPrice.toFixed(2)}</div>
                                  </>
                                ) : (
                                  <div className="font-extrabold text-white">₹{originalPrice.toFixed(2)}</div>
                                )}
                              </div>
                              <button
                                onClick={() => { setEditingPriceId(item.id); setNewPrice(item.price); }}
                                className="text-slate-500 hover:text-purple-400 p-1"
                                title="Edit Price"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Discount Column */}
                        <td className="p-4">
                          {editingDiscountId === item.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={newDiscount}
                                onChange={(e) => setNewDiscount(e.target.value)}
                                placeholder="0-100"
                                className="w-16 bg-slate-950 border border-purple-500 rounded-lg px-2 py-1 text-xs text-white"
                              />
                              <span className="text-xs text-slate-400">%</span>
                              <button onClick={() => handleUpdateDiscount(item.id)} className="px-2 py-1 bg-purple-600 text-white rounded text-xs">Save</button>
                              <button onClick={() => setEditingDiscountId(null)} className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs">X</button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              {hasDiscount ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold">
                                  <Zap className="w-3 h-3" />{discountPct.toFixed(0)}% OFF
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500">No discount</span>
                              )}
                              <button
                                onClick={() => { setEditingDiscountId(item.id); setNewDiscount(item.discountPercentage || ''); }}
                                className="text-slate-500 hover:text-purple-400 p-1"
                                title="Edit Discount"
                              >
                                <Percent className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Stock Column */}
                        <td className="p-4">
                          {editingStockId === item.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={newStock}
                                onChange={(e) => setNewStock(e.target.value)}
                                className="w-16 bg-slate-950 border border-purple-500 rounded-lg px-2 py-1 text-xs text-white"
                              />
                              <button onClick={() => handleUpdateStock(item.id)} className="px-2 py-1 bg-purple-600 text-white rounded text-xs">Save</button>
                              <button onClick={() => setEditingStockId(null)} className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs">X</button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className={`font-bold ${
                                item.stockQuantity <= 0 ? 'text-rose-400' :
                                item.stockQuantity < 5 ? 'text-amber-400' : 'text-slate-200'
                              }`}>
                                {item.stockQuantity} units
                              </span>
                              <button
                                onClick={() => { setEditingStockId(item.id); setNewStock(item.stockQuantity); }}
                                className="text-slate-500 hover:text-purple-400 p-1"
                                title="Edit Stock"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Approval Status */}
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> {item.approvalStatus || 'APPROVED'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right space-x-1">
                          <button
                            onClick={async () => {
                              try {
                                const res = await axiosClient.get(`/products/${item.id}/inventory-history`, vendorHeaders);
                                setHistoryLogs(res.data);
                                setSelectedProductForHistory(item);
                                setShowHistoryModal(true);
                              } catch (e) {
                                showMessage('No history records found or error fetching history.', 'error');
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-purple-400 rounded-lg hover:bg-slate-800 transition-all"
                            title="View Stock History"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(item.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-all"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-purple-900/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center">
                  <Package className="w-5 h-5 mr-2 text-purple-400" /> Add Product to Inventory
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddProductSubmit} className="space-y-4">
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">Product Title</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Category + Brand */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">Category</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                    >
                      <option value="">{categoryFetchError ? '⚠ Unavailable' : 'Select Category'}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {categoryFetchError && <p className="text-[11px] text-rose-400 mt-1">⚠ {categoryFetchError}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">Brand Name</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g. Sony, Apple, Nike"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Price + Discount + Stock */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="999.99"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300 flex items-center gap-1">
                      <Percent className="w-3 h-3 text-rose-400" /> Discount %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                      placeholder="0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-300">Stock Qty</label>
                    <input
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      placeholder="50"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Final price preview */}
                {previewFinalPrice() && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-xs text-emerald-300 font-medium">
                      Final Price after discount:
                    </span>
                    <span className="text-base font-extrabold text-emerald-400">
                      ₹{previewFinalPrice()}
                    </span>
                  </div>
                )}

                {/* Image URL */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">Product Image URL</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-0.5">Paste a full image URL</p>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">Product Description</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe product specifications, features, warranty..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Inventory History Modal */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-purple-900/40 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center">
                    <History className="w-5 h-5 mr-2 text-purple-400" /> Stock Audit History
                  </h2>
                  <p className="text-xs text-slate-400">{selectedProductForHistory?.name}</p>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {historyLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">No stock history recorded yet.</div>
              ) : (
                <div className="space-y-3">
                  {historyLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.quantityChange > 0
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange} units
                        </span>
                        <div className="text-xs text-slate-300 font-medium mt-1">{log.changeReason}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400 font-bold">Stock: {log.resultingStock}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Recent'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProductsPage;
