import api from "./api";

export const getAdminDashboard = async () => {
    return api.get("/admin/dashboard");
};
