import axios from 'axios'
import { API_BASE_URL } from '../config/env'

const API_URL = `${API_BASE_URL}/products`

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {}
}

const ProductService = {
  async getAllProducts(search = '', category = '', approved = undefined) {
    const params = {}
    if (search) params.search = search
    if (category && category !== 'ALL') params.category = category
    if (approved !== undefined) params.approved = approved
    const response = await axios.get(API_URL, { params, headers: getHeaders() })
    return response.data
  },

  async getProductById(id) {
    const response = await axios.get(`${API_URL}/${id}`, { headers: getHeaders() })
    return response.data
  },

  async getVendorProducts(vendorId) {
    const response = await axios.get(`${API_URL}/vendor/${vendorId}`, { headers: getHeaders() })
    return response.data
  },

  async createProduct(productData) {
    const response = await axios.post(API_URL, productData, { headers: getHeaders() })
    return response.data
  },

  async updateProduct(id, productData) {
    const response = await axios.put(`${API_URL}/${id}`, productData, { headers: getHeaders() })
    return response.data
  },

  async deleteProduct(id) {
    const response = await axios.delete(`${API_URL}/${id}`, { headers: getHeaders() })
    return response.data
  }
}

export default ProductService
