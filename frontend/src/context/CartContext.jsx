import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('shopstack_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem('shopstack_cart', JSON.stringify(cart));
  }, [cart]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToCart = (product, quantityToAdd = 1) => {
    if (!product || product.stockQuantity <= 0 || product.status === 'OUT_OF_STOCK') {
      showToast(`Sorry, "${product?.title || 'This item'}" is currently Out of Stock.`, 'error');
      return false;
    }

    let addedSuccessfully = true;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      
      if (existingIndex > -1) {
        const currentQty = prevCart[existingIndex].quantity;
        const maxStock = product.stockQuantity;
        
        if (currentQty >= maxStock) {
          showToast(`Maximum available stock of ${maxStock} units already in your cart.`, 'warning');
          addedSuccessfully = false;
          return prevCart;
        }

        const newQty = Math.min(currentQty + quantityToAdd, maxStock);
        showToast(`Updated "${product.title}" quantity to ${newQty}.`, 'success');

        const updated = [...prevCart];
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        return updated;
      } else {
        const initialQty = Math.min(quantityToAdd, product.stockQuantity);
        showToast(`Added "${product.title}" to your cart!`, 'success');
        return [...prevCart, { product, quantity: initialQty }];
      }
    });

    setIsCartOpen(true);
    return addedSuccessfully;
  };

  const updateQuantity = (productId, newQuantity) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.product.id === productId) {
          const maxStock = item.product.stockQuantity;
          const validQty = Math.max(1, Math.min(newQuantity, maxStock));
          return { ...item, quantity: validQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.product.id === productId);
      if (item) {
        showToast(`Removed "${item.product.title}" from cart.`, 'info');
      }
      return prevCart.filter((i) => i.product.id !== productId);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const cartTotal = cart.reduce((acc, item) => {
    const price = item.product.discountPrice || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        showToast,
      }}
    >
      {children}

      {/* Floating Global Toasts */}
      {toasts.length > 0 && (
        <div className="toast-container" aria-live="polite">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`toast-item toast-${toast.type}`}
              role="alert"
            >
              {toast.type === 'success' && <CheckCircle2 size={18} style={{ flexShrink: 0 }} />}
              {toast.type === 'error' && <AlertCircle size={18} style={{ flexShrink: 0 }} />}
              {toast.type === 'warning' && <AlertTriangle size={18} style={{ flexShrink: 0 }} />}
              {toast.type === 'info' && <Info size={18} style={{ flexShrink: 0 }} />}
              <span style={{ flex: 1 }}>{toast.message}</span>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  padding: '2px',
                  opacity: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

