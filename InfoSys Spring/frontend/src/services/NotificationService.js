import axios from 'axios'
import { API_BASE_URL } from '../config/env'

const API_URL = `${API_BASE_URL}/notifications`

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {}
}

const NotificationService = {
  async getNotifications(userId) {
    const response = await axios.get(`${API_URL}/${userId}`, { headers: getHeaders() })
    return response.data
  },

  async getUnreadCount(userId) {
    const response = await axios.get(`${API_URL}/${userId}/unread-count`, { headers: getHeaders() })
    return response.data.count
  },

  async markAsRead(notificationId) {
    const response = await axios.put(`${API_URL}/${notificationId}/read`, {}, { headers: getHeaders() })
    return response.data
  },

  async markAllAsRead(userId) {
    await axios.put(`${API_URL}/user/${userId}/read-all`, {}, { headers: getHeaders() })
  }
}

export default NotificationService
