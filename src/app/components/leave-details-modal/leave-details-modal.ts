import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTimes,
  faCalendarAlt,
  faUser,
  faFileAlt,
  faDownload,
  faCheck,
  faClock,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { LeaveRequestResponseDto, LeaveStatus } from '../../models/leave-request.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-leave-details-modal',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './leave-details-modal.html',
  styleUrls: ['./leave-details-modal.css']
})
export class LeaveDetailsModal implements OnInit {
  @Input() leaveRequest: LeaveRequestResponseDto | null = null;
  @Input() isVisible = false;
  @Output() closeModal = new EventEmitter<void>();

  // Icons
  faTimes = faTimes;
  faCalendarAlt = faCalendarAlt;
  faUser = faUser;
  faFileAlt = faFileAlt;
  faDownload = faDownload;
  faCheck = faCheck;
  faClock = faClock;
  faExclamationTriangle = faExclamationTriangle;

  // Make LeaveStatus available in template
  LeaveStatus = LeaveStatus;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCloseModal();
    }
  }

  getStatusIcon() {
    if (!this.leaveRequest) return faClock;
    
    switch (this.leaveRequest.status) {
      case LeaveStatus.ACCEPTED:
        return faCheck;
      case LeaveStatus.REJECTED:
        return faExclamationTriangle;
      case LeaveStatus.PENDING:
      default:
        return faClock;
    }
  }

  getStatusClass(): string {
    if (!this.leaveRequest) return 'status-pending';
    
    switch (this.leaveRequest.status) {
      case LeaveStatus.ACCEPTED:
        return 'status-approved';
      case LeaveStatus.REJECTED:
        return 'status-rejected';
      case LeaveStatus.PENDING:
      default:
        return 'status-pending';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  calculateDuration(): number {
    if (!this.leaveRequest) return 0;
    
    const startDate = new Date(this.leaveRequest.startDate);
    const endDate = new Date(this.leaveRequest.endDate);
    
    // Calculate working days (excluding weekends)
    let count = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Adjust for half day
    if (this.leaveRequest.halfDay && count === 1) {
      return 0.5;
    }
    
    return count;
  }

  downloadDocument(): void {
    if (this.leaveRequest?.id && this.leaveRequest?.documentPath) {
      const token = this.authService.getToken();
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      const url = `http://localhost:8080/api/admin/leave-requests/${this.leaveRequest.id}/document`;
      
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
}

