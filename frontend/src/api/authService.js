import api from "./api";

export const loginUser = async (loginData) => {
    return api.post("/auth/login", loginData);
};

export const registerUser = async (userData) => {
    return api.post("/auth/register", userData);
};
