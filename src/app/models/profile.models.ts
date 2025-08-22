export interface Profile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  cin?: number;
  role: 'ADMIN' | 'EMPLOYEE';
  profileCompleted: boolean;
  createdAt: string;
  fullName: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  cin?: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileUpdateResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  cin?: number;
  role: 'ADMIN' | 'EMPLOYEE';
  profileCompleted: boolean;
  createdAt: string;
  fullName: string;
}
