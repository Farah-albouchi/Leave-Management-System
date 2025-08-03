export interface AdminLeaveRequestDto {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  startDate: string;
  endDate: string;
  halfDay: boolean;
  reason: string;
  type: string;
  status: LeaveStatus;
  documentPath?: string;
  submittedAt: string;
  createdAt: string;
  adminRemark?: string;
  totalDays: number;
}

export interface AdminRequestStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface ApproveRejectRequest {
  reason?: string;
}

export interface ApproveRejectResponse {
  message: string;
  status: string;
  reason?: string;
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface AdminRequestFilters {
  status?: LeaveStatus | null;
  employeeId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}