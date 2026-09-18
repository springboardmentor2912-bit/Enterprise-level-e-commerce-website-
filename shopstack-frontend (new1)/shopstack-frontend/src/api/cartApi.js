import axiosClient from './axiosClient'

export const cartApi = {
  get: () => axiosClient.get('/cart'),
  addItem: (payload) => axiosClient.post('/cart/items', payload),
  updateItem: (productId, quantity) => axiosClient.put(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId) => axiosClient.delete(`/cart/items/${productId}`),
  clear: () => axiosClient.delete('/cart'),
}
