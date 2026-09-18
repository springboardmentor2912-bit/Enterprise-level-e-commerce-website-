import axios from 'axios'
import { API_BASE_URL } from '../config/env'

const API_URL = `${API_BASE_URL}/coupons`

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {}
}

const CouponService = {
  async getAllCoupons() {
    const response = await axios.get(API_URL, { headers: getHeaders() })
    return response.data
  },

  async createCoupon(couponData) {
    const response = await axios.post(API_URL, couponData, { headers: getHeaders() })
    return response.data
  },

  async updateCoupon(id, couponData) {
    const response = await axios.put(`${API_URL}/${id}`, couponData, { headers: getHeaders() })
    return response.data
  },

  async deleteCoupon(id) {
    const response = await axios.delete(`${API_URL}/${id}`, { headers: getHeaders() })
    return response.data
  },

  async toggleStatus(id) {
    const response = await axios.put(`${API_URL}/${id}/toggle`, {}, { headers: getHeaders() })
    return response.data
  },

  async toggleCouponStatus(id) {
    return this.toggleStatus(id)
  },

  async applyCoupon(code, cartAmount) {
    const response = await axios.post(`${API_URL}/apply`, { code, cartAmount }, { headers: getHeaders() })
    return response.data
  },

  async getAnalytics() {
    const response = await axios.get(`${API_URL}/analytics`, { headers: getHeaders() })
    return response.data
  },

  async getCouponAnalytics() {
    return this.getAnalytics()
  },

  async getUsageHistory() {
    const response = await axios.get(`${API_URL}/analytics`, { headers: getHeaders() })
    return response.data?.usageHistory || []
  }
}

export default CouponService

