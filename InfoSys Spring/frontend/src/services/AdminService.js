import axios from 'axios'
import { API_BASE_URL } from '../config/env'

const API_URL = `${API_BASE_URL}/admin`

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {}
}

const AdminService = {
  async getAllUsers() {
    const response = await axios.get(`${API_URL}/users`, { headers: getHeaders() })
    return response.data
  },

  async updateUserRole(userId, role) {
    const response = await axios.put(`${API_URL}/users/${userId}/role`, { role }, { headers: getHeaders() })
    return response.data
  },

  async deleteUser(userId) {
    const response = await axios.delete(`${API_URL}/users/${userId}`, { headers: getHeaders() })
    return response.data
  },

  async getAllVendors() {
    const response = await axios.get(`${API_URL}/vendors`, { headers: getHeaders() })
    return response.data
  },

  async getVendorDetails(vendorId) {
    const response = await axios.get(`${API_URL}/vendors/${vendorId}/details`, { headers: getHeaders() })
    return response.data
  },

  async updateVendorStatus(vendorId, status) {
    const response = await axios.put(`${API_URL}/vendors/${vendorId}/status`, { status }, { headers: getHeaders() })
    return response.data
  },

  async getPlatformStats() {
    const response = await axios.get(`${API_URL}/stats`, { headers: getHeaders() })
    return response.data
  },

  async getMarketplaceAnalytics() {
    const response = await axios.get(`${API_URL}/analytics`, { headers: getHeaders() })
    return response.data
  },

  async getAllOrders() {
    const response = await axios.get(`${API_URL}/orders`, { headers: getHeaders() })
    return response.data
  },

  async updateOrderStatus(orderId, status) {
    const response = await axios.put(`${API_URL}/orders/${orderId}/status`, { status }, { headers: getHeaders() })
    return response.data
  },

  async getCommissionData() {
    const response = await axios.get(`${API_URL}/commissions`, { headers: getHeaders() })
    return response.data
  },

  async updateVendorPayoutStatus(vendorId, status) {
    const response = await axios.put(`${API_URL}/commissions/payout/${vendorId}`, { status }, { headers: getHeaders() })
    return response.data
  },

  async calculateCommission(orderAmount, commissionRate) {
    const response = await axios.post(`http://localhost:8080/api/commissions/calculate`, { orderAmount, commissionRate }, { headers: getHeaders() })
    return response.data
  },

  async updateCommissionRecordStatus(commissionId, status) {
    const response = await axios.put(`http://localhost:8080/api/commissions/${commissionId}/status`, { status }, { headers: getHeaders() })
    return response.data
  },

  async updateCommissionRate(rate) {
    const response = await axios.put(`http://localhost:8080/api/commissions/rate`, { rate }, { headers: getHeaders() })
    return response.data
  },

  async getSystemStatus() {
    const response = await axios.get(`${API_URL}/system-status`, { headers: getHeaders() })
    return response.data
  },

  async getReport(type = 'SALES') {
    const response = await axios.get(`${API_URL}/reports?type=${type}`, { headers: getHeaders() })
    return response.data
  },

  exportReportCsvUrl(type = 'SALES') {
    return `${API_URL}/reports/export?type=${type}`
  }
}

export default AdminService

