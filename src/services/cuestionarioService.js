import api from './api';

const cuestionarioService = {
  getAll: (params = {}) =>
    api.get('/cuestionarios', { params }).then((r) => r.data),

  getById: (id) =>
    api.get(`/cuestionarios/${id}`).then((r) => r.data.data),

  create: (data) =>
    api.post('/cuestionarios', data).then((r) => r.data),

  update: (id, data) =>
    api.put(`/cuestionarios/${id}`, data).then((r) => r.data),

  remove: (id) =>
    api.delete(`/cuestionarios/${id}`).then((r) => r.data),
};

export default cuestionarioService;
