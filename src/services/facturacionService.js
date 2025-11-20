import api from '../api/axios';

export const facturacionService = {
  getFacturas: async (params = {}) => {
    const response = await api.get('/facturacion/', { params });
    return response.data;
  },

  getFactura: async (id) => {
    const response = await api.get(`/facturacion/${id}/`);
    return response.data;
  },

  createFactura: async (data) => {
    const response = await api.post('/facturacion/', data);
    return response.data;
  },

  timbrarFactura: async (id) => {
    const response = await api.post(`/facturacion/${id}/timbrar/`);
    return response.data;
  },

  cancelarFactura: async (id, motivo) => {
    const response = await api.post(`/facturacion/${id}/cancelar/`, { motivo });
    return response.data;
  },

  descargarXML: async (id) => {
    const response = await api.get(`/facturacion/${id}/descargar_xml/`);
    return response.data;
  },

  descargarPDF: async (id) => {
    const response = await api.get(`/facturacion/${id}/descargar_pdf/`);
    return response.data;
  },

  getEstadisticas: async () => {
    const response = await api.get('/facturacion/estadisticas/');
    return response.data;
  },
};