export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  profileCompleted: boolean;
}

export interface User {
  id?: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'EMPLOYEE';
  profileCompleted: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}