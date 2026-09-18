
import api from './api';

// ---- Customer ----
export const requestReturn = async (orderItemId, reason) => {
  const response = await api.post(
    `/returns/items/${orderItemId}`,
    { reason }
  );

  return response.data;
};

export const getMyReturnRequests = async () => {
  const response = await api.get('/returns/mine');
  return response.data;
};

// ---- Vendor (read-only visibility — approve/reject/QC now live with admin) ----
export const getVendorReturnRequests = async () => {
  const response = await api.get('/returns/vendor');
  return response.data;
};

// ---- Admin ----
export const getAllReturnRequests = async () => {
  const response = await api.get('/admin/returns');
  return response.data;
};

export const approveReturn = async (
  returnRequestId,
  resolutionNote
) => {
  const url = `/admin/returns/${returnRequestId}/approve`;

  /*
   * The backend accepts the request body as optional.
   *
   * When the admin approves without entering a note, don't send
   * an empty JSON object. This keeps the request compatible with
   * @RequestBody(required = false) in AdminReturnController.
   */
  const response = resolutionNote
    ? await api.put(url, { resolutionNote })
    : await api.put(url);

  return response.data;
};

export const rejectReturn = async (
  returnRequestId,
  resolutionNote
) => {
  const response = await api.put(
    `/admin/returns/${returnRequestId}/reject`,
    { resolutionNote }
  );

  return response.data;
};

const returnService = {
  requestReturn,
  getMyReturnRequests,
  getVendorReturnRequests,
  getAllReturnRequests,
  approveReturn,
  rejectReturn,
};

export default returnService;

