import api from './api';

// 1. Get all products (Public Marketplace)
export const getAllProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

// 2. Get product by ID
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// 3. Search products by query
export const searchProducts = async (query) => {
  const response = await api.get('/products/search', {
    params: { query }
  });
  return response.data;
};

// 4. Get products by category
export const getProductsByCategory = async (categoryId) => {
  const response = await api.get(`/products/category/${categoryId}`);
  return response.data;
};

// 5. Get only the logged-in vendor's own products (for My Products / Inventory)
export const getVendorProducts = async () => {
  const response = await api.get('/products/vendor');
  return response.data;
};

// 6. Add new product
export const addProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

// 7. Update product
export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

// 8. Delete product

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};
// 9. Inventory: Update stock quantity
export const updateStockQuantity = async (id, stockQuantity) => {
  const response = await api.put(`/products/${id}/stock`, { stockQuantity });
  return response.data;
};

// 10. Inventory: Reduce stock on order purchase
export const reduceStockOnOrder = async (id, quantity) => {
  const response = await api.post(`/products/${id}/reduce-stock`, { quantity });
  return response.data;
};

// 11. Pricing: Set (or clear, with 0) a discount percentage
export const updateProductDiscount = async (id, discountPercentage) => {
  const response = await api.put(`/products/${id}/discount`, { discountPercentage });
  return response.data;
};

// Default export object containing all methods
const productService = {
  getAllProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  getVendorProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  updateStockQuantity,
  reduceStockOnOrder,
  updateProductDiscount,
};

export default productService;