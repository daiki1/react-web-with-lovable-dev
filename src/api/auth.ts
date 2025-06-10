
import api from './config';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
  sendAsCode?: boolean; 
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    email: string;
    roles: string[];
  };
}

/**
 * Authentication API endpoints
 */
export const authAPI = {
  login: (data: LoginRequest): Promise<{ data: AuthResponse }> =>
    api.post('/api/auth/login', data),

  register: (data: RegisterRequest): Promise<{ data: AuthResponse }> =>
    api.post('/api/auth/register', data),

  forgotPassword: (data: ForgotPasswordRequest): Promise<{ data: { message: string } }> =>
    api.post('/api/auth/request-password-reset', {...data, sendAsCode: true,}),

  resetPassword: (data: ResetPasswordRequest): Promise<{ data: { message: string } }> =>
    api.post('/api/auth/reset-password', data),

  refreshToken: (refreshToken: string): Promise<{ data: { accessToken: string } }> =>
    api.post('/api/auth/refresh', { refreshToken }),

  logout: (): Promise<void> =>
    api.post('/api/auth/logout'),
};
