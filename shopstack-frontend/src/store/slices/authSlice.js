import { createSlice } from '@reduxjs/toolkit';

// Retrieve initial session data from localStorage if available
const initialToken = localStorage.getItem('shopstack_token');
const initialUser = localStorage.getItem('shopstack_user')
  ? JSON.parse(localStorage.getItem('shopstack_user'))
  : null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    token: initialToken,
    isAuthenticated: !!initialToken,
    loading: false,
    error: null,
    updateSuccess: false,
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.error = null;
      
      // Persist to localStorage
      localStorage.setItem('shopstack_token', action.payload.token);
      localStorage.setItem('shopstack_user', JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateProfileStart: (state) => {
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    },
    updateProfileSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.updateSuccess = true;
      state.error = null;
      
      // Update persisted user object in localStorage
      localStorage.setItem('shopstack_user', JSON.stringify(action.payload));
    },
    updateProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.updateSuccess = false;
    },
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.updateSuccess = false;
      
      // Clear localStorage session
      localStorage.removeItem('shopstack_token');
      localStorage.removeItem('shopstack_user');
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  resetUpdateSuccess,
  logout,
} = authSlice.actions;

export default authSlice.reducer;