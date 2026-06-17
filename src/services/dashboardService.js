import api from './api';

const dashboardService = {
  getStats: () => api.get('/dashboard').then((r) => r.data.data),
  getGraficas: () => api.get('/dashboard/graficas').then((r) => r.data.data),
};

export default dashboardService;
