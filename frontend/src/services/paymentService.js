import api from './api';
export const createRazorpayOrder = async (couponCode) => {
  const response = await api.post('/payment/create-order', null, {
    params: couponCode ? { couponCode } : {},
  });
  return response.data;
};
export const verifyPayment = async ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  addressId,
  couponCode,
}) => {
  const response = await api.post('/payment/verify', {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    addressId,
    couponCode,
  });
  return response.data;
};
export const placeCodOrder = async (addressId, couponCode) => {
  const response = await api.post('/checkout/cod', { addressId, couponCode });
  return response.data;
};
export const createRazorpayOrderForProduct = async (productId, quantity, couponCode) => {
  const response = await api.post('/payment/create-order/buy-now', {
    productId,
    quantity,
    couponCode,
  });
  return response.data;
};
export const verifyBuyNowPayment = async ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  addressId,
  productId,
  quantity,
  couponCode,
}) => {
  const response = await api.post('/payment/verify/buy-now', {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    addressId,
    productId,
    quantity,
    couponCode,
  });
  return response.data;
};
export const placeCodBuyNowOrder = async (addressId, productId, quantity, couponCode) => {
  const response = await api.post('/checkout/cod/buy-now', {
    addressId,
    productId,
    quantity,
    couponCode,
  });
  return response.data;
};