import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { 
  AdminDashboardSummary, 
  MonthlyLeaveStat, 
  LeaveTypeDistribution,
  EmployeeOnLeave,
  AdminDashboardData
} from '../models/admin-dashboard.models';
import { Employee } from '../models/employee.models';
import { AdminLeaveRequestDto } from '../models/admin-request.models';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private readonly API_URL = 'http://localhost:8080/api/admin';
  
  // Subject to track dashboard data updates
  private dashboardDataSubject = new BehaviorSubject<AdminDashboardData | null>(null);
  public dashboardData$ = this.dashboardDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get complete admin dashboard data
   */
  getAdminDashboardData(): Observable<AdminDashboardData> {
    return forkJoin({
      summary: this.getDashboardSummary(),
      monthlyStats: this.getMonthlyStats(),
      leaveTypeDistribution: this.getLeaveTypeDistribution(),
      employeesOnLeave: this.getEmployeesOnLeave()
    }).pipe(
      map(data => ({
        summary: data.summary,
        monthlyStats: data.monthlyStats,
        leaveTypeDistribution: data.leaveTypeDistribution,
        employeesOnLeave: data.employeesOnLeave
      })),
      tap(dashboardData => this.dashboardDataSubject.next(dashboardData)),
      catchError(this.handleError)
    );
  }

  /**
   * Get dashboard summary statistics
   */
  getDashboardSummary(): Observable<AdminDashboardSummary> {
    return this.http.get<AdminDashboardSummary>(`${this.API_URL}/stats/summary`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get monthly leave statistics
   */
  getMonthlyStats(): Observable<MonthlyLeaveStat[]> {
    return this.http.get<MonthlyLeaveStat[]>(`${this.API_URL}/stats/monthly-trend`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get leave type distribution
   */
  getLeaveTypeDistribution(): Observable<LeaveTypeDistribution> {
    return this.http.get<LeaveTypeDistribution>(`${this.API_URL}/stats/leave-types`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get employees currently on leave
   */
  getEmployeesOnLeave(date?: string): Observable<EmployeeOnLeave[]> {
    const options = date ? { params: { date } } : {};
    
    return this.http.get<Employee[]>(`${this.API_URL}/employees/on-leave`, options).pipe(
      map(employees => employees.map((emp: Employee) => ({
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        fullName: emp.fullName
      }))),
      catchError(this.handleError)
    );
  }

  /**
   * Get all leave requests for admin management
   */
  getAllLeaveRequests(status?: string, employeeId?: string): Observable<AdminLeaveRequestDto[]> {
    const params: any = {};
    if (status) params.status = status;
    if (employeeId) params.employeeId = employeeId;
    
    return this.http.get<AdminLeaveRequestDto[]>(`${this.API_URL}/requests`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get pending leave requests
   */
  getPendingRequests(): Observable<AdminLeaveRequestDto[]> {
    return this.getAllLeaveRequests('PENDING');
  }

  /**
   * Get recent leave requests
   */
  getRecentRequests(limit: number = 10): Observable<AdminLeaveRequestDto[]> {
    return this.getAllLeaveRequests().pipe(
      map(requests => {
        // Sort by submission date (most recent first) and limit
        return requests
          .sort((a, b) => {
            const dateA = new Date(a.submittedAt || a.startDate);
            const dateB = new Date(b.submittedAt || b.startDate);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, limit);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Approve a leave request
   */
  approveRequest(requestId: string, reason?: string): Observable<any> {
    const body = reason ? { reason } : {};
    
    return this.http.put(`${this.API_URL}/requests/${requestId}/approve`, body).pipe(
      tap(() => this.refreshDashboardData()),
      catchError(this.handleError)
    );
  }

  /**
   * Reject a leave request
   */
  rejectRequest(requestId: string, reason: string): Observable<any> {
    const body = { reason };
    
    return this.http.put(`${this.API_URL}/requests/${requestId}/reject`, body).pipe(
      tap(() => this.refreshDashboardData()),
      catchError(this.handleError)
    );
  }

  /**
   * Get specific leave request by ID
   */
  getRequestById(requestId: string): Observable<AdminLeaveRequestDto> {
    return this.http.get<AdminLeaveRequestDto>(`${this.API_URL}/requests/${requestId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get all employees
   */
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.API_URL}/employees`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get employee statistics
   */
  getEmployeeStats(): Observable<any> {
    return this.http.get(`${this.API_URL}/employees/stats`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get request statistics
   */
  getRequestStats(): Observable<any> {
    return this.http.get(`${this.API_URL}/requests/stats`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Refresh dashboard data
   */
  refreshDashboardData(): void {
    this.getAdminDashboardData().subscribe();
  }

  /**
   * Get current dashboard data
   */
  getCurrentDashboardData(): AdminDashboardData | null {
    return this.dashboardDataSubject.value;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  /**
   * Format date range for display
   */
  formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric' 
    };
    
    if (start.getTime() === end.getTime()) {
      return start.toLocaleDateString('en-US', options);
    }
    
    if (start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', options)}–${end.toLocaleDateString('en-US', options)}`;
    }
    
    const optionsWithYear = { ...options, year: 'numeric' as const };
    return `${start.toLocaleDateString('en-US', optionsWithYear)}–${end.toLocaleDateString('en-US', optionsWithYear)}`;
  }

  /**
   * Calculate days between dates
   */
  calculateDays(startDate: string, endDate: string, halfDay: boolean = false): number {
    if (halfDay) return 0.5;
    
    if (startDate === endDate) return 1;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays;
  }

  /**
   * Get status badge classes for UI
   */
  getStatusClasses(status: string): { color: string; background: string } {
    switch (status.toUpperCase()) {
      case 'ACCEPTED':
        return { color: 'text-green-600', background: 'bg-green-100' };
      case 'PENDING':
        return { color: 'text-yellow-600', background: 'bg-yellow-100' };
      case 'REJECTED':
        return { color: 'text-red-600', background: 'bg-red-100' };
      default:
        return { color: 'text-gray-600', background: 'bg-gray-100' };
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('AdminDashboardService error:', error);
    
    let errorMessage = 'An error occurred while fetching admin dashboard data';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => ({ message: errorMessage, error }));
  }
}