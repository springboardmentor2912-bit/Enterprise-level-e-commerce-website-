import API from "./api";

export const registerUser = (userData) =>
  API.post("/auth/register", userData);

export const loginUser = (loginData) =>
  API.post("/auth/login", loginData);
export const resetPassword = ({ token, newPassword }) =>
  API.post("/auth/reset-password", { token, newPassword });
export const forgotPassword = ({ email }) =>
  API.post("/auth/forgot-password", { email });