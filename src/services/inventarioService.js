import api from '../api/axios';

export const inventarioService = {
  // Categorías
  getCategorias: async () => {
    const response = await api.get('/inventario/categorias/');
    return response.data;
  },

  createCategoria: async (data) => {
    const response = await api.post('/inventario/categorias/', data);
    return response.data;
  },

  // Productos
  getProductos: async (params = {}) => {
    const response = await api.get('/inventario/productos/', { params });
    return response.data;
  },

  getProducto: async (id) => {
    const response = await api.get(`/inventario/productos/${id}/`);
    return response.data;
  },

  createProducto: async (data) => {
    const response = await api.post('/inventario/productos/', data);
    return response.data;
  },

  updateProducto: async (id, data) => {
    const response = await api.put(`/inventario/productos/${id}/`, data);
    return response.data;
  },

  deleteProducto: async (id) => {
    const response = await api.delete(`/inventario/productos/${id}/`);
    return response.data;
  },

  getProductosStockBajo: async () => {
    const response = await api.get('/inventario/productos/stock_bajo/');
    return response.data;
  },

  actualizarStock: async (id, data) => {
    const response = await api.post(`/inventario/productos/${id}/actualizar_stock/`, data);
    return response.data;
  },

  // Movimientos
  getMovimientos: async (params = {}) => {
    const response = await api.get('/inventario/movimientos/', { params });
    return response.data;
  },

  createMovimiento: async (data) => {
    const response = await api.post('/inventario/movimientos/', data);
    return response.data;
  },
};
