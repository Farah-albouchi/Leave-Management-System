import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmployeeStats,
  CreateEmployeeResponse,
  UpdateEmployeeResponse,
  DeleteEmployeeResponse,
  ResetPasswordResponse,
  EmployeeFilter
} from '../models/employee.models';
import { AdminLeaveRequestDto } from '../models/admin-request.models';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly API_URL = 'http://localhost:8080/api/admin/employees';
  
  // Subject to track real-time updates
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  private statsSubject = new BehaviorSubject<EmployeeStats>({
    totalEmployees: 0,
    totalAdmins: 0,
    profileCompleted: 0,
    profilePending: 0,
    totalUsers: 0
  });
  
  public employees$ = this.employeesSubject.asObservable();
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all employees
   */
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.API_URL).pipe(
      tap(employees => this.employeesSubject.next(employees)),
      catchError(this.handleError)
    );
  }

  /**
   * Get employee by ID
   */
  getEmployeeById(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create new employee
   */
  createEmployee(request: CreateEmployeeRequest): Observable<CreateEmployeeResponse> {
    return this.http.post<CreateEmployeeResponse>(this.API_URL, request).pipe(
      tap(() => {
        // Refresh employees list after creation
        this.refreshEmployees();
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update employee
   */
  updateEmployee(id: string, request: UpdateEmployeeRequest): Observable<UpdateEmployeeResponse> {
    return this.http.put<UpdateEmployeeResponse>(`${this.API_URL}/${id}`, request).pipe(
      tap(() => {
        // Refresh employees list after update
        this.refreshEmployees();
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete employee
   */
  deleteEmployee(id: string): Observable<DeleteEmployeeResponse> {
    return this.http.delete<DeleteEmployeeResponse>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        // Remove from local state
        const currentEmployees = this.employeesSubject.value;
        const updatedEmployees = currentEmployees.filter(emp => emp.id !== id);
        this.employeesSubject.next(updatedEmployees);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Reset employee password
   */
  resetPassword(id: string): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(`${this.API_URL}/${id}/reset-password`, {}).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get employee leave history
   */
  getEmployeeLeaveHistory(id: string): Observable<AdminLeaveRequestDto[]> {
    return this.http.get<AdminLeaveRequestDto[]>(`${this.API_URL}/${id}/leave-history`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get employee statistics
   */
  getEmployeeStats(): Observable<EmployeeStats> {
    return this.http.get<EmployeeStats>(`${this.API_URL}/stats`).pipe(
      tap(stats => this.statsSubject.next(stats)),
      catchError(this.handleError)
    );
  }

  /**
   * Filter employees locally
   */
  filterEmployees(employees: Employee[], filters: EmployeeFilter): Employee[] {
    return employees.filter(employee => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          employee.fullName.toLowerCase().includes(searchTerm) ||
          employee.email.toLowerCase().includes(searchTerm) ||
          (employee.phone && employee.phone.includes(searchTerm));
        
        if (!matchesSearch) return false;
      }

      // Role filter
      if (filters.role) {
        if (employee.role !== filters.role) return false;
      }

      // Status filter (assuming active means profile completed for now)
      if (filters.status) {
        if (filters.status === 'active' && !employee.profileCompleted) return false;
        if (filters.status === 'inactive' && employee.profileCompleted) return false;
      }

      // Profile completion filter
      if (filters.profileCompleted !== null && filters.profileCompleted !== undefined) {
        if (employee.profileCompleted !== filters.profileCompleted) return false;
      }

      return true;
    });
  }

  /**
   * Refresh employees list
   */
  refreshEmployees(): void {
    this.getAllEmployees().subscribe();
  }

  /**
   * Refresh statistics
   */
  refreshStats(): void {
    this.getEmployeeStats().subscribe();
  }

  /**
   * Get current employees snapshot
   */
  getCurrentEmployees(): Employee[] {
    return this.employeesSubject.value;
  }

  /**
   * Get current stats snapshot
   */
  getCurrentStats(): EmployeeStats {
    return this.statsSubject.value;
  }

  /**
   * Format employee name
   */
  formatEmployeeName(employee: Employee): string {
    return `${employee.firstName} ${employee.lastName}`;
  }

  /**
   * Get employee initials
   */
  getEmployeeInitials(employee: Employee): string {
    return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  }

  /**
   * Format employee role for display
   */
  formatRole(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }

  /**
   * Get role badge classes
   */
  getRoleClasses(role: string): { text: string; background: string } {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return { text: 'text-purple-800', background: 'bg-purple-100' };
      case 'EMPLOYEE':
      default:
        return { text: 'text-blue-800', background: 'bg-blue-100' };
    }
  }

  /**
   * Get status badge classes
   */
  getStatusClasses(profileCompleted: boolean): { text: string; background: string } {
    if (profileCompleted) {
      return { text: 'text-green-800', background: 'bg-green-100' };
    } else {
      return { text: 'text-yellow-800', background: 'bg-yellow-100' };
    }
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
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('Employee service error:', error);
    
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request data';
          break;
        case 401:
          errorMessage = 'Unauthorized access';
          break;
        case 403:
          errorMessage = 'Access forbidden';
          break;
        case 404:
          errorMessage = 'Employee not found';
          break;
        case 409:
          errorMessage = 'Employee already exists';
          break;
        case 500:
          errorMessage = 'Server error occurred';
          break;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}