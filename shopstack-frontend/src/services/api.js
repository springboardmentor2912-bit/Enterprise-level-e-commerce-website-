import axios from "axios";

const api = axios.create({
    baseURL: "https://shopstack-backend-l0xa.onrender.com"
});

export default api;