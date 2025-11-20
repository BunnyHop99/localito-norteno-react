import api from '../api/axios';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/jwt/create/', { username, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/usuarios/me/');
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/users/', userData);
    return response.data;
  },
};  