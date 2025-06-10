import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI, AuthResponse } from '../api/auth';
import { useToast } from '../hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

interface JwtPayload {
  sub: string; // username
  roles: string[];
  userId: number;
  email: string;
  exp: number;
  iat: number;
  iss: string;
  aud: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * Auth reducer for state management
 */
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

/**
 * Decode JWT token and extract user information
 */
const decodeUserFromToken = (token: string): User | null => {
  
  try {
    // Validate token is a non-empty string
    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.warn('Invalid token: token is empty or not a string');
      return null;
    }

    // Check if token has the correct format (3 parts separated by dots)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.warn('Invalid token format: token must have 3 parts separated by dots');
      return null;
    }

    const decoded = jwtDecode<JwtPayload>(token);
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      console.warn('Token has expired');
      return null;
    }

    // Validate required fields exist
    if (!decoded.sub || !decoded.userId || !decoded.email || !decoded.roles) {
      console.warn('Token is missing required fields');
      return null;
    }

    return {
      id: decoded.userId,
      username: decoded.sub,
      email: decoded.email,
      roles: Array.isArray(decoded.roles) ? decoded.roles : [],
    };
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component
 * Manages user authentication state and actions
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      const user = decodeUserFromToken(token);
      if (user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        // Token is invalid or expired, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authAPI.login({ username, password });
      const { token, refreshToken } = response.data;
      
      // Validate token exists and is a string
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid access token received from server');
      }
      
      // Decode user information from JWT token
      const user = decodeUserFromToken(token);
      if (!user) {
        throw new Error('Invalid token received - unable to decode user information');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      // Remove the old user storage since we're getting data from token
      localStorage.removeItem('user');
      
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      toast({
        title: t('auth.loginSuccess'),
        variant: 'default',
      });
      
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || t('auth.invalidCredentials');
      dispatch({ type: 'AUTH_ERROR', payload: message });
      toast({
        title: t('common.error'),
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authAPI.register({ username, email, password });
      const { token, refreshToken } = response.data;
      
      // Validate token exists and is a string
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid access token received from server');
      }
      
      // Decode user information from JWT token
      const user = decodeUserFromToken(token);
      if (!user) {
        throw new Error('Invalid token received - unable to decode user information');
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      // Remove the old user storage since we're getting data from token
      localStorage.removeItem('user');
      
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
      toast({
        title: t('auth.registrationSuccess'),
        variant: 'default',
      });
      
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || t('common.error');
      dispatch({ type: 'AUTH_ERROR', payload: message });
      toast({
        title: t('common.error'),
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    dispatch({ type: 'AUTH_LOGOUT' });
    toast({
      title: t('auth.logoutSuccess'),
      variant: 'default',
    });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const hasRole = (role: string): boolean => {
    return state.user?.roles.includes(role) || false;
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
