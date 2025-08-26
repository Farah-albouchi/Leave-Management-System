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

// Enhanced models for dashboard KPIs
export interface EnhancedLeaveBalanceDto {
  leaveType: LeaveType;
  leaveTypeName: string;
  totalAllowance: number;
  usedPaidDays: number;
  usedUnpaidDays: number;
  remainingDays: number;
  pendingDays: number;
  period: string;
}

export interface UpcomingLeaveDto {
  id: string;
  leaveType: string;
  leaveTypeDisplayName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  isHalfDay: boolean;
  isPaid: boolean;
  reason: string;
  dateRange: string;
  daysText: string;
  daysUntilStart: number;
  urgencyLevel: string; // 'immediate', 'soon', 'upcoming'
}

export interface EnhancedLeaveBalanceSummaryDto {
  // Main KPI values
  totalPaidCap: number;           // Employee's total paid leave cap for the year
  totalUsedDays: number;          // Total days used across all paid types
  totalRemainingDays: number;     // Remaining paid days (cap - used)
  totalUnpaidDays: number;        // Total unpaid days taken
  totalPendingCount: number;      // Count of pending requests
  
  // Additional summary info
  currentYear: number;
  isUsingDefaultCap: boolean;     // Whether using system default or custom cap
  systemDefaultCap: number;       // For reference
  
  // Breakdown by leave type
  balancesByType: EnhancedLeaveBalanceDto[];
  
  // Upcoming approved leaves (next 30 days)
  upcomingLeaves: UpcomingLeaveDto[];
  
  // Usage percentage for progress bars
  usagePercentage: number;        // (used / cap) * 100
}