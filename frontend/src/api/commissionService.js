import api from "./api";

export const getCommissionReport = async () => {
    return api.get("/admin/commissions");
};
