import axiosClient from './axiosClient'

export const wishlistApi = {
  get: () => axiosClient.get('/wishlist'),
  add: (productId) => axiosClient.post(`/wishlist/${productId}`),
  remove: (productId) => axiosClient.delete(`/wishlist/${productId}`),
}
