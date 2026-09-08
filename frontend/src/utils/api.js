import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers['x-auth-token'] = token;
  }
  return req;
});

export const auth = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
};

export const properties = {
  getAll: (params) => API.get('/properties', { params }),
  getOne: (id) => API.get(`/properties/${id}`),
  create: (data) => API.post('/properties', data),
  update: (id, data) => API.put(`/properties/${id}`, data),
  delete: (id) => API.delete(`/properties/${id}`),
  getStats: () => API.get('/properties/stats'),
};

export const leads = {
  getAll: (params) => API.get('/leads', { params }),
  getOne: (id) => API.get(`/leads/${id}`),
  create: (data) => API.post('/leads', data),
  update: (id, data) => API.put(`/leads/${id}`, data),
  delete: (id) => API.delete(`/leads/${id}`),
  addNote: (id, text) => API.post(`/leads/${id}/notes`, { text }),
  getStats: () => API.get('/leads/stats'),
};

export const contacts = {
  getAll: (params) => API.get('/contacts', { params }),
  getOne: (id) => API.get(`/contacts/${id}`),
  create: (data) => API.post('/contacts', data),
  update: (id, data) => API.put(`/contacts/${id}`, data),
  delete: (id) => API.delete(`/contacts/${id}`),
};

export const users = {
  getAll: () => API.get('/users'),
  getOne: (id) => API.get(`/users/${id}`),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
};

export default API;
