import axiosClient from './axiosClient'

export const vendorApi = {
  profile: () => axiosClient.get('/vendor/profile'),
  analytics: () => axiosClient.get('/vendor/analytics'),
  createProduct: (payload) => axiosClient.post('/vendor/products', payload),
  myProducts: (params) => axiosClient.get('/vendor/products', { params }),
  updateProduct: (productId, payload) => axiosClient.put(`/vendor/products/${productId}`, payload),
  updatePrice: (productId, payload) => axiosClient.patch(`/vendor/products/${productId}/price`, payload),
  deactivateProduct: (productId) => axiosClient.delete(`/vendor/products/${productId}`),
  adjustInventory: (productId, payload) => axiosClient.patch(`/vendor/products/${productId}/inventory`, payload),
  inventoryHistory: (productId) => axiosClient.get(`/vendor/products/${productId}/inventory/history`),
  lowStock: () => axiosClient.get('/vendor/inventory/low-stock'),
  orders: (params) => axiosClient.get('/vendor/orders', { params }),
  commissionSummary: () => axiosClient.get('/vendor/commission-summary'),
}
