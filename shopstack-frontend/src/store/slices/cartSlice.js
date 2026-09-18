import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    setCartItems: (state, action) => {
      state.items = action.payload;
    },
    setCartLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCartError: (state, action) => {
      state.error = action.payload;
    },
    clearCartState: (state) => {
      state.items = [];
    },
  },
});

export const { setCartItems, setCartLoading, setCartError, clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
