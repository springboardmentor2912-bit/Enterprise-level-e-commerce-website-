import api from "./axios";

export const getWarehouseOrders = () => api.get("/warehouse/orders");
export const pickItem = (id) => api.post(`/warehouse/fulfillment/${id}/pick`);
export const packItem = (id) => api.post(`/warehouse/fulfillment/${id}/pack`);
export const readyForShipment = (id) => api.post(`/warehouse/fulfillment/${id}/ready`);