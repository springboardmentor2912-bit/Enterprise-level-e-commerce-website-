import axios from 'axios'
import { API_BASE_URL } from '../config/env'

const BASE = `${API_BASE_URL}/warehouse`

const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {}
}

const WarehouseService = {
  // ── Warehouse CRUD ──────────────────────────────────────────────
  async getWarehouses() {
    const res = await axios.get(BASE, { headers: getHeaders() })
    return res.data
  },

  async getWarehouseById(id) {
    const res = await axios.get(`${BASE}/${id}`, { headers: getHeaders() })
    return res.data
  },

  async createWarehouse(data) {
    const res = await axios.post(BASE, data, { headers: getHeaders() })
    return res.data
  },

  async updateWarehouse(id, data) {
    const res = await axios.put(`${BASE}/${id}`, data, { headers: getHeaders() })
    return res.data
  },

  // ── Inventory ───────────────────────────────────────────────────
  async getInventory(warehouseId) {
    const res = await axios.get(`${BASE}/${warehouseId}/inventory`, { headers: getHeaders() })
    return res.data
  },

  async inwardStock(warehouseId, data) {
    const res = await axios.post(`${BASE}/${warehouseId}/inward`, data, { headers: getHeaders() })
    return res.data
  },

  async adjustStock(warehouseId, data) {
    const res = await axios.post(`${BASE}/${warehouseId}/adjust`, data, { headers: getHeaders() })
    return res.data
  },

  // ── Stock Movements ─────────────────────────────────────────────
  async getStockMovements(warehouseId = null) {
    const params = warehouseId ? `?warehouseId=${warehouseId}` : ''
    const res = await axios.get(`${BASE}/movements${params}`, { headers: getHeaders() })
    return res.data
  },

  // ── Order Queue ─────────────────────────────────────────────────
  async getOrderQueue(warehouseId = null) {
    const params = warehouseId ? `?warehouseId=${warehouseId}` : ''
    const res = await axios.get(`${BASE}/orders${params}`, { headers: getHeaders() })
    return res.data
  },

  async getActiveOrders(warehouseId = null) {
    const params = warehouseId ? `?warehouseId=${warehouseId}` : ''
    const res = await axios.get(`${BASE}/orders/active${params}`, { headers: getHeaders() })
    return res.data
  },

  // ── Workflow Actions ────────────────────────────────────────────
  async pickOrder(orderId, staffId, staffName) {
    const res = await axios.put(
      `${BASE}/orders/${orderId}/pick`,
      { staffId, staffName },
      { headers: getHeaders() }
    )
    return res.data
  },

  async packOrder(orderId, staffId, staffName, note = 'Standard Box A') {
    const res = await axios.put(
      `${BASE}/orders/${orderId}/pack`,
      { staffId, staffName, note },
      { headers: getHeaders() }
    )
    return res.data
  },

  async shipOrder(orderId, carrier, trackingNumber, staffId, staffName) {
    const res = await axios.put(
      `${BASE}/orders/${orderId}/ship`,
      { carrier, trackingNumber, staffId, staffName },
      { headers: getHeaders() }
    )
    return res.data
  },

  async deliverOrder(orderId) {
    const res = await axios.put(`${BASE}/orders/${orderId}/deliver`, {}, { headers: getHeaders() })
    return res.data
  },

  // ── Analytics ───────────────────────────────────────────────────
  async getAnalytics() {
    const res = await axios.get(`${BASE}/analytics`, { headers: getHeaders() })
    return res.data
  },

  // ── Staff Assignment ────────────────────────────────────────────
  async assignStaffWarehouse(userId, warehouseId) {
    const res = await axios.put(
      `${BASE}/staff/${userId}/assign`,
      { warehouseId },
      { headers: getHeaders() }
    )
    return res.data
  },

  async getWarehouseStaff() {
    const res = await axios.get(`${BASE}/staff`, { headers: getHeaders() })
    return res.data
  },
}

export default WarehouseService
