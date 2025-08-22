import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor() {}

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
    if (this.leaveRequest?.documentPath) {
      // Create a temporary link to download the document
      const link = document.createElement('a');
      link.href = this.leaveRequest.documentPath;
      link.download = this.leaveRequest.documentPath.split('/').pop() || 'document';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
