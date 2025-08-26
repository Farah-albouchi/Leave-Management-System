import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  EnhancedLeaveBalanceSummaryDto, 
  KpiCardData, 
  UpcomingLeaveDto 
} from '../models/enhanced-leave-balance.models';

@Injectable({
  providedIn: 'root'
})
export class EnhancedLeaveBalanceService {
  private readonly API_URL = 'http://localhost:8080/api/admin/leave-balance';

  constructor(private http: HttpClient) {}

  /**
   * Get enhanced leave balance summary for current employee
   */
  getEnhancedLeaveBalance(): Observable<EnhancedLeaveBalanceSummaryDto> {
    return this.http.get<EnhancedLeaveBalanceSummaryDto>(`${this.API_URL}/enhanced/me`)
      .pipe(
        catchError(error => {
          console.error('Error fetching enhanced leave balance:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get enhanced leave balance summary for specific employee (admin use)
   */
  getEmployeeEnhancedLeaveBalance(employeeId: string): Observable<EnhancedLeaveBalanceSummaryDto> {
    return this.http.get<EnhancedLeaveBalanceSummaryDto>(`${this.API_URL}/enhanced/${employeeId}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching employee enhanced leave balance:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Convert balance summary to KPI card data
   */
  mapToKpiCards(summary: EnhancedLeaveBalanceSummaryDto): KpiCardData[] {
    return [
      {
        title: 'Total Cap',
        value: summary.totalPaidCap,
        subtitle: summary.isUsingDefaultCap ? 'System Default' : 'Custom Cap',
        icon: 'fas fa-calendar',
        color: 'blue'
      },
      {
        title: 'Used',
        value: summary.totalUsedDays,
        subtitle: `${Math.round(summary.usagePercentage)}% of cap`,
        icon: 'fas fa-check-circle',
        color: this.getUsageColor(summary.usagePercentage)
      },
      {
        title: 'Remaining',
        value: summary.totalRemainingDays,
        subtitle: 'Paid days left',
        icon: 'fas fa-clock',
        color: 'green'
      },
      {
        title: 'Unpaid',
        value: summary.totalUnpaidDays,
        subtitle: 'Days taken unpaid',
        icon: 'fas fa-exclamation-triangle',
        color: summary.totalUnpaidDays > 0 ? 'yellow' : 'gray'
      },
      {
        title: 'Pending',
        value: summary.totalPendingCount,
        subtitle: 'Requests awaiting approval',
        icon: 'fas fa-hourglass-half',
        color: 'purple'
      }
    ];
  }

  /**
   * Get color based on usage percentage
   */
  private getUsageColor(usagePercentage: number): 'green' | 'yellow' | 'red' {
    if (usagePercentage >= 90) return 'red';
    if (usagePercentage >= 70) return 'yellow';
    return 'green';
  }

  /**
   * Get status classes for leave type cards
   */
  getLeaveTypeStatusClasses(statusColor: string): string {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (statusColor) {
      case 'green':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'yellow':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'red':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  /**
   * Get progress bar color classes
   */
  getProgressBarClasses(statusColor: string): string {
    switch (statusColor) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  /**
   * Get urgency classes for upcoming leaves
   */
  getUrgencyClasses(urgencyLevel: string): string {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded';
    switch (urgencyLevel) {
      case 'immediate':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'soon':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'upcoming':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Format number with units
   */
  formatDaysText(days: number, includeUnit: boolean = true): string {
    if (days === 0.5) return '0.5 day';
    if (days === 1) return includeUnit ? '1 day' : '1';
    return includeUnit ? `${days} days` : days.toString();
  }
}


