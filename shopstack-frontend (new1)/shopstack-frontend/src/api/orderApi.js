import axiosClient from './axiosClient'

export const orderApi = {
  checkout: (payload) => axiosClient.post('/orders/checkout', payload),
  verifyPayment: (payload) => axiosClient.post('/orders/verify-payment', payload),
  cancel: (orderId) => axiosClient.post(`/orders/${orderId}/cancel`),
  myOrders: (params) => axiosClient.get('/orders', { params }),
  getOne: (orderId) => axiosClient.get(`/orders/${orderId}`),
}
