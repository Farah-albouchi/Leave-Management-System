import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import {
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faIdCard,
  faEdit,
  faSave,
  faTimes,
  faLock,
  faEye,
  faEyeSlash,
  faSpinner,
  faCheckCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

import { ProfileService } from '../../services/profile.service';
import { Profile, UpdateProfileRequest, ChangePasswordRequest } from '../../models/profile.models';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './employee-profile.html',
  styleUrls: ['./employee-profile.css']
})
export class EmployeeProfile implements OnInit, OnDestroy {
  // Icons
  faUser = faUser;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faMapMarkerAlt = faMapMarkerAlt;
  faIdCard = faIdCard;
  faEdit = faEdit;
  faSave = faSave;
  faTimes = faTimes;
  faLock = faLock;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faSpinner = faSpinner;
  faCheckCircle = faCheckCircle;
  faExclamationTriangle = faExclamationTriangle;

  // Forms
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  // State
  profile: Profile | null = null;
  isEditingProfile = false;
  isLoadingProfile = true;
  isUpdatingProfile = false;
  isChangingPassword = false;
  showCurrentPassword = false;
  showNewPassword = false;

  // Messages
  profileSuccessMessage = '';
  profileErrorMessage = '';
  passwordSuccessMessage = '';
  passwordErrorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.maxLength(20)]],
      address: ['', [Validators.maxLength(255)]],
      cin: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private loadProfile(): void {
    this.isLoadingProfile = true;
    this.profileErrorMessage = '';

    this.profileService.getMyProfile()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingProfile = false)
      )
      .subscribe({
        next: (profile) => {
          this.profile = profile;
          this.populateProfileForm(profile);
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          this.profileErrorMessage = 'Failed to load profile. Please try again.';
        }
      });
  }

  private populateProfileForm(profile: Profile): void {
    this.profileForm.patchValue({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      cin: profile.cin || ''
    });
  }

  enableProfileEdit(): void {
    this.isEditingProfile = true;
    this.profileSuccessMessage = '';
    this.profileErrorMessage = '';
  }

  cancelProfileEdit(): void {
    this.isEditingProfile = false;
    this.profileSuccessMessage = '';
    this.profileErrorMessage = '';
    if (this.profile) {
      this.populateProfileForm(this.profile);
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.isUpdatingProfile = true;
    this.profileSuccessMessage = '';
    this.profileErrorMessage = '';

    const updateRequest: UpdateProfileRequest = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
      email: this.profileForm.value.email,
      phone: this.profileForm.value.phone || undefined,
      address: this.profileForm.value.address || undefined,
      cin: this.profileForm.value.cin || undefined
    };

    this.profileService.updateMyProfile(updateRequest)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isUpdatingProfile = false)
      )
      .subscribe({
        next: (updatedProfile) => {
          this.profile = updatedProfile;
          this.isEditingProfile = false;
          this.profileSuccessMessage = 'Profile updated successfully!';
          setTimeout(() => this.profileSuccessMessage = '', 5000);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.profileErrorMessage = error.error?.message || 'Failed to update profile. Please try again.';
        }
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.isChangingPassword = true;
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';

    const passwordRequest: ChangePasswordRequest = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.profileService.changeMyPassword(passwordRequest)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isChangingPassword = false)
      )
      .subscribe({
        next: () => {
          this.passwordSuccessMessage = 'Password changed successfully!';
          this.passwordForm.reset();
          setTimeout(() => this.passwordSuccessMessage = '', 5000);
        },
        error: (error) => {
          console.error('Error changing password:', error);
          this.passwordErrorMessage = error.error?.message || 'Failed to change password. Please try again.';
        }
      });
  }

  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getter methods for form validation
  get firstName() { return this.profileForm.get('firstName'); }
  get lastName() { return this.profileForm.get('lastName'); }
  get email() { return this.profileForm.get('email'); }
  get phone() { return this.profileForm.get('phone'); }
  get address() { return this.profileForm.get('address'); }
  get currentPassword() { return this.passwordForm.get('currentPassword'); }
  get newPassword() { return this.passwordForm.get('newPassword'); }
}
