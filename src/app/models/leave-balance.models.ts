export interface LeaveBalanceDto {
  id: number;
  leaveType: LeaveType;
  leaveTypeName: string;
  totalAllowance: number;
  usedDays: number;
  remainingDays: number;
  pendingDays: number;
  period: string; // YearMonth from backend
}

export interface LeaveBalanceSummaryDto {
  totalAllowance: number;
  totalUsed: number;
  totalRemaining: number;
  totalPending: number;
  balancesByType: LeaveBalanceDto[];
  currentYear: number;
}

export enum LeaveType {
  VACATION = 'VACATION',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  UNPAID = 'UNPAID'
}

export interface LeaveHistoryItem {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  days: number;
  halfDay: boolean;
  reason?: string;
}