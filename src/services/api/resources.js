import { apiClient } from '@/services/api/client'

export const authApi = {
  login: async (payload) => (await apiClient.post('/auth/login', payload)).data,
  forgotPassword: async (payload) => (await apiClient.post('/auth/forgot-password', payload)).data,
  resetPassword: async (payload) => (await apiClient.post('/auth/reset-password', payload)).data,
}

export const analyticsApi = {
  overview: async (role) => (await apiClient.get('/analytics/overview', { params: { role } })).data,
}

export const usersApi = {
  list: async (params = {}) => (await apiClient.get('/users', { params })).data,
  create: async (payload) => (await apiClient.post('/users', payload)).data,
  update: async (id, payload) => (await apiClient.put(`/users/${id}`, payload)).data,
  remove: async (id) => (await apiClient.delete(`/users/${id}`)).data,
}

export const queriesApi = {
  list: async (params = {}) => (await apiClient.get('/queries', { params })).data,
  detail: async (id) => (await apiClient.get(`/queries/${id}`)).data,
  update: async (id, payload) => (await apiClient.put(`/queries/${id}`, payload)).data,
  remove: async (id) => (await apiClient.delete(`/queries/${id}`)).data,
}

export const recommendationsApi = {
  list: async () => (await apiClient.get('/recommendations')).data,
  create: async (payload) => (await apiClient.post('/recommendations', payload)).data,
}

export const productsApi = {
  list: async (params = {}) => (await apiClient.get('/products', { params })).data,
  detail: async (id) => (await apiClient.get(`/products/${id}`)).data,
  create: async (payload) => (await apiClient.post('/products', payload)).data,
  update: async (id, payload) => (await apiClient.put(`/products/${id}`, payload)).data,
  remove: async (id) => (await apiClient.delete(`/products/${id}`)).data,
}

export const categoriesApi = {
  list: async () => (await apiClient.get('/categories')).data,
  create: async (payload) => (await apiClient.post('/categories', payload)).data,
  remove: async (id) => (await apiClient.delete(`/categories/${id}`)).data,
}

export const ordersApi = {
  list: async (params = {}) => (await apiClient.get('/orders', { params })).data,
  update: async (id, payload) => (await apiClient.put(`/orders/${id}`, payload)).data,
  remove: async (id) => (await apiClient.delete(`/orders/${id}`)).data,
}

export const escalationsApi = {
  list: async (params = {}) => (await apiClient.get('/escalations', { params })).data,
  update: async (id, payload) => (await apiClient.put(`/escalations/${id}`, payload)).data,
  remove: async (id) => (await apiClient.delete(`/escalations/${id}`)).data,
}

export const notificationsApi = {
  list: async (params = {}) => (await apiClient.get('/notifications', { params })).data,
  markRead: async (id) => (await apiClient.patch(`/notifications/${id}/read`)).data,
}

export const auditApi = {
  list: async () => (await apiClient.get('/audit-logs')).data,
  remove: async (id) => (await apiClient.delete(`/audit-logs/${id}`)).data,
}

export const tasksApi = {
  list: async (params = {}) => (await apiClient.get('/tasks', { params })).data,
  update: async (id, payload) => (await apiClient.put(`/tasks/${id}`, payload)).data,
  remove: async (id) => (await apiClient.delete(`/tasks/${id}`)).data,
}

export const supportCasesApi = {
  list: async () => (await apiClient.get('/support-cases')).data,
  update: async (id, payload) => (await apiClient.put(`/support-cases/${id}`, payload)).data,
  remove: async (id) => (await apiClient.delete(`/support-cases/${id}`)).data,
}

export const settingsApi = {
  get: async () => (await apiClient.get('/settings')).data,
  update: async (payload) => (await apiClient.put('/settings', payload)).data,
}

export const demoApi = {
  reset: async () => (await apiClient.post('/demo/reset')).data,
}
