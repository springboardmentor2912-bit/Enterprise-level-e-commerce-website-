import api from "./api";

// =========================
// CREATE ORDER
// =========================

export const createOrder = async (orderData) => {

    const token =
        localStorage.getItem("token");

    return api.post(
        "/orders",
        orderData,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );
};


// =========================
// GET MY ORDERS
// =========================

export const getMyOrders = async () => {

    const token =
        localStorage.getItem("token");

    return api.get(
        "/orders/my-orders",
        {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );
};


// =========================
// GET ORDER BY ID
// =========================

export const getOrderById = async (orderId) => {

    const token =
        localStorage.getItem("token");

    return api.get(
        `/orders/${orderId}`,
        {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );
};


// =========================
// CANCEL ORDER
// =========================

export const cancelOrder = async (orderId) => {

    const token =
        localStorage.getItem("token");

    return api.put(
        `/orders/${orderId}/cancel`,
        {},
        {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );
};


// =========================
// REQUEST RETURN
// =========================

export const requestReturn = async (orderId) => {

    const token =
        localStorage.getItem("token");

    return api.put(
        `/orders/${orderId}/return`,
        {},
        {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        }
    );
};
