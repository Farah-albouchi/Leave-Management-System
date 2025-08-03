import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { 
  AdminLeaveRequestDto, 
  AdminRequestStats, 
  ApproveRejectRequest, 
  ApproveRejectResponse,
  AdminRequestFilters,
  LeaveStatus 
} from '../models/admin-request.models';

@Injectable({
  providedIn: 'root'
})
export class AdminRequestService {
  private readonly API_URL = 'http://localhost:8080/api/admin';
  
  // Subject to track real-time updates
  private requestsSubject = new BehaviorSubject<AdminLeaveRequestDto[]>([]);
  private statsSubject = new BehaviorSubject<AdminRequestStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  
  public requests$ = this.requestsSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all leave requests with optional filtering
   */
  getAllRequests(filters?: AdminRequestFilters): Observable<AdminLeaveRequestDto[]> {
    let params = new HttpParams();
    
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.employeeId) {
      params = params.set('employeeId', filters.employeeId);
    }
    
    return this.http.get<AdminLeaveRequestDto[]>(`${this.API_URL}/requests`, { params }).pipe(
      tap(requests => {
        // Apply client-side filtering for search and date range
        let filteredRequests = requests;
        
        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredRequests = filteredRequests.filter(request => 
            request.employeeName.toLowerCase().includes(searchTerm) ||
            request.reason.toLowerCase().includes(searchTerm) ||
            request.type.toLowerCase().includes(searchTerm)
          );
        }
        
        if (filters?.dateFrom) {
          filteredRequests = filteredRequests.filter(request => 
            new Date(request.startDate) >= new Date(filters.dateFrom!)
          );
        }
        
        if (filters?.dateTo) {
          filteredRequests = filteredRequests.filter(request => 
            new Date(request.endDate) <= new Date(filters.dateTo!)
          );
        }
        
        this.requestsSubject.next(filteredRequests);
      }),
      catchError(error => {
        console.error('Error fetching admin requests:', error);
        throw error;
      })
    );
  }

  /**
   * Get a specific request by ID
   */
  getRequestById(id: string): Observable<AdminLeaveRequestDto> {
    return this.http.get<AdminLeaveRequestDto>(`${this.API_URL}/requests/${id}`).pipe(
      catchError(error => {
        console.error('Error fetching request details:', error);
        throw error;
      })
    );
  }

  /**
   * Approve a leave request
   */
  approveRequest(id: string, reason?: string): Observable<ApproveRejectResponse> {
    const body: ApproveRejectRequest = reason ? { reason } : {};
    
    return this.http.put<ApproveRejectResponse>(`${this.API_URL}/requests/${id}/approve`, body).pipe(
      tap(() => {
        // Update local state
        this.updateRequestStatus(id, LeaveStatus.ACCEPTED);
      }),
      catchError(error => {
        console.error('Error approving request:', error);
        throw error;
      })
    );
  }

  /**
   * Reject a leave request
   */
  rejectRequest(id: string, reason: string): Observable<ApproveRejectResponse> {
    const body: ApproveRejectRequest = { reason };
    
    return this.http.put<ApproveRejectResponse>(`${this.API_URL}/requests/${id}/reject`, body).pipe(
      tap(() => {
        // Update local state
        this.updateRequestStatus(id, LeaveStatus.REJECTED);
      }),
      catchError(error => {
        console.error('Error rejecting request:', error);
        throw error;
      })
    );
  }

  /**
   * Get request statistics
   */
  getRequestStats(): Observable<AdminRequestStats> {
    return this.http.get<AdminRequestStats>(`${this.API_URL}/requests/stats`).pipe(
      tap(stats => this.statsSubject.next(stats)),
      catchError(error => {
        console.error('Error fetching request stats:', error);
        // Return default stats on error
        const defaultStats = { pending: 0, approved: 0, rejected: 0, total: 0 };
        this.statsSubject.next(defaultStats);
        return [defaultStats];
      })
    );
  }

  /**
   * Update local request status
   */
  private updateRequestStatus(id: string, status: LeaveStatus): void {
    const currentRequests = this.requestsSubject.value;
    const updatedRequests = currentRequests.map(request => 
      request.id === id ? { ...request, status } : request
    );
    this.requestsSubject.next(updatedRequests);
    
    // Update stats
    this.updateLocalStats(status);
  }

  /**
   * Update local statistics after status change
   */
  private updateLocalStats(newStatus: LeaveStatus): void {
    const currentStats = this.statsSubject.value;
    const updatedStats = { ...currentStats };
    
    // Decrement pending (assuming it was pending before)
    if (updatedStats.pending > 0) {
      updatedStats.pending--;
    }
    
    // Increment the new status
    if (newStatus === LeaveStatus.ACCEPTED) {
      updatedStats.approved++;
    } else if (newStatus === LeaveStatus.REJECTED) {
      updatedStats.rejected++;
    }
    
    this.statsSubject.next(updatedStats);
  }

  /**
   * Refresh all data
   */
  refreshData(filters?: AdminRequestFilters): void {
    this.getAllRequests(filters).subscribe();
    this.getRequestStats().subscribe();
  }

  /**
   * Get current requests snapshot
   */
  getCurrentRequests(): AdminLeaveRequestDto[] {
    return this.requestsSubject.value;
  }

  /**
   * Get current stats snapshot
   */
  getCurrentStats(): AdminRequestStats {
    return this.statsSubject.value;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  /**
   * Format date range for display
   */
  formatDateRange(startDate: string, endDate: string): string {
    if (startDate === endDate) {
      return this.formatDate(startDate);
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      // Same month
      return `${start.getDate()}-${end.getDate()} ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    } else {
      // Different months
      return `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
    }
  }

  /**
   * Get status badge classes
   */
  getStatusClasses(status: LeaveStatus): { text: string; background: string } {
    switch (status) {
      case LeaveStatus.ACCEPTED:
        return { text: 'text-green-800', background: 'bg-green-100' };
      case LeaveStatus.REJECTED:
        return { text: 'text-red-800', background: 'bg-red-100' };
      case LeaveStatus.PENDING:
      default:
        return { text: 'text-yellow-800', background: 'bg-yellow-100' };
    }
  }

  /**
   * Get leave type color classes
   */
  getTypeClasses(leaveType: string): { text: string; background: string } {
    switch (leaveType.toLowerCase()) {
      case 'annual leave':
      case 'vacation':
        return { text: 'text-blue-700', background: 'bg-blue-100' };
      case 'sick leave':
      case 'sick':
        return { text: 'text-red-700', background: 'bg-red-100' };
      case 'maternity leave':
      case 'maternity':
        return { text: 'text-purple-700', background: 'bg-purple-100' };
      case 'unpaid leave':
      case 'unpaid':
        return { text: 'text-gray-700', background: 'bg-gray-100' };
      default:
        return { text: 'text-indigo-700', background: 'bg-indigo-100' };
    }
  }
}