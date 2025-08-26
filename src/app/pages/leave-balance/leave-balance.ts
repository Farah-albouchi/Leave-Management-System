import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { faPlus, faCalendar, faClock, faClipboard, faCheckCircle, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { Card } from '../../components/card/card';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LeaveBalanceService } from '../../services/leave-balance.service';
import { LeaveBalanceSummaryDto, LeaveHistoryItem, EnhancedLeaveBalanceSummaryDto } from '../../models/leave-balance.models';

@Component({
  selector: 'app-leave-balance',
  standalone: true,
  imports: [CommonModule, Card, FontAwesomeModule],
  templateUrl: './leave-balance.html',
  styleUrl:'./leave-balance.css'
})
export class LeaveBalance implements OnInit, OnDestroy {
  faPlus = faPlus;
  faCalendar = faCalendar;
  faClock = faClock;
  faClipboard = faClipboard;
  faCheckCircle = faCheckCircle;
  faRefresh = faRefresh;

  // Use enhanced summary for better KPI data
  enhancedSummary: EnhancedLeaveBalanceSummaryDto = {
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
  };

  leaveHistory: LeaveHistoryItem[] = [];
  isLoading = true;
  errorMessage = '';

  private destroy$ = new Subject<void>();
  clampPercent(v: number): number {
    if (!Number.isFinite(v)) return 0;
    return Math.max(0, Math.min(100, v));
  }
  
  isOverCap(used: number, cap: number): boolean {
    return used > cap;
  }
  
  overCapDays(used: number, cap: number): number {
    return Math.max(0, used - cap);
  }
  

  constructor(
    private leaveBalanceService: LeaveBalanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEnhancedLeaveBalance();
    this.loadLeaveHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEnhancedLeaveBalance(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.leaveBalanceService.getEnhancedLeaveBalanceSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.enhancedSummary = summary;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading enhanced leave balance:', error);
          this.errorMessage = 'Failed to load leave balance data';
          this.isLoading = false;
        }
      });
  }

  private loadLeaveHistory(): void {
    this.leaveBalanceService.getLeaveHistory()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (history) => {
          this.leaveHistory = history;
        },
        error: (error) => {
          console.error('Error loading leave history:', error);
          // Don't show error for history, just keep empty array
        }
      });
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

  refreshData(): void {
    this.loadEnhancedLeaveBalance();
    this.loadLeaveHistory();
  }

  getStatusClasses(status: string): { color: string; background: string } {
    return this.leaveBalanceService.getStatusClasses(status);
  }

  getLeaveTypeClasses(leaveType: string): { color: string; background: string } {
    return this.leaveBalanceService.getLeaveTypeClasses(leaveType);
  }

  formatDate(dateString: string): string {
    return this.leaveBalanceService.formatDate(dateString);
  }

  formatDateRange(startDate: string, endDate: string): string {
    return this.leaveBalanceService.formatDateRange(startDate, endDate);
  }

  getUsagePercentage(used: number, total: number): number {
    return total > 0 ? Math.round((used / total) * 100) : 0;
  }
}
