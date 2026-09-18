import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, deleteProduct } from "../services/productService";
import { addToCart } from "../services/cartService";
import { getWishlist, addToWishlist, removeFromWishlist } from "../services/wishlistService";

// Helper to safely extract user ID and Role from all possible storage variations
function getUserContext() {
  let role = localStorage.getItem("role");
  let userId = localStorage.getItem("userId") || localStorage.getItem("id");
  let userEmail = localStorage.getItem("userEmail") || localStorage.getItem("email");

  // Attempt JWT parsing if available
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
      console.warn("Could not parse JWT token payload", e);
    }
  }

  return { role, userId, userEmail };
}

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Get logged-in user context
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
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);

  // 3. Fetch Data
  useEffect(() => {
    let isMounted = true;

    if (!id || id === "undefined") {
      setError("Invalid Product ID.");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductById(id);
        const data = response?.data?.data || response?.data || response;

        if (isMounted) {
          if (data && typeof data === "object") {
            setProduct(data);
          } else {
            setError("Product not found.");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching product details:", err);
          setError("Unable to load product information.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();

    if (!isVendor && (localStorage.getItem("authToken") || localStorage.getItem("token"))) {
      getWishlist()
        .then((items) => {
          if (isMounted && Array.isArray(items)) {
            setInWishlist(items.some((item) => String(item.productId) === String(id)));
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [id, isVendor]);

  // 4. Action Handlers
  const handleDeleteProduct = async () => {
    if (!product) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    setDeleting(true);
    const productId = product.id || product._id || id;

    try {
      await deleteProduct(productId);
      alert("Product successfully deleted.");
      navigate("/vendor/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || "Failed to delete product.");
      setDeleting(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    setWishlistBusy(true);
    const productId = product.id || product._id || id;
    try {
      if (inWishlist) {
        await removeFromWishlist(productId);
        setInWishlist(false);
      } else {
        await addToWishlist(productId);
        setInWishlist(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || "Failed to update wishlist.");
    } finally {
      setWishlistBusy(false);
    }
  };

  const handlePurchase = async () => {
    if (!product) return;
    const productId = product.id || product._id || id;
    // Buy Now is a standalone express checkout — it must never touch the
    // cart, or it ends up bundling in whatever else is already sitting
    // there. Checkout.jsx detects location.state.buyNow and switches to
    // the single-item flow instead of loading the cart.
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

  const handleAddToCart = async () => {
    if (!product) return;
    const productId = product.id || product._id || id;
    const productName = product.name || product.title || "Item";

    try {
      await addToCart(productId, 1);
      alert(`${productName} added to cart!`);
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || "Failed to add to cart.");
    }
  };

  // 5. Loading & Error Render Rules
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <p className="text-slate-500 font-medium">Loading product details…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-4">
        <h2 className="text-xl font-medium text-rose-600">{error || "Product not found."}</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------------
  // STRICT PROPERTY EXTRACTION & DEBUG LOGGING
  // ---------------------------------------------------------------------
  // Extract vendor details across every possible API response convention
  const productVendorId = 
    product.vendorId || 
    product.vendor_id || 
    product.vendor?.id || 
    product.vendor?._id;

  const productVendorEmail = 
    product.vendorEmail || 
    product.vendor_email || 
    product.vendor?.email;

  // Strict String Normalization Comparisons
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

  // ONLY true if user is a vendor AND matching ID or Email was confirmed
  const isOwner = isVendor && (isIdMatch || isEmailMatch);

  // DEBUG CONSOLE OUTPUT: Open inspect element -> console to view these!
  console.log("--- PRODUCT OWNERSHIP CHECK ---", {
    currentUserRole,
    isVendor,
    currentUserId,
    productVendorId,
    currentUserEmail,
    productVendorEmail,
    isIdMatch,
    isEmailMatch,
    IS_OWNER_FINAL: isOwner
  });

  const FALLBACK_IMAGE =
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22250%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20250%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22400%22%20height%3D%22250%22%2F%3E%3Ctext%20fill%3D%22%2364748b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2218%22%20text-anchor%3D%22middle%22%20x%3D%22200%22%20y%3D%22130%22%3ENo%20Image%20Available%3C%2Ftext%3E%3C%2Fsvg%3E";

  const imageSrc =
    product.imageUrl ||
    product.image ||
    (Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : FALLBACK_IMAGE);

  const categoryName = product.categoryName || product.category?.name;
  const stockCount = product.stockQuantity ?? product.stock ?? 0;
  const isOutOfStock = stockCount <= 0 || product.isOutOfStock;
  const productId = product.id || product._id || id;

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md border border-stone-100 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="bg-stone-100 flex items-center justify-center min-h-[350px]">
            <img
              src={imageSrc}
              alt={product.name || "Product"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = FALLBACK_IMAGE;
              }}
            />
          </div>

          {/* Details */}
          <div className="p-8 md:p-10 flex flex-col justify-between">
            <div>
              {categoryName && (
                <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-4">
                  {categoryName}
                </span>
              )}

              <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2">
                {product.name}
              </h1>

              <p className="text-slate-500 mb-6">{product.brand || "Unbranded"}</p>

              {(product.discountPercentage ?? 0) > 0 ? (
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-lg text-slate-400 line-through">₹{product.price}</span>
                  <span className="text-3xl font-bold text-amber-600">₹{product.finalPrice}</span>
                  <span className="bg-rose-50 text-rose-600 text-xs font-bold px-2 py-1 rounded-md">
                    {Math.round(product.discountPercentage)}% OFF
                  </span>
                </div>
              ) : (
                <p className="text-3xl font-bold text-amber-600 mb-6">₹{product.price}</p>
              )}

              <p className="text-slate-600 leading-relaxed mb-6">
                {product.description || "No description provided."}
              </p>

              <div className="space-y-2 text-sm border-t border-stone-100 pt-6">
                <p className="text-slate-700">
                  <span className="font-semibold">Stock Available:</span> {stockCount}
                </p>

                {isOutOfStock ? (
                  <p className="text-red-600 font-semibold">❌ Out of Stock</p>
                ) : stockCount <= 5 ? (
                  <p className="text-orange-500 font-semibold">⚠️ Low Stock ({stockCount} left)</p>
                ) : (
                  <p className="text-green-600 font-semibold">✅ In Stock</p>
                )}

                {product.vendor && (
                  <div className="pt-2 text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-800">Merchant:</span>{" "}
                      {product.vendor.name || product.vendor.username || product.vendor.email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ACTION BUTTON CONTROL */}
            <div className="flex gap-4 mt-10">
              
              {/* Back button shown to EVERYONE */}
              <button
                onClick={() => navigate(-1)}
                className="flex-1 border border-stone-300 text-slate-700 hover:bg-stone-100 py-3 rounded-lg font-medium transition"
              >
                Back
              </button>

              {/* EDIT & DELETE: Rendered ONLY if user is verified as OWNER */}
              {isOwner && (
                <>
                  <button
                    onClick={() => navigate(`/products/edit/${productId}`)}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Edit Product
                  </button>

                  <button
                    disabled={deleting}
                    onClick={handleDeleteProduct}
                    className="px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition"
                  >
                    {deleting ? "Deleting…" : "Delete"}
                  </button>
                </>
              )}

              {/* READ-ONLY BADGE: Shown to non-owner vendors */}
              {isVendor && !isOwner && (
                <div className="flex-1 flex items-center justify-center bg-stone-100 border border-stone-200 text-slate-500 text-xs rounded-lg px-2 font-medium">
                  🔒 Read-Only (Other Vendor's Item)
                </div>
              )}

              {/* SHOPPER BUTTONS: Shown ONLY to non-vendors */}
              {!isVendor && (
                <>
                  <button
                    onClick={handleToggleWishlist}
                    disabled={wishlistBusy}
                    className={`px-4 py-3 rounded-lg font-medium border transition ${
                      inWishlist
                        ? "border-rose-200 bg-rose-50 text-rose-600"
                        : "border-stone-300 text-slate-600 hover:bg-stone-100"
                    }`}
                  >
                    {inWishlist ? "♥ Saved" : "♡ Save"}
                  </button>

                  <button
                    disabled={isOutOfStock || purchasing}
                    onClick={handlePurchase}
                    className={`flex-1 py-3 rounded-lg font-semibold transition ${
                      isOutOfStock
                        ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-600 text-white"
                    }`}
                  >
                    {isOutOfStock ? "Out of Stock" : purchasing ? "Processing…" : "Buy Now"}
                  </button>

                  <button
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                    className={`flex-1 py-3 rounded-lg font-medium border transition ${
                      isOutOfStock
                        ? "border-stone-200 text-stone-400 cursor-not-allowed"
                        : "border-stone-300 text-slate-700 hover:bg-stone-100"
                    }`}
                  >
                    Add to Cart
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;