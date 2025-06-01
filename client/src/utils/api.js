import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication tokens
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Integration API calls
export const getIntegrations = () => api.get('/integrations');
export const getIntegration = (id) => api.get(`/integrations/${id}`);
export const createIntegration = (data) => api.post('/integrations', data);
export const updateIntegration = (id, data) => api.put(`/integrations/${id}`, data);
export const deleteIntegration = (id) => api.delete(`/integrations/${id}`);

// Metrics API calls
export const getMetrics = () => api.get('/metrics');
export const getIntegrationMetrics = (integrationId, timeframe) => 
  api.get(`/metrics/integration/${integrationId}`, { params: { timeframe } });
export const getDashboardMetrics = () => api.get('/metrics/dashboard');
export const createMetric = (data) => api.post('/metrics', data);

export default api;
