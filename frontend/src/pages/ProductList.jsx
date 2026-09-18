import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllProducts,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
} from "../services/productService";
import { getAllCategories } from "../services/Categoryservice";
import { addToCart } from "../services/cartService";
import { getWishlist, addToWishlist, removeFromWishlist } from "../services/wishlistService";

// Helper to safely extract logged-in user context
function getUserContext() {
  let role = localStorage.getItem("role");
  let userId = localStorage.getItem("userId") || localStorage.getItem("id");
  let userEmail = localStorage.getItem("userEmail") || localStorage.getItem("email");

  const token = localStorage.getItem("authToken") || localStorage.getItem("token");
  if (token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));

      role = payload.role || payload.roles?.[0] || role;
      userId = payload.sub || payload.id || payload.userId || userId;
      userEmail = payload.email || userEmail;
    } catch (e) {
      console.warn("Could not parse JWT token payload in ProductList", e);
    }
  }

  return { role, userId, userEmail };
}

function ProductList() {
  const navigate = useNavigate();

  // 1. Get logged-in user details
  const { role: currentUserRole, userId: currentUserId, userEmail: currentUserEmail } = useMemo(
    () => getUserContext(),
    []
  );

  // The JWT role identifies the account's real role, while viewAs identifies
  // which side of a multi-role account is currently active.
  const activeView = String(
    localStorage.getItem("viewAs") || currentUserRole || "CUSTOMER"
  ).toUpperCase();
  const isVendor = activeView === "VENDOR";

  // 2. Component State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [purchasingId, setPurchasingId] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistBusyId, setWishlistBusyId] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    // Fetch wishlist for customer
    if (!isVendor) {
      getWishlist()
        .then((items) => {
          if (Array.isArray(items)) {
            setWishlistIds(new Set(items.map((item) => String(item.productId))));
          }
        })
        .catch(() => {});
    }
  }, [isVendor]);

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();

      const categoryList = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : response?.categories || [];

      setCategories(categoryList);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
    }
  };

  const handleSearch = async () => {
    try {
      if (keyword.trim() === "") {
        fetchProducts();
        return;
      }

      const data = await searchProducts(keyword);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert("Search failed.");
    }
  };

  const handleCategoryFilter = async () => {
    try {
      if (categoryId === "") {
        fetchProducts();
        return;
      }

      const data = await getProductsByCategory(categoryId);
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert("Failed to filter products.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Delete failed.");
    }
  };

  const handlePurchase = async (product) => {
    const productId = product.id || product._id || product.productId;
    setPurchasingId(productId);
    navigate("/checkout", {
      state: {
        buyNow: {
          productId,
          quantity: 1,
          productName: product.name,
        },
      },
    });
  };

  const handleAddToCart = async (product) => {
    try {
      const productId = product.id || product._id || product.productId;
      await addToCart(productId, 1);
      
      // Dispatch event to update cart badge in Navbar immediately
      window.dispatchEvent(new Event("refreshCart"));
    } catch (error) {
      alert(error.response?.data || "Failed to add to cart.");
    }
  };

  const handleToggleWishlist = async (productId) => {
    setWishlistBusyId(productId);
    const isSaved = wishlistIds.has(String(productId));

    try {
      if (isSaved) {
        await removeFromWishlist(productId);
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(String(productId));
          return next;
        });
      } else {
        await addToWishlist(productId);
        setWishlistIds((prev) => new Set(prev).add(String(productId)));
      }
    } catch (error) {
      alert(error.response?.data || "Failed to update wishlist.");
    } finally {
      setWishlistBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900">
              {isVendor ? "Manage & View Marketplace" : "Shop All Products"}
            </h1>
            <p className="text-slate-500 mt-1">
              {products.length} item{products.length !== 1 ? "s" : ""} available across all vendors
            </p>
          </div>

          {isVendor && (
            <button
              onClick={() => navigate("/addproduct")}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3 rounded-lg font-semibold transition shadow-sm whitespace-nowrap cursor-pointer"
            >
              + Add Product
            </button>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl border border-stone-100 shadow-sm">
          <input
            type="text"
            placeholder="Search products…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 border border-stone-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />

          <button
            onClick={handleSearch}
            className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg font-medium transition cursor-pointer"
          >
            Search
          </button>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border border-stone-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="">All Categories</option>
            {Array.isArray(categories) && categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleCategoryFilter}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-medium transition cursor-pointer"
          >
            Filter
          </button>
        </div>

        {!Array.isArray(products) || products.length === 0 ? (
          <div className="text-center text-slate-400 mt-20">
            <h2 className="text-2xl font-medium">No products available</h2>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const id = product.id || product._id || product.productId;

              const FALLBACK_IMAGE = "https://via.placeholder.com/400x400?text=No+Image+Available";
              const imageSrc =
                product.imageUrl ||
                product.image ||
                (product.images && product.images.length > 0 ? product.images[0] : FALLBACK_IMAGE);

              const stockVal = product.stock ?? product.stockQuantity ?? 0;
              const isOutOfStock = stockVal <= 0 || product.isOutOfStock;
              const hasDiscount = (product.discountPercentage ?? 0) > 0;

              // Product Ownership Evaluation
              const productVendorId =
                product.vendorId ||
                product.vendor_id ||
                product.vendor?.id ||
                product.vendor?._id;

              const productVendorEmail =
                product.vendorEmail ||
                product.vendor_email ||
                product.vendor?.email;

              const isIdMatch = Boolean(
                currentUserId &&
                productVendorId &&
                String(currentUserId).trim() === String(productVendorId).trim()
              );

              const isEmailMatch = Boolean(
                currentUserEmail &&
                productVendorEmail &&
                String(currentUserEmail).trim().toLowerCase() === String(productVendorEmail).trim().toLowerCase()
              );

              const isOwner = isVendor && (isIdMatch || isEmailMatch);

              return (
                <div
                  key={id}
                  className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Modern Product Image Container */}
                    <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={product.name}
                        className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />

                      {/* Image Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                        {hasDiscount && (
                          <span className="bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                            {Math.round(product.discountPercentage)}% OFF
                          </span>
                        )}
                        {isOwner && (
                          <span className="bg-emerald-700 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
                            Your Product
                          </span>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      {!isVendor && (
                        <button
                          onClick={() => handleToggleWishlist(id)}
                          disabled={wishlistBusyId === id}
                          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md backdrop-blur-md transition-all cursor-pointer ${
                            wishlistIds.has(String(id))
                              ? "bg-white text-rose-600 scale-105"
                              : "bg-white/80 hover:bg-white text-slate-600 hover:text-slate-900 hover:scale-110"
                          }`}
                          title={wishlistIds.has(String(id)) ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          {wishlistIds.has(String(id)) ? "♥" : "♡"}
                        </button>
                      )}
                    </div>

                    <div className="p-5">
                      {(product.categoryName || product.category?.name) && (
                        <span className="inline-block bg-slate-100 text-slate-700 text-xs font-medium uppercase tracking-wider px-2 py-0.5 rounded mb-2">
                          {product.categoryName || product.category?.name}
                        </span>
                      )}

                      <h2 className="text-base font-bold text-slate-900 leading-snug line-clamp-1 group-hover:text-emerald-800 transition-colors">
                        {product.name}
                      </h2>
                      {product.brand && (
                        <p className="text-xs text-slate-400 font-medium mb-1">{product.brand}</p>
                      )}

                      <p className="text-slate-600 text-xs line-clamp-2 my-2 min-h-[2rem]">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <div>
                          {hasDiscount ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-bold text-slate-900">
                                ₹{product.finalPrice}
                              </span>
                              <span className="text-xs text-slate-400 line-through">
                                ₹{product.price}
                              </span>
                            </div>
                          ) : (
                            <p className="text-lg font-bold text-slate-900">
                              ₹{product.price}
                            </p>
                          )}
                        </div>

                        {isOutOfStock ? (
                          <span className="text-rose-600 text-xs font-medium bg-rose-50 px-2 py-0.5 rounded">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="text-emerald-700 text-xs font-medium bg-emerald-50 px-2 py-0.5 rounded">
                            {stockVal} left
                          </span>
                        )}
                      </div>

                      {product.vendor && (
                        <p className="text-[11px] text-slate-400 mt-2">
                          Sold by{" "}
                          <span className="font-medium text-slate-600">
                            {product.vendor.name || product.vendor.username || product.vendor.email}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* BUTTON ACTIONS */}
                  <div className="p-5 pt-0 flex flex-col gap-2">
                    <button
                      onClick={() => navigate(`/products/${id}`)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                    >
                      View Details
                    </button>

                    {/* VENDOR ACTIONS */}
                    {isOwner && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/products/edit/${id}`)}
                          className="flex-1 border border-stone-300 text-slate-700 hover:bg-stone-100 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(id)}
                          className="flex-1 border border-rose-200 text-rose-600 hover:bg-rose-50 py-2 rounded-lg text-xs font-medium transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    {/* CUSTOMER ACTIONS */}
                    {!isVendor && (
                      <div className="flex gap-2">
                        <button
                          disabled={isOutOfStock || purchasingId === id}
                          onClick={() => handlePurchase(product)}
                          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            isOutOfStock
                              ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                              : "bg-amber-500 hover:bg-amber-600 text-white"
                          }`}
                        >
                          {purchasingId === id ? "Processing…" : isOutOfStock ? "Unavailable" : "Buy Now"}
                        </button>

                        <button
                          disabled={isOutOfStock}
                          onClick={() => handleAddToCart(product)}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
                            isOutOfStock
                              ? "border-stone-200 text-stone-400 cursor-not-allowed"
                              : "border-stone-300 text-slate-700 hover:bg-stone-100"
                          }`}
                        >
                          Add to Cart
                        </button>
                      </div>
                    )}
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

export default ProductList;