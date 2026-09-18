import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/users`;

const getToken = () => localStorage.getItem("token");

export const getProfile = () => {
  return axios.get(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });
};

export const updateProfile = (userData) => {
  return axios.put(`${API_URL}/profile`, userData, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });
};