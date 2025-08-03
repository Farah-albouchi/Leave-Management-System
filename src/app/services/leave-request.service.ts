import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  LeaveRequestCreateDto, 
  LeaveRequestResponseDto, 
  ApiResponse,
  LeaveStatus 
} from '../models/leave-request.models';

@Injectable({
  providedIn: 'root'
})
export class LeaveRequestService {
  private readonly API_URL = 'http://localhost:8080/api/leave';

  constructor(private http: HttpClient) {}

  /**
   * Submit a new leave request with optional document upload
   */
  submitLeaveRequest(
    requestData: LeaveRequestCreateDto, 
    document?: File
  ): Observable<LeaveRequestResponseDto> {
    const formData = new FormData();
    
    // Add the DTO as JSON blob
    const dtoBlob = new Blob([JSON.stringify(requestData)], {
      type: 'application/json'
    });
    formData.append('dto', dtoBlob);
    
    // Add document if provided
    if (document) {
      formData.append('document', document, document.name);
    }

    return this.http.post<LeaveRequestResponseDto>(`${this.API_URL}/request`, formData)
      .pipe(
        catchError(error => {
          console.error('Error submitting leave request:', error);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * Get current user's leave requests
   */
  getMyRequests(): Observable<LeaveRequestResponseDto[]> {
    return this.http.get<LeaveRequestResponseDto[]>(`${this.API_URL}/my-requests`)
      .pipe(
        catchError(error => {
          console.error('Error fetching leave requests:', error);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * Get all requests for admin
   */
  getAllRequestsForAdmin(): Observable<LeaveRequestResponseDto[]> {
    return this.http.get<LeaveRequestResponseDto[]>('http://localhost:8080/api/admin/requests')
      .pipe(
        catchError(error => {
          console.error('Error fetching admin requests:', error);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * Update request status (for admin)
   */
  updateRequestStatus(requestId: string, status: LeaveStatus, reason?: string): Observable<any> {
    const url = status === LeaveStatus.ACCEPTED 
      ? `http://localhost:8080/api/admin/requests/${requestId}/approve`
      : `http://localhost:8080/api/admin/requests/${requestId}/reject`;
    
    const body = reason ? { reason } : {};
    
    return this.http.put(url, body)
      .pipe(
        catchError(error => {
          console.error('Error updating request status:', error);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * Get specific leave request by ID
   */
  getRequestById(id: string): Observable<LeaveRequestResponseDto> {
    return this.http.get<LeaveRequestResponseDto>(`${this.API_URL}/my-requests/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching leave request:', error);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * Cancel a pending leave request
   */
  cancelRequest(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/my-requests/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error canceling leave request:', error);
          return throwError(() => this.handleError(error));
        })
      );
  }

  /**
   * Calculate working days between two dates (excluding weekends)
   */
  calculateWorkingDays(startDate: string, endDate: string, isHalfDay: boolean = false): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) return 0;
    
    let workingDays = 0;
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Adjust for half day
    if (isHalfDay && workingDays > 0) {
      workingDays -= 0.5;
    }
    
    return workingDays;
  }

  /**
   * Validate date range for leave request
   */
  validateDateRange(startDate: string, endDate: string): string | null {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (start < today) {
      return 'Start date cannot be in the past';
    }
    
    if (end < start) {
      return 'End date must be after start date';
    }
    
    // Check if start date is too far in future (optional business rule)
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
    
    if (start > maxFutureDate) {
      return 'Start date cannot be more than 1 year in the future';
    }
    
    return null;
  }

  /**
   * Get file size in human readable format
   */
  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate file upload
   */
  validateFile(file: File): string | null {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (file.size > maxSize) {
      return `File size must be less than ${this.getFileSize(maxSize)}`;
    }
    
    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF, JPG, PNG, and DOCX files are allowed';
    }
    
    return null;
  }

  private handleError(error: any): string {
    if (error.status === 0) {
      return 'Unable to connect to server. Please check your connection.';
    } else if (error.status === 401) {
      return 'You are not authorized to perform this action.';
    } else if (error.status === 400) {
      return error.error?.message || 'Invalid request data.';
    } else if (error.status === 500) {
      return 'Server error. Please try again later.';
    } else {
      return error.error?.message || 'An unexpected error occurred.';
    }
  }
}