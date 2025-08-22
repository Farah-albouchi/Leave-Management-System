import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, timeout, catchError, throwError } from 'rxjs';
import { Employee } from '../models/employee.models';
import { LeaveBalanceDto } from '../models/leave-balance.models';
import { LeaveRequestResponseDto } from '../models/leave-request.models';
import { AdminLeaveRequestDto } from '../models/admin-request.models';

@Injectable({
  providedIn: 'root'
})
export class EmployeeProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api';

  /**
   * Get employee details by ID
   * @param employeeId - The ID of the employee
   * @returns Observable<Employee>
   */
  getEmployeeDetails(employeeId: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/admin/employees/${employeeId}`);
  }

  /**
   * Get leave balances for a specific employee
   * @param employeeId - The ID of the employee
   * @returns Observable<any[]> - Backend LeaveBalance format
   */
  getEmployeeLeaveBalances(employeeId: string): Observable<any[]> {
    console.log('🔄 Service: Calling leave balances API for employee:', employeeId);
    return this.http.get<any[]>(`${this.baseUrl}/admin/leave-balance/${employeeId}`)
      .pipe(
        timeout(10000), // 10 second timeout
        catchError(error => {
          console.error('❌ Service: Leave balances API error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get recent leave requests for a specific employee
   * @param employeeId - The ID of the employee
   * @param limit - Maximum number of requests to return (default: 10)
   * @returns Observable<any[]> - Backend AdminLeaveRequestDto format
   */
  getEmployeeRecentRequests(employeeId: string, limit: number = 10): Observable<any[]> {
    console.log('🔄 Service: Calling leave history API for employee:', employeeId);
    return this.http.get<any[]>(`${this.baseUrl}/admin/employees/${employeeId}/leave-history`)
      .pipe(
        timeout(10000), // 10 second timeout
        catchError(error => {
          console.error('❌ Service: Leave history API error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Create a leave request for a specific employee (admin only)
   * @param leaveRequest - The leave request data including employeeId
   * @returns Observable<any>
   */
  createLeaveRequestForEmployee(leaveRequest: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/employees/leave-request`, leaveRequest);
  }

  /**
   * Debug endpoint to check authentication
   * @returns Observable<any>
   */
  debugAuth(): Observable<any> {
    console.log('🔄 Service: Calling debug auth API');
    return this.http.get<any>(`${this.baseUrl}/admin/debug/auth`)
      .pipe(
        timeout(5000), // 5 second timeout for debug
        catchError(error => {
          console.error('❌ Service: Debug auth API error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Test backend connectivity
   * @returns Observable<any>
   */
  testBackendHealth(): Observable<any> {
    console.log('🔄 Service: Testing backend health');
    return this.http.get<any>(`${this.baseUrl}/auth/health`)
      .pipe(
        timeout(5000),
        catchError(error => {
          console.error('❌ Service: Backend health check failed:', error);
          return throwError(() => error);
        })
      );
  }
}
