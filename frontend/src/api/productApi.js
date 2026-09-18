import api from "./axios";

export const getProducts = () =>
  api.get("/products");

export const getProduct = (id) =>
  api.get(`/products/${id}`);

export const searchProducts = (keyword) =>
  api.get(`/products/search?keyword=${keyword}`);

export const filterByCategory = (name) =>
  api.get(`/products/category?name=${name}`);

export const filterByPrice = (min, max) =>
  api.get(`/products/price?min=${min}&max=${max}`);
