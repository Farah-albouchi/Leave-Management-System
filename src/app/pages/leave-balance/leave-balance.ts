import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { faPlus, faCalendar, faClock, faClipboard, faCheckCircle, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { Card } from '../../components/card/card';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LeaveBalanceService } from '../../services/leave-balance.service';
import { LeaveBalanceSummaryDto, LeaveHistoryItem } from '../../models/leave-balance.models';

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

  balanceSummary: LeaveBalanceSummaryDto = {
    totalAllowance: 0,
    totalUsed: 0,
    totalRemaining: 0,
    totalPending: 0,
    balancesByType: [],
    currentYear: new Date().getFullYear()
  };

  leaveHistory: LeaveHistoryItem[] = [];
  isLoading = true;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private leaveBalanceService: LeaveBalanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLeaveBalance();
    this.loadLeaveHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLeaveBalance(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.leaveBalanceService.getLeaveBalanceSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.balanceSummary = summary;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading leave balance:', error);
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
    this.loadLeaveBalance();
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
