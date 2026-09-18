import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

// Async Thunks
export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get('/categories');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
  }
});

export const fetchFeaturedProducts = createAsyncThunk('products/fetchFeaturedProducts', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get('/products/featured');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch featured products');
  }
});

export const fetchNewArrivals = createAsyncThunk('products/fetchNewArrivals', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get('/products/new-arrivals');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch new arrivals');
  }
});

export const fetchBestSellers = createAsyncThunk('products/fetchBestSellers', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get('/products/best-sellers');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch best sellers');
  }
});

export const fetchCatalogProducts = createAsyncThunk('products/fetchCatalogProducts', async (params, { rejectWithValue }) => {
  try {
    const response = await axiosClient.get('/products/filter', { params });
    return response.data;
  } catch (err) {
    // Fallback to basic products endpoint if filter structure is simple
    try {
      const fallbackResponse = await axiosClient.get('/products', { params });
      return {
        content: fallbackResponse.data,
        totalPages: 1,
        totalElements: fallbackResponse.data.length,
        number: 0
      };
    } catch (fallbackErr) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch catalog products');
    }
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    categories: [],
    featuredProducts: [],
    newArrivals: [],
    bestSellers: [],
    selectedProduct: null,
    reviews: [],
    loading: false,
    categoryLoading: false,
    categoryError: null,
    error: null,
    pagination: {
      page: 0,
      totalPages: 1,
      totalElements: 0,
      size: 12
    },
    filters: {
      search: '',
      categoryId: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      sort: 'newest'
    }
  },
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setReviews: (state, action) => {
      state.reviews = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        categoryId: '',
        brand: '',
        minPrice: '',
        maxPrice: '',
        rating: '',
        sort: 'newest'
      };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoryLoading = true;
        state.categoryError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoryLoading = false;
        state.categories = action.payload;
        state.categoryError = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoryLoading = false;
        state.categoryError = action.payload || 'Failed to load categories';
      })
      // Featured
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload;
      })
      // New Arrivals
      .addCase(fetchNewArrivals.fulfilled, (state, action) => {
        state.newArrivals = action.payload;
      })
      // Best Sellers
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.bestSellers = action.payload;
      })
      // Catalog Products
      .addCase(fetchCatalogProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCatalogProducts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.content) {
          state.products = action.payload.content;
          state.pagination.totalPages = action.payload.totalPages || 1;
          state.pagination.totalElements = action.payload.totalElements || action.payload.content.length;
          state.pagination.page = action.payload.number || 0;
        } else if (Array.isArray(action.payload)) {
          state.products = action.payload;
          state.pagination.totalPages = 1;
          state.pagination.totalElements = action.payload.length;
          state.pagination.page = 0;
        }
      })
      .addCase(fetchCatalogProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setProducts,
  setCategories,
  setSelectedProduct,
  setReviews,
  setFilters,
  resetFilters,
  setLoading,
  setError,
} = productSlice.actions;

export default productSlice.reducer;
