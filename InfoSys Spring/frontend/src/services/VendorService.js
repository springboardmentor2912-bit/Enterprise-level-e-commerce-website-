import axios from 'axios'
import { API_BASE_URL } from '../config/env'

const API_URL = `${API_BASE_URL}/vendor`

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {}
}

const VendorService = {
  async getVendorProfile(userId) {
    const response = await axios.get(`${API_URL}/profile/${userId}`, { headers: getHeaders() })
    return response.data
  },

  async updateVendorProfile(userId, profileData) {
    const response = await axios.put(`${API_URL}/profile/${userId}`, profileData, { headers: getHeaders() })
    return response.data
  },

  async getVendorStats(userId) {
    const response = await axios.get(`${API_URL}/stats/${userId}`, { headers: getHeaders() })
    return response.data
  }
}

export default VendorService
