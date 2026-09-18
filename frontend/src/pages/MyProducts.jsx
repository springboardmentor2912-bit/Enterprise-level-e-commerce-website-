import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';

const MyProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [updatingStockId, setUpdatingStockId] = useState(null);
  const [updatingDiscountId, setUpdatingDiscountId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [stockInputs, setStockInputs] = useState({});
  const [discountInputs, setDiscountInputs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getVendorProducts();
      setProducts(data);

      const initialStock = {};
      const initialDiscount = {};
      data.forEach((p) => {
        initialStock[p.id] = p.vendorPoolQuantity ?? p.stockQuantity ?? p.stock ?? 0;
        initialDiscount[p.id] = p.discountPercentage ?? 0;
      });
      setStockInputs(initialStock);
      setDiscountInputs(initialDiscount);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers for Quick Inline Inputs ---
  const handleStockInputChange = (id, value) => {
    setStockInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleDiscountInputChange = (id, value) => {
    setDiscountInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdateStock = async (id) => {
    const newQuantity = parseInt(stockInputs[id], 10);
    if (isNaN(newQuantity) || newQuantity < 0) {
      alert('Please enter a valid non-negative integer for quantity.');
      return;
    }

    setUpdatingStockId(id);
    try {
      await productService.updateStockQuantity(id, newQuantity);
      await fetchProducts();
    } catch (err) {
      alert('Failed to update stock quantity.');
    } finally {
      setUpdatingStockId(null);
    }
  };

  const handleUpdateDiscount = async (id) => {
    const newDiscount = parseFloat(discountInputs[id]);
    if (isNaN(newDiscount) || newDiscount < 0 || newDiscount > 100) {
      alert('Please enter a discount percentage between 0 and 100.');
      return;
    }

    setUpdatingDiscountId(id);
    try {
      await productService.updateProductDiscount(id, newDiscount);
      await fetchProducts();
    } catch (err) {
      alert('Failed to update discount.');
    } finally {
      setUpdatingDiscountId(null);
    }
  };

  // --- Delete Handler ---
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;

    setDeletingId(id);
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  // --- Fixed Navigation Handler ---
  // Matches <Route path="/products/edit/:id" element={<EditProduct />} />
  const handleEditClick = (id) => {
    navigate(`/products/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading inventory…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900">
              Vendor Inventory
            </h1>
            <p className="text-slate-500 mt-1">
              Manage stock, discounts, and details for {products.length} listing{products.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Empty State */}
        {products.length === 0 ? (
          <div className="text-center mt-20 bg-white border border-stone-100 rounded-2xl py-16 px-6">
            <h2 className="text-2xl font-semibold text-slate-700">
              You haven't listed any products yet
            </h2>
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Current Stock</th>
                  <th className="px-5 py-3 font-semibold">Update Stock</th>
                  <th className="px-5 py-3 font-semibold">Discount %</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => {
                  const currentStock = p.vendorPoolQuantity ?? p.stockQuantity ?? p.stock ?? 0;
                  const price = p.price ?? 0;
                  const discount = p.discountPercentage ?? 0;
                  const finalPrice = p.finalPrice ?? price;
                  const previewDiscount = parseFloat(discountInputs[p.id]);
                  const previewFinalPrice =
                    !isNaN(previewDiscount) && previewDiscount > 0
                      ? (price - (price * previewDiscount) / 100).toFixed(2)
                      : null;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/60 transition">
                      {/* Product Info */}
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {p.name}
                      </td>

                      {/* Pricing */}
                      <td className="px-5 py-4">
                        {discount > 0 ? (
                          <div>
                            <span className="text-slate-400 line-through text-sm mr-2">
                              ₹{price.toFixed ? price.toFixed(2) : price}
                            </span>
                            <span className="text-amber-600 font-semibold">
                              ₹{finalPrice.toFixed ? finalPrice.toFixed(2) : finalPrice}
                            </span>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-semibold">
                            ₹{price.toFixed ? price.toFixed(2) : price}
                          </span>
                        )}
                      </td>

                      {/* Current Stock */}
                      <td className="px-5 py-4">
                        {currentStock <= 0 ? (
                          <span className="text-rose-600 font-semibold text-sm">0 · Out of Stock</span>
                        ) : (
                          <span className="text-slate-700 text-sm">{currentStock}</span>
                        )}
                      </td>

                      {/* Quick Stock Controls */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={stockInputs[p.id] !== undefined ? stockInputs[p.id] : ''}
                            onChange={(e) => handleStockInputChange(p.id, e.target.value)}
                            className="w-20 border border-stone-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          />
                          <button
                            onClick={() => handleUpdateStock(p.id)}
                            disabled={updatingStockId === p.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition disabled:opacity-60"
                          >
                            {updatingStockId === p.id ? '...' : 'Save'}
                          </button>
                        </div>
                      </td>

                      {/* Quick Discount Controls */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={discountInputs[p.id] !== undefined ? discountInputs[p.id] : ''}
                              onChange={(e) => handleDiscountInputChange(p.id, e.target.value)}
                              className="w-20 border border-stone-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            {previewFinalPrice !== null && (
                              <span className="text-xs text-slate-400">
                                → ₹{previewFinalPrice}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleUpdateDiscount(p.id)}
                            disabled={updatingDiscountId === p.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition disabled:opacity-60"
                          >
                            {updatingDiscountId === p.id ? '...' : 'Save'}
                          </button>
                        </div>
                      </td>

                      {/* EDIT & DELETE ACTIONS */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(p.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-slate-700 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            disabled={deletingId === p.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 transition disabled:opacity-50"
                          >
                            {deletingId === p.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;