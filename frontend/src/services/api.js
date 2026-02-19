import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Axios instance z tokenem
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor - dodaj token do każdego requesta
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = async (username, password) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
    username,
    password,
  });
  return response.data;
};

// Profile
export const getProfile = async () => {
  const response = await api.get('/api/profile/me');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/api/profile/firma', data);
  return response.data;
};

export const updateFakturaStatus = async (id, status) => {
  const response = await api.patch(`/api/faktury/${id}/status?status=${status}`);
  return response.data;
};

// Faktury
export const getFaktury = async (params = {}) => {
  const response = await api.get('/api/faktury', { params });
  return response.data;
};

export const getFaktura = async (id) => {
  const response = await api.get(`/api/faktury/${id}`);
  return response.data;
};

export const verifyFaktura = async (id) => {
  const response = await api.post(`/api/faktury/${id}/verify`);
  return response.data;
};

export const uploadFakturaXML = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/faktury/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Eksport
export const generateExport = async (fakturaIds) => {
  const response = await api.post('/api/eksport/generate', fakturaIds);
  return response.data;
};

export const getExportHistory = async () => {
  const response = await api.get('/api/eksport/history');
  return response.data;
};

export const downloadExport = async (id) => {
  const response = await api.get(`/api/eksport/eksport/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

export default api;
