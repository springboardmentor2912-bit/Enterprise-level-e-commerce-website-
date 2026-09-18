import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../services/wishlistService";
import { addToCart } from "../services/cartService";

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22200%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%2364748b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20text-anchor%3D%22middle%22%20x%3D%22100%22%20y%3D%22105%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";

function Wishlist() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const data = await getWishlist();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load wishlist", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    setBusyId(productId);
    try {
      const updated = await removeFromWishlist(productId);
      setItems(updated);
    } catch (err) {
      alert(err.response?.data || "Failed to remove item.");
    } finally {
      setBusyId(null);
    }
  };

  const handleAddToCart = async (productId, productName) => {
    setBusyId(productId);
    try {
      await addToCart(productId, 1);
      alert(`${productName} added to cart!`);
    } catch (err) {
      alert(err.response?.data || "Failed to add to cart.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading your wishlist…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-8">
          My Wishlist
        </h1>

        {items.length === 0 ? (
          <div className="text-center mt-16 bg-white border border-stone-100 rounded-2xl py-16 px-6">
            <h2 className="text-2xl font-semibold text-slate-700">
              Your wishlist is empty
            </h2>
            <p className="text-slate-500 mt-2">
              Save products you're interested in to find them here later.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="mt-6 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const hasDiscount = (item.discountPercentage ?? 0) > 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative">
                    <img
                      src={item.imageUrl || FALLBACK_IMAGE}
                      alt={item.productName}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGE;
                      }}
                      className="w-full h-48 object-cover"
                    />
                    {hasDiscount && (
                      <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                        {Math.round(item.discountPercentage)}% OFF
                      </span>
                    )}
                    <button
                      onClick={() => handleRemove(item.productId)}
                      disabled={busyId === item.productId}
                      className="absolute top-3 right-3 bg-white/90 hover:bg-white text-rose-600 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition"
                      title="Remove from wishlist"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-5">
                    <h2 className="text-lg font-bold text-slate-900 leading-snug mb-2">
                      {item.productName}
                    </h2>

                    <div className="flex items-baseline gap-2 mb-3">
                      {hasDiscount && (
                        <span className="text-slate-400 line-through text-sm">
                          ₹{item.price}
                        </span>
                      )}
                      <span className="text-xl font-bold text-amber-600">
                        ₹{item.finalPrice}
                      </span>
                    </div>

                    {!item.inStock && (
                      <p className="text-rose-600 text-xs font-semibold mb-3">
                        Out of Stock
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/products/${item.productId}`)}
                        className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg text-sm font-medium transition"
                      >
                        View
                      </button>

                      <button
                        disabled={!item.inStock || busyId === item.productId}
                        onClick={() => handleAddToCart(item.productId, item.productName)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                          !item.inStock
                            ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                            : "bg-amber-500 hover:bg-amber-600 text-white"
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
}

export default Wishlist;