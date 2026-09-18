import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/users`;

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getProfile = async () => {
  return await axios.get(`${API_URL}/profile`, {
    headers: authHeader()
  });
};

export const updateProfile = async (userData) => {
  return await axios.put(`${API_URL}/profile`, userData, {
    headers: authHeader()
  });
};