import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        console.log("=================================");
        console.log("SHOPSTACK API REQUEST");
        console.log("Method:", config.method?.toUpperCase());
        console.log("URL:", config.baseURL + config.url);
        console.log("TOKEN EXISTS:", !!token);
        console.log(
            "TOKEN LENGTH:",
            token ? token.length : 0
        );
        console.log("=================================");

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;