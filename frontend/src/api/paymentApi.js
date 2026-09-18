import api from "axios";



const getHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};



  export const initiatePayment = (couponCode) =>
  api.post(`${BASE_URL}/customer/payments/initiate`, {}, {
    params: couponCode ? { couponCode } : {},
    headers: getHeaders(),
  });

export const verifyPayment = (payload, addressId, couponCode) =>
  api.post(`${BASE_URL}/customer/payments/verify`, payload, {
    params: { addressId, ...(couponCode ? { couponCode } : {}) },
    headers: getHeaders(),
  });

export const placeCodOrder = (addressId, couponCode) =>
  api.post(`${BASE_URL}/customer/payments/cod`, {}, {
    params: { addressId, ...(couponCode ? { couponCode } : {}) },
    headers: getHeaders(),
  });