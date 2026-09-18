import api from "./axios";

export const login = (data) =>
  api.post("/auth/login", data);

export const register = (data) =>
  api.post("/auth/register", data);

export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", {
    email,
  });

export const resetPassword = (data) =>
  api.post("/auth/reset-password", data);