import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22250%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20250%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22400%22%20height%3D%22250%22%2F%3E%3Ctext%20fill%3D%22%2364748b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20text-anchor%3D%22middle%22%20x%3D%22200%22%20y%3D%22130%22%3ENo%20Image%20Available%3C%2Ftext%3E%3C%2Fsvg%3E";

const CustomerProducts = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId) => {
    setPurchasingId(productId);
    try {
      await productService.reduceStockOnOrder(productId, 1);
      await fetchProducts();
      alert('Order placed successfully!');
    } catch (error) {
      alert(error.response?.data || 'Failed to complete purchase. Product may be out of stock.');
    } finally {
      setPurchasingId(null);
    }
  };

  // NOTE: there's no Cart module yet (that's a later milestone), so this is
  // a harmless placeholder that doesn't touch stock — unlike Buy Now, which
  // actually reduces stock via the real purchase endpoint.
  const handleAddToCart = (product) => {
    alert(`${product.name} added to cart (cart feature coming soon).`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading catalog…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-slate-900">
            Marketplace Products
          </h1>
          <p className="text-slate-500 mt-1">
            {products.length} item{products.length !== 1 ? "s" : ""} available across all vendors
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center text-slate-400 mt-20">
            <h2 className="text-2xl font-medium">No products available</h2>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const stockCount = product.stock ?? product.stockQuantity ?? 0;
              const isOutOfStock = stockCount <= 0 || product.isOutOfStock;

              const imgSrc =
                (Array.isArray(product.images) && product.images.length > 0 && product.images[0])
                  ? product.images[0]
                  : product.imageUrl || product.image || FALLBACK_IMAGE;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <img
                    src={imgSrc}
                    alt={product.name || 'Product'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                    }}
                    className="w-full h-44 object-cover"
                  />

                  <div className="p-5">

                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mt-1 mb-3">
                      {product.description || 'No description provided.'}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xl font-bold text-amber-600">
                        ₹{product.price ? Number(product.price).toFixed(2) : '0.00'}
                      </p>

                      {isOutOfStock ? (
                        <span className="text-rose-600 text-xs font-semibold bg-rose-50 px-2.5 py-1 rounded-full">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="text-emerald-600 text-xs font-semibold">
                          {stockCount} in stock
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">

                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="w-full py-2.5 rounded-lg text-sm font-semibold bg-slate-800 hover:bg-slate-900 text-white transition"
                      >
                        View
                      </button>

                      <button
                        disabled={isOutOfStock || purchasingId === product.id}
                        onClick={() => handlePurchase(product.id)}
                        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition ${
                          isOutOfStock
                            ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                            : "bg-amber-500 hover:bg-amber-600 text-white"
                        }`}
                      >
                        {purchasingId === product.id
                          ? 'Processing…'
                          : isOutOfStock
                            ? 'Out of Stock'
                            : 'Buy Now'}
                      </button>

                      <button
                        disabled={isOutOfStock}
                        onClick={() => handleAddToCart(product)}
                        className={`w-full py-2.5 rounded-lg text-sm font-semibold border transition ${
                          isOutOfStock
                            ? "border-stone-200 text-stone-400 cursor-not-allowed"
                            : "border-stone-300 text-slate-700 hover:bg-stone-100"
                        }`}
                      >
                        Add to Cart
                      </button>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerProducts;
