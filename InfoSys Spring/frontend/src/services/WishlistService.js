import axios from 'axios'
import { API_BASE_URL } from '../config/env'

const API_URL = `${API_BASE_URL}/wishlist`

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {}
}

const WishlistService = {
  async getWishlist(userId) {
    if (!userId) return []
    try {
      const response = await axios.get(`${API_URL}/${userId}`, { headers: getHeaders() })
      return response.data || []
    } catch (err) {
      console.warn('Backend wishlist fetch failed, checking localStorage fallback:', err)
      const stored = localStorage.getItem(`wishlist_${userId}`)
      return stored ? JSON.parse(stored) : []
    }
  },

  async toggleWishlist(userId, productId) {
    if (!userId) throw new Error('User not logged in')
    try {
      const response = await axios.post(`${API_URL}/toggle`, { userId, productId }, { headers: getHeaders() })
      return response.data
    } catch (err) {
      console.warn('Backend toggle wishlist failed, fallback to local toggle:', err)
      const key = `wishlist_${userId}`
      const current = JSON.parse(localStorage.getItem(key) || '[]')
      const existsIndex = current.findIndex(item => item.product?.id === productId || item.productId === productId)
      let inWishlist = false
      if (existsIndex >= 0) {
        current.splice(existsIndex, 1)
        inWishlist = false
      } else {
        current.push({ id: Date.now(), userId, productId })
        inWishlist = true
      }
      localStorage.setItem(key, JSON.stringify(current))
      return { inWishlist, message: inWishlist ? 'Added to wishlist' : 'Removed from wishlist' }
    }
  },

  async addToWishlist(userId, productId) {
    const response = await axios.post(`${API_URL}/add`, { userId, productId }, { headers: getHeaders() })
    return response.data
  },

  async removeFromWishlist(userId, productId) {
    try {
      const response = await axios.delete(`${API_URL}/${userId}/${productId}`, { headers: getHeaders() })
      return response.data
    } catch (err) {
      console.warn('Backend remove from wishlist failed, clearing from local fallback:', err)
      const key = `wishlist_${userId}`
      const current = JSON.parse(localStorage.getItem(key) || '[]')
      const filtered = current.filter(item => item.product?.id !== productId && item.productId !== productId)
      localStorage.setItem(key, JSON.stringify(filtered))
      return { message: 'Removed from wishlist' }
    }
  },

  async checkWishlist(userId, productId) {
    if (!userId || !productId) return false
    try {
      const response = await axios.get(`${API_URL}/check/${userId}/${productId}`, { headers: getHeaders() })
      return !!response.data?.inWishlist
    } catch (err) {
      return false
    }
  }
}

export default WishlistService
