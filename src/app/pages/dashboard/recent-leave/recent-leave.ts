import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardService } from '../../../services/dashboard.service';
import { LeaveRequestResponseDto, LeaveStatus } from '../../../models/leave-request.models';
import { LeaveRequestService } from '../../../services/leave-request.service';

interface LeaveRequest {
  id: string;
  type: string;
  status: string;
  dateRange: string;
  days: string;
  statusColor: string;
  statusBg: string;
  canCancel: boolean;
}

@Component({
  selector: 'app-recent-leave',
  imports: [CommonModule],
  templateUrl: './recent-leave.html',
  styleUrl: './recent-leave.css'
})
export class RecentLeave implements OnInit, OnDestroy {
  leaveRequests: LeaveRequest[] = [];
  isLoading = true;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardService,
    private leaveRequestService: LeaveRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRecentRequests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRecentRequests(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getRecentLeaveRequests(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (requests) => {
          this.leaveRequests = this.transformRequests(requests);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading recent requests:', error);
          this.errorMessage = 'Failed to load recent requests';
          this.isLoading = false;
        }
      });
  }

  private transformRequests(requests: LeaveRequestResponseDto[]): LeaveRequest[] {
    return requests.map(request => {
      const statusClasses = this.dashboardService.getStatusClasses(request.status);
      const workingDays = this.leaveRequestService.calculateWorkingDays(
        request.startDate, 
        request.endDate, 
        request.halfDay
      );
      
      return {
        id: request.id,
        type: request.type,
        status: this.formatStatus(request.status),
        dateRange: this.dashboardService.formatDateRange(request.startDate, request.endDate),
        days: `${workingDays} ${workingDays === 1 ? 'day' : 'days'}${request.halfDay ? ' (half day)' : ''}`,
        statusColor: statusClasses.color,
        statusBg: statusClasses.background,
        canCancel: request.status === LeaveStatus.PENDING
      };
    });
  }

  private formatStatus(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.ACCEPTED:
        return 'Approved';
      case LeaveStatus.PENDING:
        return 'Pending';
      case LeaveStatus.REJECTED:
        return 'Rejected';
      default:
        return status;
    }
  }

  viewAllRequests(): void {
    this.router.navigate(['/myRequests']);
  }

  viewRequestDetails(requestId: string): void {
    this.router.navigate(['/myRequests'], { 
      queryParams: { requestId } 
    });
  }

  cancelRequest(requestId: string): void {
    if (confirm('Are you sure you want to cancel this leave request?')) {
      this.leaveRequestService.cancelRequest(requestId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Refresh the list after cancellation
            this.loadRecentRequests();
          },
          error: (error) => {
            console.error('Error canceling request:', error);
            this.errorMessage = 'Failed to cancel request';
          }
        });
    }
  }

  refreshRequests(): void {
    this.loadRecentRequests();
  }
}
