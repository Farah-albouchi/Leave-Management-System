import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LeaveBalanceSummaryDto, LeaveHistoryItem, EnhancedLeaveBalanceSummaryDto } from '../models/leave-balance.models';
import { LeaveRequestService } from './leave-request.service';
import { LeaveRequestResponseDto } from '../models/leave-request.models';

@Injectable({
  providedIn: 'root'
})
export class LeaveBalanceService {
  private readonly API_URL = 'http://localhost:8080/api/employee';

  constructor(
    private http: HttpClient,
    private leaveRequestService: LeaveRequestService
  ) {}

  /**
   * Get employee leave balance summary
   */
  getLeaveBalanceSummary(): Observable<LeaveBalanceSummaryDto> {
    return this.http.get<LeaveBalanceSummaryDto>(`${this.API_URL}/leave-balance`)
      .pipe(
        catchError(error => {
          console.error('Error fetching leave balance:', error);
          // Return default values on error
          return of({
            totalAllowance: 0,
            totalUsed: 0,
            totalRemaining: 0,
            totalPending: 0,
            balancesByType: [],
            currentYear: new Date().getFullYear()
          });
        })
      );
  }

  /**
   * Get enhanced employee leave balance summary with KPIs
   */
  getEnhancedLeaveBalanceSummary(): Observable<EnhancedLeaveBalanceSummaryDto> {
    return this.http.get<EnhancedLeaveBalanceSummaryDto>(`${this.API_URL}/enhanced-leave-balance`)
      .pipe(
        catchError(error => {
          console.error('Error fetching enhanced leave balance:', error);
          // Return default values on error
          return of({
            totalPaidCap: 0,
            totalUsedDays: 0,
            totalRemainingDays: 0,
            totalUnpaidDays: 0,
            totalPendingCount: 0,
            currentYear: new Date().getFullYear(),
            isUsingDefaultCap: true,
            systemDefaultCap: 30,
            balancesByType: [],
            upcomingLeaves: [],
            usagePercentage: 0
          });
        })
      );
  }

  /**
   * Get leave history (recent leave requests)
   */
  getLeaveHistory(): Observable<LeaveHistoryItem[]> {
    return this.leaveRequestService.getMyRequests()
      .pipe(
        map(requests => this.transformToLeaveHistory(requests)),
        catchError(error => {
          console.error('Error fetching leave history:', error);
          return of([]);
        })
      );
  }

  /**
   * Transform leave requests to leave history items
   */
  private transformToLeaveHistory(requests: LeaveRequestResponseDto[]): LeaveHistoryItem[] {
    return requests
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 10) // Take only recent 10 requests
      .map(request => ({
        id: request.id,
        type: request.type,
        startDate: request.startDate,
        endDate: request.endDate,
        status: this.formatStatus(request.status),
        days: this.calculateDays(request.startDate, request.endDate, request.halfDay),
        halfDay: request.halfDay,
        reason: request.reason
      }));
  }

  /**
   * Format leave status for display
   */
  private formatStatus(status: string): string {
    switch (status) {
      case 'ACCEPTED':
        return 'Approved';
      case 'PENDING':
        return 'Pending';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  }

  /**
   * Calculate working days between dates
   */
  private calculateDays(startDate: string, endDate: string, halfDay: boolean): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let totalDays = 0;
    const current = new Date(start);
    
    while (current <= end) {
      // Skip weekends (Saturday = 6, Sunday = 0)
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        totalDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return halfDay && totalDays > 0 ? Math.max(0.5, totalDays / 2) : totalDays;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  /**
   * Format date range for display
   */
  formatDateRange(startDate: string, endDate: string): string {
    if (startDate === endDate) {
      return this.formatDate(startDate);
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      // Same month
      return `${start.getDate()}-${end.getDate()} ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    } else {
      // Different months
      return `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
    }
  }

  /**
   * Get status color classes
   */
  getStatusClasses(status: string): { color: string; background: string } {
    switch (status.toLowerCase()) {
      case 'approved':
        return { color: 'text-green-600', background: 'bg-green-100' };
      case 'pending':
        return { color: 'text-yellow-600', background: 'bg-yellow-100' };
      case 'rejected':
        return { color: 'text-red-600', background: 'bg-red-100' };
      default:
        return { color: 'text-gray-600', background: 'bg-gray-100' };
    }
  }

  /**
   * Get leave type color classes
   */
  getLeaveTypeClasses(leaveType: string): { color: string; background: string } {
    switch (leaveType.toLowerCase()) {
      case 'annual leave':
      case 'vacation':
        return { color: 'text-blue-600', background: 'bg-blue-100' };
      case 'sick leave':
      case 'sick':
        return { color: 'text-red-600', background: 'bg-red-100' };
      case 'maternity leave':
      case 'maternity':
        return { color: 'text-purple-600', background: 'bg-purple-100' };
      case 'unpaid leave':
      case 'unpaid':
        return { color: 'text-gray-600', background: 'bg-gray-100' };
      default:
        return { color: 'text-indigo-600', background: 'bg-indigo-100' };
    }
  }
}