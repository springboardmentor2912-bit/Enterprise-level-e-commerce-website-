import axiosClient from './axiosClient'

export const returnApi = {
  request: (orderId, payload) => axiosClient.post(`/orders/${orderId}/return`, payload),
  mine: () => axiosClient.get('/orders/returns/mine'),
  // Admin
  pending: (params) => axiosClient.get('/admin/returns/pending', { params }),
  approve: (returnId, notes) => axiosClient.post(`/admin/returns/${returnId}/approve`, null, { params: { notes } }),
  reject: (returnId, notes) => axiosClient.post(`/admin/returns/${returnId}/reject`, null, { params: { notes } }),
}
