import api from '../api/axios';

export const ventasService = {
  getVentas: async (params = {}) => {
    const response = await api.get('/ventas/', { params });
    return response.data;
  },

  getVenta: async (id) => {
    const response = await api.get(`/ventas/${id}/`);
    return response.data;
  },

  createVenta: async (data) => {
    const response = await api.post('/ventas/', data);
    return response.data;
  },

  cancelarVenta: async (id) => {
    const response = await api.post(`/ventas/${id}/cancelar/`);
    return response.data;
  },

  marcarPagado: async (id) => {
    const response = await api.post(`/ventas/${id}/marcar_pagado/`);
    return response.data;
  },

  getEstadisticasHoy: async () => {
    const response = await api.get('/ventas/estadisticas_hoy/');
    return response.data;
  },

  getVentasPorPeriodo: async (params = {}) => {
    const response = await api.get('/ventas/ventas_por_periodo/', { params });
    return response.data;
  },
};