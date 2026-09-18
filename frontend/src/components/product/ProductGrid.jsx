import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/productSlice";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  addToCart,
} from "../../api/customerApi";
import ProductCard from "./ProductCard";
import SearchBar from "./SearchBar";

export default function ProductGrid() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts());
    loadWishlist();
  }, [dispatch]);

  async function loadWishlist() {
    try {
      const res = await getWishlist();
      setWishlistIds((res.data || []).map((w) => w.productId));
    } catch (e) {
      // ignore — not critical for grid
    }
  }

  async function toggleWishlist(product) {
    try {
      if (wishlistIds.includes(product.id)) {
        await removeFromWishlist(product.id);
        setWishlistIds((ids) => ids.filter((id) => id !== product.id));
      } else {
        await addToWishlist(product.id);
        setWishlistIds((ids) => [...ids, product.id]);
      }
      window.dispatchEvent(new Event("cart-updated"));
    } catch (e) {
      alert("Wishlist update failed");
    }
  }

  async function handleAddToCart(product) {
    try {
      await addToCart(product.id);
      window.dispatchEvent(new Event("cart-updated"));
    } catch (e) {
      alert("Failed to add to cart");
    }
  }

  if (loading)
    return (
      // 🆕 Changed to bg-white
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-white">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-stone-200" />
          <div
            className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"
          />
        </div>
        <p className="text-[14px] font-medium text-stone-500">
          Loading products...
        </p>
      </div>
    );

  if (error)
    return (
      // 🆕 Changed to bg-white
      <div className="flex min-h-[60vh] items-center justify-center bg-white px-5">
        <div className="max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-lg">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </span>
          <h2 className="font-['Fraunces',serif] text-xl font-semibold text-stone-900">
            Something went wrong
          </h2>
          <p className="mt-2 text-[14px] text-rose-700">{error}</p>
        </div>
      </div>
    );

  return (
    // 🆕 Changed to bg-white
    <div className="min-h-screen bg-white font-['Manrope',sans-serif]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Page header (UI-only) */}
        <div className="mb-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
            Shop
          </p>
          <h1 className="mt-2 font-['Fraunces',serif] text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
            Discover what's{" "}
            <span className="italic text-amber-600">new</span>
          </h1>
          <p className="mt-3 text-[15px] text-stone-500">
            Handpicked products from our trusted vendors
          </p>
        </div>

        <SearchBar />

        {products.length === 0 ? (
          // 🆕 Changed bg-white/60 to bg-white for consistency
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white p-16 text-center">
            <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-stone-100 text-stone-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
            </span>
            <h3 className="font-['Fraunces',serif] text-xl font-semibold text-stone-900">
              No products found
            </h3>
            <p className="mt-1.5 text-sm text-stone-500">
              Try adjusting your search or check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                inWishlist={wishlistIds.includes(product.id)}
                onToggleWishlist={() => toggleWishlist(product)}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}