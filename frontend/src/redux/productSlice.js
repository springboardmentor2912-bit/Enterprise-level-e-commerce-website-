import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"; // ✅ Added createAsyncThunk
import { getProducts, searchProducts } from "../api/productApi";   // ✅ Added API imports

const initialState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (keyword = "") => {
    const response = keyword.trim()
      ? await searchProducts(keyword)   // /products/search?keyword=...
      : await getProducts();            // /products
    return response.data;
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    fetchProductsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSuccess(state, action) {
      state.loading = false;
      state.products = action.payload;
    },
    fetchProductsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedProduct(state, action) {
      state.selectedProduct = action.payload;
    },
  },
  // ✅ Add extraReducers to handle the async thunk states
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.loading = false;
        state.error = "Unable to load products";
      });
  },
});

export const {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  setSelectedProduct,
} = productSlice.actions;

export default productSlice.reducer;