import axios from 'axios'
import { API_BASE_URL } from '../config/env'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`
      console.log(`[Axios Interceptor] Attaching token to ${config.method.toUpperCase()} ${config.url}`);
    } else {
      console.warn(`[Axios Interceptor] No token found in localStorage for ${config.method.toUpperCase()} ${config.url}`);
    }
    return config
  },
  (error) => Promise.reject(error)
)

const AuthService = {
  async register(username, email, password, role = 'CUSTOMER') {
    const response = await api.post('/auth/register', { username, email, password, role })
    return response.data
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response.data
  },

  logout() {
    localStorage.removeItem('user')
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user') || 'null')
  },

  async getUserProfile() {
    const response = await api.get('/users/profile')
    return response.data
  },

  async updateUserProfile(profileData) {
    const response = await api.put('/users/profile', profileData)
    const user = this.getCurrentUser()
    if (user) {
      const updatedUser = {
        ...user,
        username: response.data.username,
        email: response.data.email
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
    return response.data
  },

  isLoggedIn() {
    const user = this.getCurrentUser()
    return !!user?.token
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  async resetPassword(token, newPassword) {
    const response = await api.post('/auth/reset-password', { token, newPassword })
    return response.data
  },

  async verifyResetToken(token) {
    const response = await api.get(`/auth/verify-reset-token?token=${token}`)
    return response.data
  },
}

export default AuthService
