import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agrega el Bearer token en cada request
api.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem('auth-store');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // sessionStorage corrupto — ignorar
    }
  }
  return config;
});

// En 401: limpia sesión y redirige a login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('auth-store');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
