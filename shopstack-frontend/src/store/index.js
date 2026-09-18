import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import vendorAuthReducer from './slices/vendorAuthSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import orderReducer from './slices/orderSlice';
import warehouseReducer from './slices/warehouseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vendorAuth: vendorAuthReducer,
    products: productReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    order: orderReducer,
    warehouse: warehouseReducer,
  },
});