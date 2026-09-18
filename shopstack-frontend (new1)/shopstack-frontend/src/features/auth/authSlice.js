import { createSlice } from '@reduxjs/toolkit'

const storedUser = localStorage.getItem('shopstack_user')

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: localStorage.getItem('shopstack_access_token') || null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, ...user } = action.payload
      state.user = user
      state.accessToken = accessToken
      localStorage.setItem('shopstack_access_token', accessToken)
      localStorage.setItem('shopstack_user', JSON.stringify(user))
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('shopstack_user', JSON.stringify(state.user))
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      localStorage.removeItem('shopstack_access_token')
      localStorage.removeItem('shopstack_user')
    },
  },
})

export const { setCredentials, updateUser, logout } = authSlice.actions
export default authSlice.reducer
