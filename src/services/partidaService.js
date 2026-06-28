import api from './api';

const partidaService = {
  getHistory: (params = {}) =>
    api.get('/partidas', { params }).then((r) => r.data),

  getById: (id) =>
    api.get(`/partidas/${id}`).then((r) => r.data.data),

  getRanking: (id) =>
    api.get(`/partidas/${id}/ranking`).then((r) => r.data.data),

  create: (data) =>
    api.post('/partidas', data).then((r) => r.data),

  iniciar: (id) =>
    api.put(`/partidas/${id}/iniciar`).then((r) => r.data.data),

  siguientePregunta: (id) =>
    api.put(`/partidas/${id}/siguiente-pregunta`).then((r) => r.data.data),

  finalizar: (id) =>
    api.put(`/partidas/${id}/finalizar`).then((r) => r.data.data),

  getResultados: (id) =>
    api.get(`/partidas/${id}/resultados`).then((r) => r.data.data),

  getByCodigo: (codigo) =>
    api.get(`/partidas/codigo/${codigo}`).then((r) => r.data.data),
};

export default partidaService;
