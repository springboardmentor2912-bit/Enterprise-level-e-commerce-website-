import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, updateCartItem, removeCartItem } from "../services/cartService";

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%3E%3Crect%20fill%3D%22%23e2e8f0%22%20width%3D%22200%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%2364748b%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%20text-anchor%3D%22middle%22%20x%3D%22100%22%20y%3D%22105%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  // Helper to notify Navbar asynchronously without breaking React's render loop
  const notifyCartUpdated = (data) => {
    const count =
      data?.totalItems ??
      data?.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) ??
      0;

    // Defer execution so it runs AFTER React finishes the current render pass
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("cartUpdated", { detail: count }));
      window.dispatchEvent(new Event("refreshCart"));
    }, 0);
  };

  const fetchCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
      notifyCartUpdated(data);
    } catch (err) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  };

  const getItemId = (item) => {
    return item?.id || item?._id || item?.cartItemId || item?.productId;
  };

  const handleQuantityChange = async (targetItem, newQuantity) => {
    const itemId = getItemId(targetItem);
    if (!itemId || newQuantity < 1) return;

    setUpdatingId(itemId);
    const previousCart = cart;

    // 1. Optimistic Update
    setCart((prevCart) => {
      if (!prevCart) return prevCart;
      const updatedItems = (prevCart.items || []).map((item) => {
        if (getItemId(item) === itemId) {
          const unitPrice = item.finalPrice ?? item.price ?? 0;
          return {
            ...item,
            quantity: newQuantity,
            lineTotal: unitPrice * newQuantity,
          };
        }
        return item;
      });

      const totalItems = updatedItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
      const totalAmount = updatedItems.reduce((acc, curr) => {
        return acc + (curr.lineTotal ?? ((curr.finalPrice ?? curr.price ?? 0) * curr.quantity));
      }, 0);

      const updatedCart = { ...prevCart, items: updatedItems, totalItems, totalAmount };
      notifyCartUpdated(updatedCart);
      return updatedCart;
    });

    try {
      // 2. Server API call
      const updated = await updateCartItem(itemId, newQuantity);
      if (updated && updated.items) {
        setCart(updated);
        notifyCartUpdated(updated);
      }
    } catch (err) {
      console.error("Failed to update item quantity:", err);
      setCart(previousCart);
      notifyCartUpdated(previousCart);
      alert(err.response?.data?.message || err.response?.data || "Failed to update quantity.");
    } finally {
      setUpdatingId(null);
    }
  };

 const handleRemove = async (targetItem) => {
     const itemId = getItemId(targetItem);
     if (!itemId) return;

     setUpdatingId(itemId);
     const previousCart = cart;

     try {
       const updated = await removeCartItem(itemId);
       setCart(updated);
       notifyCartUpdated(updated);
     } catch (err) {
       console.error("Failed to remove item:", err);
       setCart(previousCart);
       alert(err.response?.data?.message || err.response?.data || "Failed to remove item.");
     } finally {
       setUpdatingId(null);
     }
   };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading your cart…</p>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-8">
          My Cart
        </h1>

        {items.length === 0 ? (
          <div className="text-center mt-16 bg-white border border-stone-100 rounded-2xl py-16 px-6">
            <h2 className="text-2xl font-semibold text-slate-700">
              Your cart is empty
            </h2>
            <p className="text-slate-500 mt-2">
              Browse the marketplace and add something you like.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="mt-6 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-lg font-semibold transition cursor-pointer"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => {
                const itemId = getItemId(item);
                const key = itemId || `cart-item-${index}`;
                const hasDiscount = (item.discountPercentage ?? 0) > 0;

                return (
                  <div
                    key={key}
                    className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 flex gap-4 items-center"
                  >
                    <img
                      src={item.imageUrl || FALLBACK_IMAGE}
                      alt={item.productName}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGE;
                      }}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {item.productName}
                      </h3>

                      <div className="flex items-baseline gap-2 mt-1">
                        {hasDiscount && (
                          <span className="text-slate-400 line-through text-sm">
                            ₹{item.price}
                          </span>
                        )}
                        <span className="text-amber-600 font-semibold">
                          ₹{item.finalPrice ?? item.price}
                        </span>
                        {hasDiscount && (
                          <span className="bg-rose-50 text-rose-600 text-xs font-bold px-1.5 py-0.5 rounded">
                            {Math.round(item.discountPercentage)}% OFF
                          </span>
                        )}
                      </div>

                      {item.availableStock && item.quantity >= item.availableStock && (
                        <p className="text-xs text-orange-500 mt-1">
                          Max available: {item.availableStock}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) {
                            handleRemove(item);
                          } else {
                            handleQuantityChange(item, item.quantity - 1);
                          }
                        }}
                        disabled={updatingId === itemId}
                        className="w-8 h-8 rounded-lg border border-stone-300 text-slate-600 hover:bg-stone-100 disabled:opacity-40 transition cursor-pointer"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        disabled={
                          updatingId === itemId ||
                          (item.availableStock && item.quantity >= item.availableStock)
                        }
                        className="w-8 h-8 rounded-lg border border-stone-300 text-slate-600 hover:bg-stone-100 disabled:opacity-40 transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right w-24">
                      <p className="font-bold text-slate-900">
                        ₹{item.lineTotal ?? ((item.finalPrice || item.price) * item.quantity)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemove(item)}
                      disabled={updatingId === itemId}
                      className="text-rose-500 hover:text-rose-700 text-sm font-medium transition cursor-pointer disabled:opacity-50"
                    >
                      {updatingId === itemId ? "Removing..." : "Remove"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 h-fit">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Order Summary
              </h2>

              <div className="flex justify-between text-slate-600 mb-2">
                <span>Items ({cart?.totalItems ?? items.reduce((a, b) => a + (b.quantity || 1), 0)})</span>
                <span>₹{cart?.totalAmount ?? 0}</span>
              </div>

              <div className="flex justify-between text-xl font-bold text-slate-900 border-t border-stone-100 pt-4 mt-4">
                <span>Total</span>
                <span>₹{cart?.totalAmount ?? 0}</span>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full mt-6 bg-emerald-700 hover:bg-emerald-800 text-white py-3 rounded-lg font-semibold transition cursor-pointer"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate("/products")}
                className="w-full mt-3 border border-stone-300 text-slate-700 hover:bg-stone-100 py-3 rounded-lg font-medium transition cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;