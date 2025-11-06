import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppUser, LoginRequest, LoginResponse } from '../types';
import { authenticateUser } from '../api/authService';

interface AuthState {
  user: AppUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => void;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: LoginResponse }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'CHECK_AUTH_STATUS_START' }
  | { type: 'CHECK_AUTH_STATUS_SUCCESS'; payload: AppUser }
  | { type: 'CHECK_AUTH_STATUS_FAILURE' };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'CHECK_AUTH_STATUS_START':
      return { ...state, loading: true };
    case 'CHECK_AUTH_STATUS_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'CHECK_AUTH_STATUS_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const data = await authenticateUser(credentials);
      localStorage.setItem('token', data.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch({ type: 'CHECK_AUTH_STATUS_START' });
      try {
        // In a real app, you would verify the token with the backend
        // For now, we'll just decode the token to get user info
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const user: AppUser = {
            id: payload.id,
            username: payload.username || 'unknown', // In a real app, username would be in the token
            email: payload.email || 'unknown@example.com', // In a real app, email would be in the token
            role: payload.role,
            store_id: payload.store_id,
            created_at: payload.created_at || new Date().toISOString(),
            updated_at: payload.updated_at || new Date().toISOString(),
          };
          dispatch({ type: 'CHECK_AUTH_STATUS_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'CHECK_AUTH_STATUS_FAILURE' });
        }
      } catch (error) {
        dispatch({ type: 'CHECK_AUTH_STATUS_FAILURE' });
      }
    } else {
      dispatch({ type: 'CHECK_AUTH_STATUS_FAILURE' });
    }
  };

  return (
    <AuthContext.Provider value={{ state, login, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};