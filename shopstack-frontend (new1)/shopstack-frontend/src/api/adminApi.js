import axiosClient from './axiosClient'

export const adminApi = {
  pendingVendors: (params) => axiosClient.get('/admin/vendors/pending', { params }),
  approveVendor: (vendorId) => axiosClient.post(`/admin/vendors/${vendorId}/approve`),
  rejectVendor: (vendorId) => axiosClient.post(`/admin/vendors/${vendorId}/reject`),
  pendingProducts: (params) => axiosClient.get('/admin/products/pending', { params }),
  approveProduct: (productId) => axiosClient.post(`/admin/products/${productId}/approve`),
  rejectProduct: (productId) => axiosClient.post(`/admin/products/${productId}/reject`),
  updateOrderStatus: (orderId, status) => axiosClient.patch(`/admin/orders/${orderId}/status`, null, { params: { status } }),
  analytics: () => axiosClient.get('/admin/analytics'),
  downloadReport: (reportName) => axiosClient.get(`/admin/reports/${reportName}.csv`, { responseType: 'blob' }),
}
