import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface EmployeeProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  cin?: number;
  role: string;
  profileCompleted: boolean;
  createdAt: string;
  fullName: string;
  active: boolean;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  cin?: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeProfileService {
  private readonly API_URL = 'http://localhost:8080/api/employee';
  
  // Subject to track current employee profile
  private profileSubject = new BehaviorSubject<EmployeeProfile | null>(null);
  public profile$ = this.profileSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get current employee profile
   */
  getMyProfile(): Observable<EmployeeProfile> {
    return this.http.get<EmployeeProfile>(`${this.API_URL}/profile`).pipe(
      tap(profile => this.profileSubject.next(profile)),
      catchError(this.handleError)
    );
  }

  /**
   * Update current employee profile
   */
  updateMyProfile(request: UpdateProfileRequest): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(`${this.API_URL}/profile`, request).pipe(
      tap(() => {
        // Refresh profile after update
        this.refreshProfile();
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Change password
   */
  changePassword(request: ChangePasswordRequest): Observable<ProfileResponse> {
    return this.http.post<ProfileResponse>(`${this.API_URL}/change-password`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Complete profile (for new employees)
   */
  completeProfile(request: { phone: string; address: string; cin: number }): Observable<ProfileResponse> {
    return this.http.post<ProfileResponse>(`${this.API_URL}/complete-profile`, request).pipe(
      tap(() => {
        // Refresh profile after completion
        this.refreshProfile();
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Refresh current profile
   */
  refreshProfile(): void {
    this.getMyProfile().subscribe();
  }

  /**
   * Get current profile value
   */
  getCurrentProfile(): EmployeeProfile | null {
    return this.profileSubject.value;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    console.error('EmployeeProfileService error:', error);
    
    let errorMessage = 'An error occurred';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => ({ message: errorMessage }));
  }
}