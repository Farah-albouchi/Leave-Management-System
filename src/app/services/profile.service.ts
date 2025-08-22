import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile, UpdateProfileRequest, ChangePasswordRequest, ProfileUpdateResponse } from '../models/profile.models';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly API_URL = 'http://localhost:8080/api/employee';

  constructor(private http: HttpClient) {}

  /**
   * Get current user's profile
   */
  getMyProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.API_URL}/me/profile`);
  }

  /**
   * Update current user's profile
   */
  updateMyProfile(updateRequest: UpdateProfileRequest): Observable<ProfileUpdateResponse> {
    return this.http.put<ProfileUpdateResponse>(`${this.API_URL}/me/profile`, updateRequest);
  }

  /**
   * Change current user's password
   */
  changeMyPassword(passwordRequest: ChangePasswordRequest): Observable<string> {
    return this.http.put<string>(`${this.API_URL}/me/password`, passwordRequest);
  }
}
