import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LeaveRequestService } from './leave-request.service';
import { LeaveBalanceService } from './leave-balance.service';
import { LeaveRequestResponseDto, LeaveStatus } from '../models/leave-request.models';

export interface DashboardStats {
  availableLeave: number;
  usedThisYear: number;
  pendingRequests: number;
  approvedRequests: number;
}

export interface AdminDashboardStats {
  totalEmployees: number;
  pendingRequests: number;
  onLeaveToday: number;
  overLimit: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_URL = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private leaveRequestService: LeaveRequestService,
    private leaveBalanceService: LeaveBalanceService
  ) {}

  /**
   * Get employee dashboard statistics
   */
  getEmployeeDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      leaveRequests: this.leaveRequestService.getMyRequests(),
      leaveBalance: this.leaveBalanceService.getLeaveBalanceSummary()
    }).pipe(
      map(({ leaveRequests, leaveBalance }) => {
        const currentYear = new Date().getFullYear();
        
        // Filter requests for current year
        const currentYearRequests = leaveRequests.filter(request => 
          new Date(request.startDate).getFullYear() === currentYear
        );

        const pendingRequests = currentYearRequests.filter(
          request => request.status === LeaveStatus.PENDING
        ).length;

        const approvedRequests = currentYearRequests.filter(
          request => request.status === LeaveStatus.ACCEPTED
        ).length;

        return {
          availableLeave: leaveBalance.totalRemaining,
          usedThisYear: leaveBalance.totalUsed,
          pendingRequests,
          approvedRequests
        };
      }),
      catchError(error => {
        console.error('Error fetching dashboard stats:', error);
        // Return default values on error
        return of({
          availableLeave: 0,
          usedThisYear: 0,
          pendingRequests: 0,
          approvedRequests: 0
        });
      })
    );
  }

  /**
   * Get admin dashboard statistics
   */
  getAdminDashboardStats(): Observable<AdminDashboardStats> {
    return forkJoin({
      summary: this.getAdminSummary(),
      onLeaveToday: this.getEmployeesOnLeaveToday()
    }).pipe(
      map(({ summary, onLeaveToday }) => ({
        totalEmployees: summary.totalEmployees || 0,
        pendingRequests: summary.pendingRequests || 0,
        onLeaveToday: onLeaveToday.length,
        overLimit: summary.overLimit || 0
      })),
      catchError(error => {
        console.error('Error fetching admin dashboard stats:', error);
        return of({
          totalEmployees: 0,
          pendingRequests: 0,
          onLeaveToday: 0,
          overLimit: 0
        });
      })
    );
  }

  /**
   * Get recent leave requests for dashboard
   */
  getRecentLeaveRequests(limit: number = 5): Observable<LeaveRequestResponseDto[]> {
    return this.leaveRequestService.getMyRequests().pipe(
      map(requests => {
        // Sort by creation date (most recent first) and limit
        return requests
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || a.startDate);
            const dateB = new Date(b.createdAt || b.startDate);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, limit);
      }),
      catchError(error => {
        console.error('Error fetching recent leave requests:', error);
        return of([]);
      })
    );
  }

  /**
   * Get upcoming leaves for calendar
   */
  getUpcomingLeaves(): Observable<LeaveRequestResponseDto[]> {
    return this.leaveRequestService.getMyRequests().pipe(
      map(requests => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter for approved leaves that start today or in the future
        return requests.filter(request => {
          const startDate = new Date(request.startDate);
          startDate.setHours(0, 0, 0, 0);
          return request.status === LeaveStatus.ACCEPTED && startDate >= today;
        });
      }),
      catchError(error => {
        console.error('Error fetching upcoming leaves:', error);
        return of([]);
      })
    );
  }

  /**
   * Get all approved leaves for calendar display
   */
  getApprovedLeaves(): Observable<LeaveRequestResponseDto[]> {
    return this.leaveRequestService.getMyRequests().pipe(
      map(requests => requests.filter(request => request.status === LeaveStatus.ACCEPTED)),
      catchError(error => {
        console.error('Error fetching approved leaves:', error);
        return of([]);
      })
    );
  }

  /**
   * Get leave balance information
   */
  private getLeaveBalance(): Observable<{ totalAllowance: number; used: number; remaining: number }> {
    return this.leaveBalanceService.getLeaveBalanceSummary().pipe(
      map(summary => ({
        totalAllowance: summary.totalAllowance,
        used: summary.totalUsed,
        remaining: summary.totalRemaining
      })),
      catchError(() => of({
        totalAllowance: 25, // Default fallback
        used: 0,
        remaining: 25
      }))
    );
  }

  /**
   * Get admin summary statistics
   */
  private getAdminSummary(): Observable<any> {
    return this.http.get(`${this.API_URL}/admin/stats/summary`).pipe(
      catchError(error => {
        console.error('Error fetching admin summary:', error);
        return of({
          totalEmployees: 0,
          pendingRequests: 0,
          overLimit: 0
        });
      })
    );
  }

  /**
   * Get employees currently on leave
   */
  private getEmployeesOnLeaveToday(): Observable<any[]> {
    const today = new Date().toISOString().split('T')[0];
    
    return this.http.get<any[]>(`${this.API_URL}/admin/employees/on-leave`, {
      params: { date: today }
    }).pipe(
      catchError(error => {
        console.error('Error fetching employees on leave:', error);
        return of([]);
      })
    );
  }

  /**
   * Format date range for display
   */
  formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric' 
    };
    
    if (start.getTime() === end.getTime()) {
      return start.toLocaleDateString('en-US', options);
    }
    
    if (start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', options)}–${end.toLocaleDateString('en-US', options)}`;
    }
    
    const optionsWithYear = { ...options, year: 'numeric' as const };
    return `${start.toLocaleDateString('en-US', optionsWithYear)}–${end.toLocaleDateString('en-US', optionsWithYear)}`;
  }

  /**
   * Get status color classes for UI
   */
  getStatusClasses(status: LeaveStatus): { color: string; background: string } {
    switch (status) {
      case LeaveStatus.ACCEPTED:
        return { color: 'text-green-600', background: 'bg-green-100' };
      case LeaveStatus.PENDING:
        return { color: 'text-yellow-600', background: 'bg-yellow-100' };
      case LeaveStatus.REJECTED:
        return { color: 'text-red-600', background: 'bg-red-100' };
      default:
        return { color: 'text-gray-600', background: 'bg-gray-100' };
    }
  }
}