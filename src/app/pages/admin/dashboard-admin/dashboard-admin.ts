import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Card } from '../../../components/card/card';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar, faClock, faClipboard, faCheckCircle, faRectangleXmark, faChartBar, faUser } from '@fortawesome/free-regular-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { DashboardService, AdminDashboardStats } from '../../../services/dashboard.service';
import { LeaveRequestService } from '../../../services/leave-request.service';
import { LeaveRequestResponseDto, LeaveStatus } from '../../../models/leave-request.models';

@Component({
  selector: 'app-dashboard-admin',
  imports: [CommonModule, FontAwesomeModule, Card],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css'
})
export class DashboardAdmin implements OnInit, OnDestroy {
  faPlus = faPlus;
  faCalendar = faCalendar;
  faClock = faClock;
  faClipboard = faClipboard;
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faRectangleXmark;
  faChartLine = faChartBar;
  faUsers = faUser;

  adminStats: AdminDashboardStats = {
    totalEmployees: 0,
    pendingRequests: 0,
    onLeaveToday: 0,
    overLimit: 0
  };

  pendingRequests: LeaveRequestResponseDto[] = [];
  recentRequests: LeaveRequestResponseDto[] = [];
  
  isLoading = true;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardService,
    private leaveRequestService: LeaveRequestService,
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

    // Load admin statistics
    this.dashboardService.getAdminDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.adminStats = stats;
        },
        error: (error) => {
          console.error('Error loading admin stats:', error);
          this.errorMessage = 'Failed to load dashboard statistics';
        }
      });

    // Load pending requests
    this.loadPendingRequests();
  }

  private loadPendingRequests(): void {
    // For now, we'll use the regular leave request service
    // In a real implementation, this would be an admin-specific endpoint
    this.leaveRequestService.getMyRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (requests) => {
          this.pendingRequests = requests.filter(req => req.status === LeaveStatus.PENDING);
          this.recentRequests = requests
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
            .slice(0, 5);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading pending requests:', error);
          this.errorMessage = 'Failed to load pending requests';
          this.isLoading = false;
        }
      });
  }

  navigateToManageRequests(): void {
    this.router.navigate(['/admin/leave-requests']);
  }

  navigateToManageEmployees(): void {
    this.router.navigate(['/admin/employees']);
  }

  navigateToStatistics(): void {
    this.router.navigate(['/admin/stats']);
  }

  navigateToHolidays(): void {
    this.router.navigate(['/admin/holidays']);
  }

  approveRequest(requestId: string): void {
    // This would call an admin service to approve the request
    console.log('Approving request:', requestId);
    // For now, just refresh the data
    this.loadPendingRequests();
  }

  rejectRequest(requestId: string): void {
    // This would call an admin service to reject the request
    console.log('Rejecting request:', requestId);
    // For now, just refresh the data
    this.loadPendingRequests();
  }

  viewRequestDetails(requestId: string): void {
    this.router.navigate(['/admin/leave-requests'], { 
      queryParams: { requestId } 
    });
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
  calculateDaysText(request: LeaveRequestResponseDto): string {
    if (request.halfDay) {
      return '0.5 day';
    }
    
    if (request.startDate === request.endDate) {
      return '1 day';
    }
    
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return `${diffDays} days`;
  }
}
