import api from './api';

// Every call here is scoped server-side to the logged-in staff member's
// own assigned warehouse — there is no warehouseId parameter to pass.

export const getMyProfile = async () => {
  const response = await api.get('/warehouse-staff/me');
  return response.data;
};

// ---- Stock & movement visibility ----
export const getMyStock = async () => {
  const response = await api.get('/warehouse-staff/stock');
  return response.data;
};

export const getMyMovements = async () => {
  const response = await api.get('/warehouse-staff/movements');
  return response.data;
};

// ---- Fulfillment queue ----
// status: 'ALLOCATED' (to pick) | 'PICKED' (to pack) | 'PACKED' (to ship) | 'READY_FOR_SHIPMENT'
export const getMyQueue = async (status) => {
  const response = await api.get(`/warehouse-staff/queue/${status}`);
  return response.data;
};

export const pickAllocation = async (allocationId) => {
  const response = await api.patch(`/warehouse-staff/allocations/${allocationId}/pick`);
  return response.data;
};

export const packAllocation = async (allocationId) => {
  const response = await api.patch(`/warehouse-staff/allocations/${allocationId}/pack`);
  return response.data;
};

export const markReadyForShipment = async (allocationId) => {
  const response = await api.patch(`/warehouse-staff/allocations/${allocationId}/ready`);
  return response.data;
};

// ---- Return QC inbox ----
export const getMyReturnsForQC = async () => {
  const response = await api.get('/warehouse-staff/returns');
  return response.data;
};

// result: "ACCEPTED" or "DAMAGED"
export const performQualityCheck = async (returnRequestId, result, note) => {
  const response = await api.put(`/warehouse-staff/returns/${returnRequestId}/qc`, { result, note });
  return response.data;
};

const warehouseStaffService = {
  getMyProfile,
  getMyStock,
  getMyMovements,
  getMyQueue,
  pickAllocation,
  packAllocation,
  markReadyForShipment,
  getMyReturnsForQC,
  performQualityCheck,
};

export default warehouseStaffService;
