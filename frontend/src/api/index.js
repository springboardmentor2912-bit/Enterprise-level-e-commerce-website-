import api from './axios';

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

export const healthApi = {
  check: () => api.get('/health'),
};

export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getReviews: (id) => api.get(`/products/${id}/reviews`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  updateStock: (id, stockQuantity) => api.put(`/products/${id}/stock?stockQuantity=${stockQuantity}`),
  updateStatus: (id, status) => api.put(`/products/${id}/status?status=${status}`),
  delete: (id) => api.delete(`/products/${id}`),
  getByVendor: (vendorId) => api.get(`/products/vendor/${vendorId}`),
};

export const categoryApi = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
};

export const vendorApi = {
  getAll: () => api.get('/vendors'),
  getById: (id) => api.get(`/vendors/${id}`),
  getMyProfile: () => api.get('/vendors/me'),
  updateStatus: (vendorId, status) => api.put(`/vendors/admin/${vendorId}/status?status=${status}`),
  updateProfile: (data) => api.put('/vendors/profile', data),
};

export const orderApi = {
  create: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my-orders'),
  getByVendor: (vendorId) => api.get(`/orders/vendor/${vendorId}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status?status=${status}`),
};

export const paymentApi = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  handleFailure: (razorpayOrderId, reason) => api.post(`/payments/failure?razorpayOrderId=${razorpayOrderId}&reason=${encodeURIComponent(reason || '')}`),
  getMyPayments: () => api.get('/payments/my-payments'),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getAnalytics: (range = '30D') => api.get(`/admin/analytics?range=${range}`),
  getVendorsWithMetrics: () => api.get('/admin/vendors'),
  updateVendorCommission: (vendorId, commissionRate) => api.put(`/admin/vendors/${vendorId}/commission`, { commissionRate }),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  updateOrderStatus: (orderId, status) => api.put(`/admin/orders/${orderId}/status?status=${status}`),
  getCommissionSummary: () => api.get('/admin/commissions'),
  getSystemHealth: () => api.get('/admin/system/health'),
  getReport: (type = 'SALES', range = 'ALL') => api.get(`/admin/reports?type=${type}&range=${range}`),
  getUsers: () => api.get('/admin/users'),
  toggleUserStatus: (userId) => api.put(`/admin/users/${userId}/toggle-status`),
};

export const commissionApi = {
  calculate: (data) => api.post('/commissions/calculate', data),
  getAll: (params) => api.get('/commissions', { params }),
  getByVendor: (vendorId) => api.get(`/commissions/vendor/${vendorId}`),
  getByOrder: (orderId) => api.get(`/commissions/order/${orderId}`),
  getSummary: () => api.get('/commissions/summary'),
  updateStatus: (id, status) => api.put(`/commissions/${id}/status?status=${status}`),
};

export const couponApi = {
  validate: (data) => api.post('/coupons/validate', data),
  getActive: () => api.get('/coupons/active'),
  getAll: () => api.get('/coupons'),
  getById: (id) => api.get(`/coupons/${id}`),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  toggleStatus: (id) => api.put(`/coupons/${id}/toggle-status`),
  delete: (id) => api.delete(`/coupons/${id}`),
  getAnalytics: () => api.get('/coupons/analytics'),
  getUsageHistory: () => api.get('/coupons/usage'),
};

export const notificationApi = {
  getMyNotifications: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export { warehouseApi } from './warehouseApi';

