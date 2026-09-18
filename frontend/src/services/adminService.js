import api from './api';
export const getDashboardSummary = async () => {
  const response = await api.get('/admin/dashboard/summary');
  return response.data;
};
export const getAdminVendors = async () => {
  const response = await api.get('/admin/vendors');
  return response.data;
};
export const approveVendor = async (vendorId) => {
  const response = await api.patch(`/admin/vendors/${vendorId}/approve`);
  return response.data;
};
export const rejectVendor = async   (vendorId) => {
  const response = await api.patch(`/admin/vendors/${vendorId}/reject`);
  return response.data;
};
export const getAdminOrders = async () => {
  const response = await api.get('/admin/orders');
  return response.data;
};
export const getAdminCommissions = async () => {
  const response = await api.get('/admin/commissions');
  return response.data;
};
export const getAdminCommissionDetails = async () => {
  const response = await api.get('/admin/commissions/details');
  return response.data;
};
export const updateCommissionStatus = async (commissionId, status) => {
  const response = await api.patch(`/admin/commissions/${commissionId}/status`, { status });
  return response.data;
};
export const getSystemStatus = async () => {
  const response = await api.get('/admin/system/status');
  return response.data;
};
export const getAdminReport = async () => {
  const response = await api.get('/admin/reports/business');
  return response.data;
};
export const markOrderItemDelivered = async (itemId) => {
  const response = await api.patch(`/admin/orders/items/${itemId}/deliver`);
  return response.data;
};