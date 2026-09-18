import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    setWishlistItems: (state, action) => {
      state.items = action.payload;
    },
    setWishlistLoading: (state, action) => {
      state.loading = action.payload;
    },
    setWishlistError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setWishlistItems, setWishlistLoading, setWishlistError } = wishlistSlice.actions;
export default wishlistSlice.reducer;
