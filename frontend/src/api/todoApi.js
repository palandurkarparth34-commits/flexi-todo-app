import axiosClient from './axiosClient.js';

export const todoApi = {
  // Get todos with filtering, sorting, and pagination
  getTodos: async (params = {}) => {
    return await axiosClient.get('/todos', { params });
  },

  // Get dashboard statistics
  getStats: async () => {
    return await axiosClient.get('/todos/stats');
  },

  // Get single todo
  getTodoById: async (id) => {
    return await axiosClient.get(`/todos/${id}`);
  },

  // Create a new todo
  createTodo: async (todoData) => {
    return await axiosClient.post('/todos', todoData);
  },

  // Update existing todo
  updateTodo: async (id, todoData) => {
    return await axiosClient.put(`/todos/${id}`, todoData);
  },

  // Toggle completion status
  toggleTodo: async (id) => {
    return await axiosClient.patch(`/todos/${id}/toggle`);
  },

  // Delete todo
  deleteTodo: async (id) => {
    return await axiosClient.delete(`/todos/${id}`);
  },

  // Delete all completed todos
  clearCompleted: async () => {
    return await axiosClient.delete('/todos/bulk/completed');
  },
};
