import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faSpinner, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RequestDetails } from './request-details/request-details';
import { LeaveRequestService } from '../../services/leave-request.service';
import { LeaveRequestResponseDto, LeaveStatus } from '../../models/leave-request.models';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RequestDetails],
  templateUrl: './my-requests.html',
  styleUrl: './my-requests.css'
})
export class MyRequests implements OnInit, OnDestroy {
  faPlus = faPlus;
  faSpinner = faSpinner;
  faRefresh = faRefresh;
  
  leaveRequests: LeaveRequestResponseDto[] = [];
  filteredRequests: LeaveRequestResponseDto[] = [];
  selectedRequest: LeaveRequestResponseDto | null = null;
  showModal = false;
  isLoading = false;
  errorMessage = '';
  selectedStatus = 'all';
  
  private destroy$ = new Subject<void>();

  constructor(
    private leaveRequestService: LeaveRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMyRequests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMyRequests(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.leaveRequestService.getMyRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (requests) => {
          const toMs = (d?: string | number | Date | null) =>
            d ? new Date(d).getTime() : -Infinity; 
  
          const sorted = [...requests].sort((a, b) => toMs(b?.createdAt) - toMs(a?.createdAt));
          this.leaveRequests = sorted;
          this.applyStatusFilter();
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error;
          this.isLoading = false;
        }
      });
  }

  applyStatusFilter(): void {
    if (this.selectedStatus === 'all') {
      this.filteredRequests = [...this.leaveRequests];
    } else {
      this.filteredRequests = this.leaveRequests.filter(
        request => request.status === this.selectedStatus.toUpperCase()
      );
    }
  }

  onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus = target.value;
    this.applyStatusFilter();
  }

  navigateToApplyLeave(): void {
    this.router.navigate(['/ApplyLeave']);
  }

  openModal(request: LeaveRequestResponseDto): void {
    this.selectedRequest = request;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedRequest = null;
  }

  handleCancelRequest(): void {
    if (this.selectedRequest && this.selectedRequest.status === LeaveStatus.PENDING) {
      // Call cancel API
      this.leaveRequestService.cancelRequest(this.selectedRequest.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Refresh the list after successful cancellation
            this.loadMyRequests();
            this.closeModal();
          },
          error: (error) => {
            this.errorMessage = `Failed to cancel request: ${error}`;
          }
        });
    }
  }

  refreshRequests(): void {
    this.loadMyRequests();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case LeaveStatus.ACCEPTED:
        return 'bg-green-100 text-green-700';
      case LeaveStatus.PENDING:
        return 'bg-yellow-100 text-yellow-700';
      case LeaveStatus.REJECTED:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  }

  calculateWorkingDays(startDate: string, endDate: string, halfDay: boolean): number {
    return this.leaveRequestService.calculateWorkingDays(startDate, endDate, halfDay);
  }

  canCancelRequest(request: LeaveRequestResponseDto): boolean {
    return request.status === LeaveStatus.PENDING;
  }

  exportRequests(): void {
    // Convert data to CSV format
    const headers = ['Type', 'Start Date', 'End Date', 'Days', 'Status', 'Reason', 'Submitted'];
    const csvData = this.filteredRequests.map(request => [
      request.type,
      this.formatDate(request.startDate),
      this.formatDate(request.endDate),
      this.calculateWorkingDays(request.startDate, request.endDate, request.halfDay).toString(),
      request.status,
      request.reason,
      request.createdAt ? this.formatDate(request.createdAt) : 'N/A'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leave-requests-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
