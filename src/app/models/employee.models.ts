export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  cin?: number;
  role: EmployeeRole;
  profileCompleted: boolean;
  createdAt: string;
  fullName: string;
  active: boolean;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  cin?: number;
  role?: EmployeeRole;
}

export interface UpdateEmployeeRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  cin?: number;
  role?: EmployeeRole;
}

export enum EmployeeRole {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export interface EmployeeStats {
  totalEmployees: number;
  totalAdmins: number;
  profileCompleted: number;
  profilePending: number;
  totalUsers: number;
}

export interface CreateEmployeeResponse {
  message: string;
  employeeId: string;
  email: string;
}

export interface UpdateEmployeeResponse {
  message: string;
  employeeId: string;
}

export interface DeleteEmployeeResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
  newPassword: string;
}

export interface EmployeeFilter {
  search?: string;
  role?: EmployeeRole | null;
  status?: 'active' | 'inactive' | null;
  profileCompleted?: boolean | null;
}

export interface EmployeePagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}