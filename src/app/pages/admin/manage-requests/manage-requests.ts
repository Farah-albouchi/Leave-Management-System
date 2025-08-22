import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faTimesCircle, faEye, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { LeaveRequestService } from '../../../services/leave-request.service';
import { LeaveRequestResponseDto, LeaveStatus } from '../../../models/leave-request.models';

@Component({
  selector: 'app-admin-requests',
  templateUrl: './manage-requests.html',
  styleUrls: ['./manage-requests.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
})
export class ManageRequests implements OnInit, OnDestroy {
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;
  faEye = faEye;
  faRefresh = faRefresh;

  // Filter properties
  searchTerm = '';
  filterStatus = '';

  // Data properties
  requests: LeaveRequestResponseDto[] = [];
  isLoading = true;
  errorMessage = '';

  // Modal properties
  showRequestModal = false;
  showRejectModal = false;
  selectedRequest: LeaveRequestResponseDto | null = null;
  rejectReason = '';
  isProcessing = false;

  // Enums for template
  LeaveStatus = LeaveStatus;

  private destroy$ = new Subject<void>();

  constructor(
    private leaveRequestService: LeaveRequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRequests(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Use the existing leave request service which should work for admin too
    this.leaveRequestService.getAllRequestsForAdmin()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (requests) => {
          this.requests = requests;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading requests:', error);
          this.errorMessage = 'Failed to load requests. Please try again.';
          this.isLoading = false;
        }
      });
  }

  filteredRequests(): LeaveRequestResponseDto[] {
    return this.requests
      .filter(request => {
        const matchesSearch =
          !this.searchTerm ||
          request.employeeName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          request.reason.toLowerCase().includes(this.searchTerm.toLowerCase());
  
        const matchesStatus =
          !this.filterStatus || request.status === this.filterStatus;
  
        return matchesSearch && matchesStatus;
      })
      // 🔑 Sort by createdAt DESC (most recent first)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }
  
  onFiltersChange(): void {
    // Filters are applied through filteredRequests() method
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterStatus = '';
  }

  refreshData(): void {
    this.loadRequests();
  }

  // Simple approve action
  approveRequest(request: LeaveRequestResponseDto): void {
    if (this.isProcessing) return;
    
    if (!confirm(`Are you sure you want to approve ${request.employeeName || 'this employee'}'s leave request?`)) {
      return;
    }

    this.isProcessing = true;
    
    this.leaveRequestService.updateRequestStatus(request.id, LeaveStatus.ACCEPTED)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Request approved successfully');
          this.isProcessing = false;
          this.refreshData();
        },
        error: (error) => {
          console.error('Error approving request:', error);
          this.errorMessage = 'Failed to approve request. Please try again.';
          this.isProcessing = false;
        }
      });
  }

  // Open reject modal
  openRejectModal(request: LeaveRequestResponseDto): void {
    this.selectedRequest = request;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedRequest = null;
    this.rejectReason = '';
  }

  // Reject with reason
  confirmReject(): void {
    if (!this.selectedRequest || !this.rejectReason.trim() || this.isProcessing) return;

    this.isProcessing = true;

    this.leaveRequestService.updateRequestStatus(this.selectedRequest.id, LeaveStatus.REJECTED, this.rejectReason)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Request rejected successfully');
          this.closeRejectModal();
          this.isProcessing = false;
          this.refreshData();
        },
        error: (error) => {
          console.error('Error rejecting request:', error);
          this.errorMessage = 'Failed to reject request. Please try again.';
          this.isProcessing = false;
        }
      });
  }

  // Modal methods
  openRequestModal(request: LeaveRequestResponseDto): void {
    this.selectedRequest = request;
    this.showRequestModal = true;
  }

  closeRequestModal(): void {
    this.showRequestModal = false;
    this.selectedRequest = null;
  }

  // Utility methods
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

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

  getStatusClasses(status: LeaveStatus): string {
    switch (status) {
      case LeaveStatus.ACCEPTED:
        return 'bg-green-100 text-green-800';
      case LeaveStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case LeaveStatus.PENDING:
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }

  getEmployeeInitials(employeeName: string): string {
    if (!employeeName) return '?';
    
    return employeeName
      .split(' ')
      .filter(name => name.length > 0)
      .map(name => name.charAt(0).toUpperCase())
      .join('');
  }

  downloadDocument(documentPath: string): void {
    if (documentPath) {
      window.open(`http://localhost:8080/uploads/${documentPath}`, '_blank');
    }
  }

  // Statistics
  getRequestStats() {
    return {
      pending: this.requests.filter(r => r.status === LeaveStatus.PENDING).length,
      approved: this.requests.filter(r => r.status === LeaveStatus.ACCEPTED).length,
      rejected: this.requests.filter(r => r.status === LeaveStatus.REJECTED).length,
      total: this.requests.length
    };
  }
}