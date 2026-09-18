import api from './api';

// ---- Customer: browse currently-available coupons on the checkout page ----
// Returns every currently-valid coupon, each flagged eligible/ineligible
// against this specific order's subtotal (with an estimated discount, or
// a "add ₹X more" message respectively).
export const getAvailableCoupons = async ({ productId, quantity } = {}) => {
  const response = await api.post('/coupons/available', { productId, quantity });
  return response.data;
};

// ---- Customer: preview/apply a coupon on the checkout page ----
// productId/quantity are only needed in "Buy Now" mode; omit them to
// validate against the customer's current cart instead.
export const applyCoupon = async ({ code, productId, quantity }) => {
  const response = await api.post('/coupons/apply', { code, productId, quantity });
  return response.data;
};

// ---- Admin: coupon management ----
export const getAdminCoupons = async () => {
  const response = await api.get('/admin/coupons');
  return response.data;
};

export const createCoupon = async (payload) => {
  const response = await api.post('/admin/coupons', payload);
  return response.data;
};

export const updateCoupon = async (id, payload) => {
  const response = await api.put(`/admin/coupons/${id}`, payload);
  return response.data;
};

export const deleteCoupon = async (id) => {
  const response = await api.delete(`/admin/coupons/${id}`);
  return response.data;
};

export const setCouponStatus = async (id, active) => {
  const response = await api.patch(`/admin/coupons/${id}/status`, { active });
  return response.data;
};

export const getCouponAnalytics = async () => {
  const response = await api.get('/admin/coupons/analytics');
  return response.data;
};

export const getCouponUsages = async () => {
  const response = await api.get('/admin/coupons/usages');
  return response.data;
};