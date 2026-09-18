import axiosClient from './axiosClient'

export const addressApi = {
  list: () => axiosClient.get('/addresses'),
  add: (payload) => axiosClient.post('/addresses', payload),
  remove: (id) => axiosClient.delete(`/addresses/${id}`),
}
