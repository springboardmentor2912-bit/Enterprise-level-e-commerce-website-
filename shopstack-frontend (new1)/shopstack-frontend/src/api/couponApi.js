import axiosClient from './axiosClient'

export const couponApi = {
  validate: (code, subtotal) => axiosClient.get('/coupons/validate', { params: { code, subtotal } }),
  // Admin
  list: (params) => axiosClient.get('/admin/coupons', { params }),
  create: (payload) => axiosClient.post('/admin/coupons', payload),
  deactivate: (id) => axiosClient.post(`/admin/coupons/${id}/deactivate`),
}
