import api from './api';

const materiaService = {
  getAll: () =>
    api.get('/materias').then((r) => r.data.data || []),

  getById: (id) =>
    api.get(`/materias/${id}`).then((r) => r.data.data),
};

export default materiaService;
