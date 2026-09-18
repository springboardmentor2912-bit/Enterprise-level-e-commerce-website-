import api from "./axios";

// ---------- Products ----------
export const addProduct = (data) => api.post("/products", data);
export const getVendorProducts = () => api.get("/products/vendor");

// ---------- Vendor Dashboard / Analytics ----------
export const getVendorDashboard = () => api.get("/vendor/dashboard");

// ---------- Sales Monitoring ----------
export const getVendorOrders = () => api.get("/vendor/orders");
export const getVendorEarnings = () => api.get("/vendor/orders/earnings");

// ✅ Inventory & Price Management (Use these!)
export const updateStock = (id, stock) =>
  api.patch(`/vendor/products/${id}/stock`, null, { params: { stock } });

export const updatePrice = (id, price) =>
  api.patch(`/vendor/products/${id}/price`, null, { params: { price } });

export const updateDiscount = (id, discount) =>
  api.patch(`/vendor/products/${id}/discount`, null, { params: { discount } });

// ✅ Order Status Management
export const updateOrderStatus = (orderId, status) =>
  api.put(`/vendor/orders/${orderId}/status`, null, { params: { status } });

export const approveRefund = (orderId) =>
  api.put(`/vendor/orders/${orderId}/refund`);