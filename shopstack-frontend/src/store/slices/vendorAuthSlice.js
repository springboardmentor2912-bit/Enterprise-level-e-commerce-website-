import { createSlice } from '@reduxjs/toolkit';

const initialVendorToken = localStorage.getItem('shopstack_vendor_token');
const initialVendorUser = localStorage.getItem('shopstack_vendor_user')
  ? JSON.parse(localStorage.getItem('shopstack_vendor_user'))
  : null;

const vendorAuthSlice = createSlice({
  name: 'vendorAuth',
  initialState: {
    vendor: initialVendorUser,
    token: initialVendorToken,
    isVendorAuthenticated: !!initialVendorToken,
    loading: false,
    error: null,
  },
  reducers: {
    vendorLoginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    vendorLoginSuccess: (state, action) => {
      state.loading = false;
      state.isVendorAuthenticated = true;
      state.token = action.payload.token;
      state.vendor = action.payload.vendor;
      state.error = null;

      localStorage.setItem('shopstack_vendor_token', action.payload.token);
      localStorage.setItem('shopstack_vendor_user', JSON.stringify(action.payload.vendor));
    },
    vendorLoginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    vendorLogout: (state) => {
      state.vendor = null;
      state.token = null;
      state.isVendorAuthenticated = false;
      state.error = null;

      localStorage.removeItem('shopstack_vendor_token');
      localStorage.removeItem('shopstack_vendor_user');
    },
  },
});

export const {
  vendorLoginStart,
  vendorLoginSuccess,
  vendorLoginFailure,
  vendorLogout,
} = vendorAuthSlice.actions;

export default vendorAuthSlice.reducer;
