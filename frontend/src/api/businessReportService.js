import api from "./api";

export const getBusinessReport = async () => {
    return api.get("/admin/reports/business");
};
