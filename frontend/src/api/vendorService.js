import api from "./api";

export const getAllVendors = async () => {
    return api.get("/admin/vendors");
};

export const getVendorById = async (vendorId) => {
    return api.get(`/admin/vendors/${vendorId}`);
};
