import api from "./axios";

// ---------- Dashboard ----------
export const getDashboard = () =>
  api.get("/admin/dashboard");

// ---------- Users ----------
export const getUsers = () =>
  api.get("/admin/users");

export const getCustomers = () =>
  api.get("/admin/users/customers");

export const getVendors = () =>
  api.get("/admin/users/vendors");

export const enableUser = (id) =>
  api.patch(`/admin/users/${id}/enable`);

export const disableUser = (id) =>
  api.patch(`/admin/users/${id}/disable`);

// ---------- Products ----------
export const getAllProducts = () =>
  api.get("/admin/products");

export const getPendingProducts = () =>
  api.get("/admin/products/pending");

export const approveProduct = (id) =>
  api.put(`/admin/products/${id}/approve`);

export const rejectProduct = (id) =>
  api.put(`/admin/products/${id}/reject`);

export const enableProduct = (id) =>
  api.patch(`/admin/products/${id}/enable`);

export const disableProduct = (id) =>
  api.patch(`/admin/products/${id}/disable`);

// ---------- Categories ----------
export const getCategories = () =>
  api.get("/admin/categories");

export const addCategory = (data) =>
  api.post("/admin/categories", data);

export const updateCategory = (id, data) =>
  api.put(`/admin/categories/${id}`, data);

export const deleteCategory = (id) =>
  api.delete(`/admin/categories/${id}`);

// ---------- Vendor Commission (Task 2) ----------
export const updateVendorCommission = (id, rate) =>
  api.put(`/admin/vendors/${id}/commission`, null, { params: { rate } });

export const getCoupons = () => api.get("/admin/coupons");
export const createCoupon = (data) => api.post("/admin/coupons", data);
export const updateCoupon = (id, data) => api.put(`/admin/coupons/${id}`, data);
export const toggleCoupon = (id) => api.patch(`/admin/coupons/${id}/toggle`);
export const deleteCoupon = (id) => api.delete(`/admin/coupons/${id}`);

// 🆕 Warehouse Management
export const getWarehouses = () => api.get("/admin/warehouses");

export const createWarehouse = (data) => api.post("/admin/warehouses", data);

export const assignStaffToWarehouse = (userId, warehouseId) =>
  api.put("/admin/warehouses/assign-staff", null, { params: { userId, warehouseId } });