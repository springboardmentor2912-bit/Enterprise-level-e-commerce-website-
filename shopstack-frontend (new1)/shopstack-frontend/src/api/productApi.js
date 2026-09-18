import axiosClient from './axiosClient'

export const productApi = {
  browse: (params) => axiosClient.get('/products', { params }),
  getOne: (id) => axiosClient.get(`/products/${id}`),
  getCategories: () => axiosClient.get('/categories'),
  getReviews: (productId, params) => axiosClient.get(`/reviews/product/${productId}`, { params }),
  addReview: (productId, payload) => axiosClient.post(`/reviews/product/${productId}`, payload),
}
