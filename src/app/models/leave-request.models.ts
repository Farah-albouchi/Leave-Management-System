export interface LeaveRequestCreateDto {
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  halfDay: boolean;
  reason: string;
  type: string;
}

export interface LeaveRequestResponseDto {
  id: string;
  startDate: string;
  endDate: string;
  halfDay: boolean;
  reason: string;
  type: string;
  status: LeaveStatus;
  documentPath?: string;
  employeeName: string;
  createdAt?: string;
  adminRemark?: string;
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export enum LeaveType {
  ANNUAL_LEAVE = 'Annual Leave',
  SICK_LEAVE = 'Sick Leave',
  UNPAID_LEAVE = 'Unpaid Leave',
  MATERNITY_LEAVE = 'Maternity Leave',
  PATERNITY_LEAVE = 'Paternity Leave',
  EMERGENCY_LEAVE = 'Emergency Leave'
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}