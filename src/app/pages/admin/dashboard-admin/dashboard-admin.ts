import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Card } from '../../../components/card/card';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar, faClock, faClipboard, faCheckCircle, faRectangleXmark, faChartBar, faUser } from '@fortawesome/free-regular-svg-icons';
import { faPlus, faUsers, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { AdminDashboardService } from '../../../services/admin-dashboard.service';
import { AdminDashboardSummary, AdminDashboardData } from '../../../models/admin-dashboard.models';
import { AdminLeaveRequestDto, LeaveStatus } from '../../../models/admin-request.models';

@Component({
  selector: 'app-dashboard-admin',
  imports: [CommonModule, FontAwesomeModule, Card],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css'
})
export class DashboardAdmin implements OnInit, OnDestroy {
  // Icons
  faPlus = faPlus;
  faCalendar = faCalendar;
  faClock = faClock;
  faClipboard = faClipboard;
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faRectangleXmark;
  faChartLine = faChartLine;
  faUsers = faUsers;

  // Dashboard data
  dashboardData: AdminDashboardData | null = null;
  dashboardSummary: AdminDashboardSummary = {
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalEmployees: 0,
    employeesOnLeaveToday: 0,
    overLimitEmployees: 0
  };

  pendingRequests: AdminLeaveRequestDto[] = [];
  recentRequests: AdminLeaveRequestDto[] = [];
  
  // State
  isLoading = true;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private adminDashboardService: AdminDashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAdminDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAdminDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load complete dashboard data
    this.adminDashboardService.getAdminDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dashboardData) => {
          this.dashboardData = dashboardData;
          this.dashboardSummary = dashboardData.summary;
          this.loadPendingRequests();
        },
        error: (error) => {
          console.error('Error loading admin dashboard:', error);
          this.errorMessage = 'Failed to load dashboard data';
          this.isLoading = false;
        }
      });
  }

  private loadPendingRequests(): void {
    // Load pending and recent requests
    this.adminDashboardService.getPendingRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pendingRequests) => {
          this.pendingRequests = pendingRequests.slice(0, 5); // Show only top 5 pending
        },
        error: (error) => {
          console.error('Error loading pending requests:', error);
        }
      });

    this.adminDashboardService.getRecentRequests(8)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (recentRequests) => {
          this.recentRequests = recentRequests;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading recent requests:', error);
          this.isLoading = false;
        }
      });
  }

  // Navigation methods
  navigateToPendingRequests(): void {
    this.router.navigate(['/admin/manage-requests']);
  }

  navigateToEmployees(): void {
    this.router.navigate(['/admin/manage-employees']);
  }

  navigateToStatistics(): void {
    this.router.navigate(['/admin/statistics']);
  }

  navigateToHolidays(): void {
    this.router.navigate(['/admin/holidays']);
  }

  navigateToAllRequests(): void {
    this.router.navigate(['/admin/manage-requests']);
  }

  // Quick actions from dashboard
  quickApproveRequest(request: AdminLeaveRequestDto): void {
    if (!confirm(`Are you sure you want to approve ${request.employeeName || 'this employee'}'s leave request?`)) {
      return;
    }

    this.adminDashboardService.approveRequest(request.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Request approved successfully');
          this.refreshDashboard();
        },
        error: (error) => {
          console.error('Error approving request:', error);
          this.errorMessage = 'Failed to approve request';
        }
      });
  }

  quickRejectRequest(request: AdminLeaveRequestDto): void {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    this.adminDashboardService.rejectRequest(request.id, reason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Request rejected successfully');
          this.refreshDashboard();
        },
        error: (error) => {
          console.error('Error rejecting request:', error);
          this.errorMessage = 'Failed to reject request';
        }
      });
  }

  viewRequestDetails(request: AdminLeaveRequestDto): void {
    this.router.navigate(['/admin/manage-requests']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  getStatusBadgeClass(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.ACCEPTED:
        return 'bg-green-100 text-green-800';
      case LeaveStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case LeaveStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  refreshDashboard(): void {
    this.loadAdminDashboard();
  }

  // Helper methods for template calculations
  calculateDaysText(request: AdminLeaveRequestDto): string {
    if (request.halfDay) {
      return '0.5 day';
    }
    
    if (request.startDate === request.endDate) {
      return '1 day';
    }
    
    const days = this.adminDashboardService.calculateDays(request.startDate, request.endDate, request.halfDay);
    return days === 1 ? '1 day' : `${days} days`;
  }

  getEmployeeInitials(employeeName: string): string {
    if (!employeeName) return '?';
    
    return employeeName
      .split(' ')
      .filter(name => name.length > 0)
      .map(name => name.charAt(0).toUpperCase())
      .join('');
  }

  getPendingCount(): number {
    return this.pendingRequests.length;
  }
}