import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  role: localStorage.getItem("role") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },

    loginSuccess(state, action) {
  state.loading = false;

  state.user = {
    id: action.payload.userId,
    name: action.payload.name,
    email: action.payload.email,
  };

  state.token = action.payload.token;
  state.role = action.payload.role;
  state.isAuthenticated = true;

  localStorage.setItem("token", action.payload.token);
  localStorage.setItem("role", action.payload.role);
},

    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    logout(state) {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;

      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} = authSlice.actions;

export default authSlice.reducer;