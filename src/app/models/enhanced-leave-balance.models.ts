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

export interface EnhancedLeaveBalanceDto {
  leaveType: LeaveType;
  leaveTypeName: string;
  leaveTypeDisplayName: string;   // User-friendly name
  
  // For traditional leave types (Vacation, Sick, etc.)
  allocatedDays: number;          // Total allocated for this type
  usedPaidDays: number;           // Used days that count toward paid quota
  usedUnpaidDays: number;         // Used days that are unpaid
  remainingDays: number;          // Remaining days for this type
  pendingCount: number;           // Number of pending requests for this type
  
  // Visual indicators
  usagePercentage: number;        // (used / allocated) * 100
  statusColor: string;            // For UI theming (green, yellow, red)
  isOverLimit: boolean;           // Whether usage exceeds allocation
}

export interface UpcomingLeaveDto {
  id: string;
  leaveType: string;
  leaveTypeDisplayName: string;
  startDate: string;              // ISO date string
  endDate: string;                // ISO date string
  totalDays: number;
  isHalfDay: boolean;
  isPaid: boolean;
  reason: string;
  
  // Computed fields
  dateRange: string;              // "Dec 25, 2024 - Dec 27, 2024"
  daysText: string;               // "3 days" or "0.5 day"
  daysUntilStart: number;         // Days from today until start date
  urgencyLevel: string;           // "immediate", "soon", "upcoming"
}

export enum LeaveType {
  VACATION = 'VACATION',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  UNPAID = 'UNPAID'
}

export interface KpiCardData {
  title: string;
  value: number;
  subtitle?: string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
}


