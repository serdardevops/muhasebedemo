import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', { email, password });
      return {
        success: response.data.success,
        token: response.data.data.token,
        user: response.data.data.user
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Giriş yapılırken hata oluştu');
    }
  },

  async register(userData: RegisterData): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/register', userData);
      return {
        success: response.data.success,
        token: response.data.data.token,
        user: response.data.data.user
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Kayıt olurken hata oluştu');
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Kullanıcı bilgileri alınırken hata oluştu');
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Logout error is not critical
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
    }
  },
}; 