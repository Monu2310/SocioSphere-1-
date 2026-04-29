import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const residentService = {
  getAll: (params) => api.get('/residents', { params }),
  getById: (id) => api.get(`/residents/${id}`),
  create: (data) => api.post('/residents', data),
  update: (id, data) => api.put(`/residents/${id}`, data),
  delete: (id) => api.delete(`/residents/${id}`),
  getDashboardStats: () => api.get('/residents/dashboard-stats'),
};

export const pollService = {
  getAll: (params) => api.get('/polls', { params }),
  getById: (id) => api.get(`/polls/${id}`),
  create: (data) => api.post('/polls', data),
  vote: (id, optionId) => api.post(`/polls/${id}/vote`, { optionId }),
  close: (id) => api.patch(`/polls/${id}/close`),
  delete: (id) => api.delete(`/polls/${id}`),
};

export const parkingService = {
  getAll: (params) => api.get('/parking', { params }),
  getStats: () => api.get('/parking/stats'),
  createSlot: (data) => api.post('/parking', data),
  createBulk: (data) => api.post('/parking/bulk', data),
  assignSlot: (slotId, data) => api.post(`/parking/${slotId}/assign`, data),
  releaseSlot: (slotId) => api.patch(`/parking/${slotId}/release`),
  deleteSlot: (slotId) => api.delete(`/parking/${slotId}`),
  addVehicle: (data) => api.post('/parking/vehicles', data),
  removeVehicle: (id) => api.delete(`/parking/vehicles/${id}`),
};

export const marketplaceService = {
  getAll: (params) => api.get('/marketplace', { params }),
  getById: (id) => api.get(`/marketplace/${id}`),
  create: (formData) => api.post('/marketplace', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/marketplace/${id}`, data),
  delete: (id) => api.delete(`/marketplace/${id}`),
  getStats: () => api.get('/marketplace/stats'),
};

export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  broadcast: (data) => api.post('/notifications/broadcast', data),
};

export const aiService = {
  getInsights: () => api.get('/ai/insights'),
  getActivityLogs: (params) => api.get('/ai/activity-logs', { params }),
  getAssistant: (question) => api.post('/ai/assistant', { question }),
  triageComplaint: (payload) => api.post('/ai/complaint-triage', payload),
  generateNotice: (payload) => api.post('/ai/notice-draft', payload),
  getFollowups: () => api.get('/ai/followups'),
  getMaintenanceForecast: () => api.get('/ai/maintenance-forecast'),
  getPriorityQueue: () => api.get('/ai/priority-queue'),
};
