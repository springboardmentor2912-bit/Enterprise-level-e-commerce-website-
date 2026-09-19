import axios from "axios";

const API = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

export const loginUser = (userData) => {
    return axios.post(`${API}/login`, userData);
};

export const registerUser = (userData) => {
    return axios.post(`${API}/register`, userData);
};