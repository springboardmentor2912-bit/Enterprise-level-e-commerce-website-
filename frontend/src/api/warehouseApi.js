import api from './axios';

export const warehouseApi = {
  // Warehouse CRUD
  getAll: () => api.get('/warehouses'),
  getById: (id) => api.get(`/warehouses/${id}`),
  create: (data) => api.post('/warehouses', data),
  update: (id, data) => api.put(`/warehouses/${id}`, data),
  toggleStatus: (id) => api.put(`/warehouses/${id}/toggle-status`),
  delete: (id) => api.delete(`/warehouses/${id}`),

  // Inventory & Stock
  getInventoryByWarehouse: (warehouseId) => api.get(`/warehouses/${warehouseId}/inventory`),
  getAllInventory: () => api.get('/warehouses/inventory/all'),
  checkAvailability: (productId, quantity = 1) => api.get(`/warehouses/availability?productId=${productId}&quantity=${quantity}`),
  restock: (warehouseId, data) => api.post(`/warehouses/${warehouseId}/inventory/restock`, data),

  // Allocations & Fulfillment Lifecycle
  getAllocations: (params) => api.get('/warehouses/allocations', { params }),
  autoAllocateOrder: (orderId) => api.post(`/warehouses/allocations/auto-allocate/${orderId}`),
  manualAllocate: (data) => api.post('/warehouses/allocations/manual-allocate', data),
  pickItem: (allocationId, data) => api.post(`/warehouses/allocations/${allocationId}/pick`, data),
  packItem: (allocationId, data) => api.post(`/warehouses/allocations/${allocationId}/pack`, data),
  prepareShipment: (allocationId, data) => api.post(`/warehouses/allocations/${allocationId}/prepare-shipment`, data),
  dispatchItem: (allocationId) => api.post(`/warehouses/allocations/${allocationId}/dispatch`),
  deliverItem: (allocationId) => api.post(`/warehouses/allocations/${allocationId}/deliver`),

  // Audit Logs & Analytics
  getStockMovements: (params) => api.get('/warehouses/stock-movements', { params }),
  getAnalyticsSummary: () => api.get('/warehouses/analytics/summary'),

  // Customer Returns & QC Inspection
  requestReturn: (data) => api.post('/warehouses/returns/request', data),
  getAllReturns: (params) => api.get('/warehouses/returns', { params }),
  getMyReturns: () => api.get('/warehouses/returns/my-returns'),
  reviewReturn: (id, data) => api.post(`/warehouses/returns/${id}/review`, data),
  receiveReturn: (id) => api.post(`/warehouses/returns/${id}/receive`),
  performQcInspection: (id, data) => api.post(`/warehouses/returns/${id}/qc-inspect`, data),

  // Vendor Stock Transfer to Warehouses
  transferVendorStock: (data) => api.post('/warehouses/vendor-stock-transfer', data),
};

