import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  cartId: null,
  items: [],
  subtotal: 0,
  totalItems: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.cartId = action.payload.cartId
      state.items = action.payload.items || []
      state.subtotal = action.payload.subtotal || 0
      state.totalItems = action.payload.totalItems || 0
    },
    clearCartState: (state) => {
      state.cartId = null
      state.items = []
      state.subtotal = 0
      state.totalItems = 0
    },
  },
})

export const { setCart, clearCartState } = cartSlice.actions
export default cartSlice.reducer
