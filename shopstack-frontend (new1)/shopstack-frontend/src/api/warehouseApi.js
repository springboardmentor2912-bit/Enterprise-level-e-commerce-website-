import axiosClient from './axiosClient'

export const warehouseApi = {
  tasks: (params) => axiosClient.get('/warehouse/tasks', { params }),
  updateTaskStatus: (taskId, status) => axiosClient.patch(`/warehouse/tasks/${taskId}/status`, null, { params: { status } }),
}
