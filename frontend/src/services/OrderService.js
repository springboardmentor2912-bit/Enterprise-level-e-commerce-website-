import api from './api';

// Converts the current cart into a real order (validates stock, snapshots
// prices, reduces stock, clears the cart — all server-side, atomically).
export const checkout = async () => {
  const response = await api.post('/checkout');
  return response.data;
};

export const getOrderHistory = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

// ---- Customer-initiated cancellation ----

export const cancelOrderItem = async (itemId) => {
  const response = await api.put(`/orders/items/${itemId}/cancel`);
  return response.data;
};

export const cancelOrder = async (orderId) => {
  const response = await api.put(`/orders/${orderId}/cancel`);
  return response.data;
};

// ---- Vendor order fulfillment ----

// Only this vendor's own line items across every order — never another
// vendor's items, even from a shared order.
export const getVendorOrderItems = async () => {
  const response = await api.get('/orders/vendor/items');
  return response.data;
};

export const updateOrderItemStatus = async (itemId, status) => {
  const response = await api.put(`/orders/items/${itemId}/status`, { status });
  return response.data;
};

const orderService = {
  checkout,
  getOrderHistory,
  getOrderById,
  cancelOrderItem,
  cancelOrder,
  getVendorOrderItems,
  updateOrderItemStatus,
};

export default orderService;