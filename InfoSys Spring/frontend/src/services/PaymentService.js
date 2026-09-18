import axios from 'axios'
import { API_BASE_URL } from '../config/env'

const API_URL = `${API_BASE_URL}/payment`

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {}
}

const PaymentService = {
  async getRazorpayKey() {
    const response = await axios.get(`${API_URL}/key`, { headers: getHeaders() })
    return response.data
  },

  async createRazorpayOrder(userId, customerName, shippingAddress, couponCode = null) {
    const payload = { userId, customerName, shippingAddress }
    if (couponCode) payload.couponCode = couponCode
    const response = await axios.post(
      `${API_URL}/create-order`,
      payload,
      { headers: getHeaders() }
    )
    return response.data
  },

  async verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId) {
    const response = await axios.post(
      `${API_URL}/verify`,
      { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId },
      { headers: getHeaders() }
    )
    return response.data
  }
}

export default PaymentService
