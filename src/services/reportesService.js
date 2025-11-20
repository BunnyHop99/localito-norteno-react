import api from '../api/axios';

export const reportesService = {
  getDashboardMetricas: async () => {
    const response = await api.get('/reportes/analisis/dashboard_metricas/');
    return response.data;
  },

  getVentasGeneral: async (params = {}) => {
    const response = await api.get('/reportes/analisis/ventas_general/', { params });
    return response.data;
  },

  getProductosMasVendidos: async (params = {}) => {
    const response = await api.get('/reportes/analisis/productos_mas_vendidos/', { params });
    return response.data;
  },

  getInventarioActual: async () => {
    const response = await api.get('/reportes/analisis/inventario_actual/');
    return response.data;
  },

  getAnalisisFinanciero: async (params = {}) => {
    const response = await api.get('/reportes/analisis/analisis_financiero/', { params });
    return response.data;
  },

  getRendimientoCategorias: async (params = {}) => {
    const response = await api.get('/reportes/analisis/rendimiento_categorias/', { params });
    return response.data;
  },
};