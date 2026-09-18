import axios from 'axios'
import { API_BASE_URL } from '../config/env'

const API_URL = `${API_BASE_URL}/customer`

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {}
}

const CustomerService = {
  async getCart(userId) {
    const response = await axios.get(`${API_URL}/cart/${userId}`, { headers: getHeaders() })
    return response.data
  },

  async addToCart(userId, productId, quantity = 1) {
    const response = await axios.post(`${API_URL}/cart/add`, { userId, productId, quantity }, { headers: getHeaders() })
    return response.data
  },

  async updateCartQuantity(cartItemId, quantity) {
    const response = await axios.put(`${API_URL}/cart/${cartItemId}`, { quantity }, { headers: getHeaders() })
    return response.data
  },

  async removeFromCart(cartItemId) {
    const response = await axios.delete(`${API_URL}/cart/${cartItemId}`, { headers: getHeaders() })
    return response.data
  },

  async checkout(userId, customerName, shippingAddress) {
    const response = await axios.post(`${API_URL}/checkout`, { userId, customerName, shippingAddress }, { headers: getHeaders() })
    return response.data
  },

  async getCustomerOrders(userId) {
    const response = await axios.get(`${API_URL}/orders/${userId}`, { headers: getHeaders() })
    return response.data
  }
}

export default CustomerService
