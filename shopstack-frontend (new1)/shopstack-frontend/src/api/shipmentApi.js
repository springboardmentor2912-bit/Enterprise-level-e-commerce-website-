import axiosClient from './axiosClient'

export const shipmentApi = {
  track: (orderId) => axiosClient.get(`/orders/${orderId}/shipment`),
  // Warehouse/Admin
  ship: (orderId, payload) => axiosClient.post(`/warehouse/orders/${orderId}/ship`, payload),
  staffView: (orderId) => axiosClient.get(`/warehouse/orders/${orderId}/shipment`),
  updateStatus: (orderId, status) => axiosClient.patch(`/warehouse/orders/${orderId}/shipment-status`, null, { params: { status } }),
}
