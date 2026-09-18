import api from "./axios";

// Customer APIs
export const requestReturn = (orderId, orderItemId, reason) =>
  api.post("/customer/returns/request", null, { params: { orderId, orderItemId, reason } });

export const getMyReturns = () => api.get("/customer/returns/my-returns");

// Admin APIs
export const getAllReturns = () => api.get("/admin/returns");

export const updateReturnStatus = (id, status, restock = false) =>
  api.put(`/admin/returns/${id}/status`, null, { params: { status, restock } });

export const processRefund = (id) => api.post(`/admin/returns/${id}/refund`);