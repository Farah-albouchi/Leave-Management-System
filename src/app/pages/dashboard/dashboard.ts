import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Card } from '../../components/card/card';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { faCalendar, faClock, faClipboard, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { RecentLeave } from './recent-leave/recent-leave';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FontAwesomeModule, Card, RecentLeave],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  faPlus = faPlus;
  faCalendar = faCalendar;
  faClock = faClock;
  faClipboard = faClipboard;
  faCheckCircle = faCheckCircle;

  dashboardStats: DashboardStats = {
    availableLeave: 0,
    usedThisYear: 0,
    pendingRequests: 0,
    approvedRequests: 0
  };

  isLoading = true;
  errorMessage = '';
  currentUserName = 'Employee';

  private destroy$ = new Subject<void>();

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadUserInfo();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    
    this.dashboardService.getEmployeeDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.dashboardStats = stats;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.errorMessage = 'Failed to load dashboard data';
          this.isLoading = false;
        }
      });
  }

  private loadUserInfo(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUserName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.email || 'Employee';
    }
  }

  navigateToApplyLeave(): void {
    this.router.navigate(['/ApplyLeave']);
  }

  navigateToMyRequests(): void {
    this.router.navigate(['/myRequests']);
  }

  navigateToCalendar(): void {
    this.router.navigate(['/CalendarLeave']);
  }

  navigateToLeaveBalance(): void {
    this.router.navigate(['/LeaveBalance']);
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }
}
