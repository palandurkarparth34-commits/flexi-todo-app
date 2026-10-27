import axiosClient from './axiosClient.js';

export const authApi = {
  login: async (credentials) => {
    return await axiosClient.post('/auth/login', credentials);
  },

  register: async (userData) => {
    return await axiosClient.post('/auth/register', userData);
  },

  getMe: async () => {
    return await axiosClient.get('/auth/me');
  },

  updateProfile: async (data) => {
    return await axiosClient.put('/auth/profile', data);
  },
};
