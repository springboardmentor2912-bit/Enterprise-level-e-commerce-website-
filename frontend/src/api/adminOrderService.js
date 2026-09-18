import api from "./api";

export const getAllAdminOrders = async () => {
    return api.get("/admin/orders");
};

export const getAdminOrderById = async (orderId) => {
    return api.get(`/admin/orders/${orderId}`);
};
