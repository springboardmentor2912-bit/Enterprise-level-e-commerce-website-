import api from './api';

// Get the logged-in customer's cart
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

// Add a product to the cart (or increase quantity if it's already in there)
export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post('/cart/items', { productId, quantity });
  return response.data;
};

// Set a cart item's quantity directly
export const updateCartItem = async (itemId, quantity) => {
  const response = await api.put(`/cart/items/${itemId}`, { quantity });
  return response.data;
};

// Remove a single item from the cart
export const removeCartItem = async (itemId) => {
  const response = await api.delete(`/cart/items/${itemId}`);
  return response.data;
};

// Clear the entire cart (used after checkout)
export const clearCart = async () => {
  const response = await api.delete('/cart');
  return response.data;
};

const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};

export default cartService;