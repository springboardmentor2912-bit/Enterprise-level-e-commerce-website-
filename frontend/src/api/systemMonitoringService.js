import api from "./api";

export const getSystemStatus = async () => {
    return api.get("/admin/system/status");
};
