import api from "axios";



const getHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ---------- Products ----------
export const getProducts = () => 
  api.get(`${BASE_URL}/products`);

export const getProductById = (id) => 
  api.get(`${BASE_URL}/products/${id}`, { headers: getHeaders() });

// ---------- Wishlist ----------
export const getWishlist = () =>
  api.get(`${BASE_URL}/customer/wishlist`, { headers: getHeaders() });

export const addToWishlist = (productId) =>
  api.post(`${BASE_URL}/customer/wishlist`, { productId }, { headers: getHeaders() });

export const removeFromWishlist = (productId) =>
  api.delete(`${BASE_URL}/customer/wishlist/${productId}`, { headers: getHeaders() });

// ---------- Cart ----------
export const getCart = () =>
  api.get(`${BASE_URL}/customer/cart`, { headers: getHeaders() });

export const addToCart = (productId, quantity = 1) =>
  api.post(`${BASE_URL}/customer/cart`, { productId, quantity }, { headers: getHeaders() });

export const updateCartQty = (id, quantity) =>
  api.put(`${BASE_URL}/customer/cart/${id}`, { productId: id, quantity }, { headers: getHeaders() });

export const removeCartItem = (id) =>
  api.delete(`${BASE_URL}/customer/cart/${id}`, { headers: getHeaders() });

export const clearCart = () =>
  api.delete(`${BASE_URL}/customer/cart`, { headers: getHeaders() });

// ---------- Orders ----------
export const getMyOrders = () => 
  api.get(`${BASE_URL}/customer/orders`, { headers: getHeaders() });

export const cancelOrder = (id) => 
  api.put(`${BASE_URL}/customer/orders/${id}/cancel`, {}, { headers: getHeaders() });

// ---------- Profile ----------
export const getProfile = () => 
  api.get(`${BASE_URL}/customer/profile`, { headers: getHeaders() });

export const updateProfile = (data) => 
  api.put(`${BASE_URL}/customer/profile`, data, { headers: getHeaders() });

// ---------- ADDRESS MANAGEMENT ----------
export const getAddresses = () =>
  api.get(`${BASE_URL}/customer/address`, { headers: getHeaders() });

export const addAddress = (address) =>
  api.post(`${BASE_URL}/customer/address`, address, { headers: getHeaders() });

export const updateAddress = (id, address) =>
  api.put(`${BASE_URL}/customer/address/${id}`, address, { headers: getHeaders() });

export const deleteAddress = (id) =>
  api.delete(`${BASE_URL}/customer/address/${id}`, { headers: getHeaders() });

export const setDefaultAddress = (id) =>
  api.put(`${BASE_URL}/customer/address/${id}/default`, {}, { headers: getHeaders() });

  export const validateCoupon = (code, orderTotal) =>
  api.get(`${BASE_URL}/customer/coupons/validate`, {
    params: { code, orderTotal },
    headers: getHeaders(),
  });