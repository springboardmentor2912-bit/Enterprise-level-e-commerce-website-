import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/categories`;

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch all categories (used to populate category dropdowns on
// Add/Edit product and the product list filter)
export const getAllCategories = () =>
  axios.get(API_URL, { headers: authHeader() });