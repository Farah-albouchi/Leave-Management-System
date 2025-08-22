import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AdminProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  cin?: number;
  createdAt: string;
  profileCompleted: boolean;
  role: 'ADMIN';
}

export interface UpdateAdminProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  cin?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse {
  message: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AdminProfileService {
  private readonly API_URL = 'http://localhost:8080/api/admin';
  private profileSubject = new BehaviorSubject<AdminProfile | null>(null);
  public profile$ = this.profileSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAdminProfile(): Observable<AdminProfile> {
    return this.http.get<AdminProfile>(`${this.API_URL}/profile`)
      .pipe(
        tap(profile => this.profileSubject.next(profile))
      );
  }

  updateAdminProfile(request: UpdateAdminProfileRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.API_URL}/profile`, request)
      .pipe(
        tap(() => {
          // Refresh profile data after update
          this.getAdminProfile().subscribe();
        })
      );
  }

  changePassword(request: ChangePasswordRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/profile/change-password`, request);
  }

  getCurrentProfile(): AdminProfile | null {
    return this.profileSubject.value;
  }

  clearProfile(): void {
    this.profileSubject.next(null);
  }
} 