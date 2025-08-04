export interface AdminDashboardSummary {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalEmployees: number;
  employeesOnLeaveToday: number;
  overLimitEmployees: number;
}

export interface MonthlyLeaveStat {
  month: string;
  requestCount: number;
}

export interface LeaveTypeDistribution {
  [key: string]: number;
}

export interface EmployeeOnLeave {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
  leaveType?: string;
  startDate?: string;
  endDate?: string;
}

export interface AdminDashboardData {
  summary: AdminDashboardSummary;
  monthlyStats: MonthlyLeaveStat[];
  leaveTypeDistribution: LeaveTypeDistribution;
  employeesOnLeave: EmployeeOnLeave[];
}

export interface QuickActionRequest {
  id: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  submittedAt: string;
}

export interface AdminDashboardResponse {
  success: boolean;
  data?: AdminDashboardData;
  error?: string;
}