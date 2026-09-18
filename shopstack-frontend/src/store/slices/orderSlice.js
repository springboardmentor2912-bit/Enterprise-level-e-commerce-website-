import { createSlice } from '@reduxjs/toolkit';

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    customerOrders: [],
    vendorSalesOrders: [],
    loading: false,
    error: null,
  },
  reducers: {
    setCustomerOrders: (state, action) => {
      state.customerOrders = action.payload;
    },
    updateCustomerOrder: (state, action) => {
      const updatedOrder = action.payload;
      const index = state.customerOrders.findIndex(o => o.id === updatedOrder.id);
      if (index !== -1) {
        state.customerOrders[index] = updatedOrder;
      }
    },
    setVendorSalesOrders: (state, action) => {
      state.vendorSalesOrders = action.payload;
    },
    setOrderLoading: (state, action) => {
      state.loading = action.payload;
    },
    setOrderError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setCustomerOrders, updateCustomerOrder, setVendorSalesOrders, setOrderLoading, setOrderError } = orderSlice.actions;
export default orderSlice.reducer;
