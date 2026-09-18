import api from "./axios";

export const getCategories = () =>
  api.get("/categories");