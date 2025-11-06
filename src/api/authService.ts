import axios from 'axios';
import type { LoginRequest, LoginResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
apiClient.interceptors.request.use(
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

// Login function
export const authenticateUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register function (for initial admin setup)
export const registerUser = async (userData: any): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Get current user's profile
export const getCurrentUser = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/auth/me'); // This would be a new endpoint
    return response.data;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
};