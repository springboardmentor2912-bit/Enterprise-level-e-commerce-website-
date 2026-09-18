import api from './api';

export const getMyAccount = async () => {
  const response = await api.get('/account/me');
  return response.data;
};

// payload is optional: { businessName, phone, description }
export const becomeVendor = async (payload) => {
  const response = await api.post('/account/become-vendor', payload || {});
  return response.data;
};

const accountService = {
  getMyAccount,
  becomeVendor,
};

export default accountService;
