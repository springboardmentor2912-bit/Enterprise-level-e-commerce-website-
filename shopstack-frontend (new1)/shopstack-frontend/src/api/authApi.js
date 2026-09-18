import axiosClient from './axiosClient'

export const authApi = {
  register: (payload) => axiosClient.post('/auth/register', payload),
  login: (payload) => axiosClient.post('/auth/login', payload),
  forgotPassword: (email) => axiosClient.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => axiosClient.post('/auth/reset-password', payload),
  me: () => axiosClient.get('/auth/me'),
  updateProfile: (payload) => axiosClient.put('/auth/profile', payload),
}
