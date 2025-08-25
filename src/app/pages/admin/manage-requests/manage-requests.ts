import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faTimesCircle, faEye, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { LeaveRequestService } from '../../../services/leave-request.service';
import { LeaveRequestResponseDto, LeaveStatus } from '../../../models/leave-request.models';
import { AuthService } from '../../../services/auth.service';

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
  // Modal properties
showRequestModal = false;
showRejectModal = false;
showApproveModal = false;        // ✅ NEW
selectedRequest: LeaveRequestResponseDto | null = null;
rejectReason = '';
// approveNote = '';            // Optional if you keep the note input
isProcessing = false;

rejectError = '';
rejectMin = 8;     // min chars to consider the reason meaningful
rejectMax = 300;   // max length to keep it concise

  // Filter properties
  searchTerm = '';
  filterStatus = '';

  // Data properties
  requests: LeaveRequestResponseDto[] = [];
  isLoading = true;
  errorMessage = '';

  // Modal properties


  // Enums for template
  LeaveStatus = LeaveStatus;
// Approve modal handlers
openApproveModal(request: LeaveRequestResponseDto): void {
  this.selectedRequest = request;
  // this.approveNote = ''; // optional
  this.showApproveModal = true;
}

closeApproveModal(): void {
  this.showApproveModal = false;
  // this.approveNote = ''; // optional
  this.selectedRequest = null;
}

confirmApprove(): void {
  if (!this.selectedRequest || this.isProcessing) return;

  this.isProcessing = true;

  this.leaveRequestService.updateRequestStatus(
      this.selectedRequest.id,
      LeaveStatus.ACCEPTED
      // , this.approveNote // optional if your API supports an approval note
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.closeApproveModal();
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
// Old approveRequest: replace with this to route through modal
approveRequest(request: LeaveRequestResponseDto): void {
  if (this.isProcessing) return;
  this.openApproveModal(request);
}

  private destroy$ = new Subject<void>();

  constructor(
    private leaveRequestService: LeaveRequestService,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
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
  onRejectInput(): void {
    const len = this.rejectReason.trim().length;
    if (len === 0) {
      this.rejectError = 'Reason is required.';
    } else if (len < this.rejectMin) {
      this.rejectError = `Please provide at least ${this.rejectMin} characters.`;
    } else if (len > this.rejectMax) {
      this.rejectError = `Reason must be at most ${this.rejectMax} characters.`;
    } else {
      this.rejectError = '';
    }
  }
  
  isRejectValid(): boolean {
    const len = this.rejectReason.trim().length;
    return len >= this.rejectMin && len <= this.rejectMax;
  }
  
  appendRejectChip(text: string): void {
    // Smart append with spacing
    if (!this.rejectReason) this.rejectReason = text;
    else this.rejectReason = (this.rejectReason.trimEnd() + (this.rejectReason.endsWith('.') ? ' ' : '. ') + text);
    this.onRejectInput();
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
    if (this.selectedRequest?.id && documentPath) {
      const token = this.authService.getToken();
      if (!token) {
        console.error('No authentication token found');
        alert('Authentication required. Please log in again.');
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const url = `http://localhost:8080/api/admin/leave-requests/${this.selectedRequest.id}/document`;
      
      this.http.get(url, { 
        headers, 
        responseType: 'blob',
        observe: 'response'
      }).subscribe({
        next: (response) => {
          const blob = response.body;
          if (blob) {
            // Extract filename from content-disposition header or use default
            const contentDisposition = response.headers.get('content-disposition');
            let filename = 'document';
            
            if (contentDisposition) {
              const filenameMatch = contentDisposition.match(/filename="(.+)"/);
              if (filenameMatch) {
                filename = filenameMatch[1];
              }
            }
            
            // Create blob URL and trigger download
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          }
        },
        error: (error) => {
          console.error('Error downloading document:', error);
          if (error.status === 404) {
            alert('Document not found');
          } else if (error.status === 403) {
            alert('Access denied. Admin privileges required.');
          } else {
            alert('Failed to download document. Please try again.');
          }
        }
      });
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