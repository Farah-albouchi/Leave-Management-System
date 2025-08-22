import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faUser, 
  faEdit, 
  faKey, 
  faCheck, 
  faTimes,
  faIdCard,
  faPhone,
  faMapMarkerAlt,
  faEnvelope,
  faCalendar,
  faShieldAlt,
  faEye,
  faEyeSlash,
  faCrown,
  faExclamationTriangle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

import { AdminProfileService, AdminProfile, UpdateAdminProfileRequest, ChangePasswordRequest } from '../../../services/admin-profile.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-profile.html',
  styleUrls: ['./admin-profile.css']
})
export class AdminProfileComponent implements OnInit, OnDestroy {
  // Icons
  faUser = faUser;
  faEdit = faEdit;
  faKey = faKey;
  faCheck = faCheck;
  faTimes = faTimes;
  faIdCard = faIdCard;
  faPhone = faPhone;
  faMapMarkerAlt = faMapMarkerAlt;
  faEnvelope = faEnvelope;
  faCalendar = faCalendar;
  faShieldAlt = faShieldAlt;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faCrown = faCrown;
  faExclamationTriangle = faExclamationTriangle;
  faCheckCircle = faCheckCircle;

  // Data properties
  profile: AdminProfile | null = null;
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Modal states
  showEditModal = false;
  showPasswordModal = false;

  // Form properties
  editProfileForm!: FormGroup;
  changePasswordForm!: FormGroup;

  // Password visibility
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Loading states
  isUpdating = false;
  isChangingPassword = false;

  private destroy$ = new Subject<void>();

  constructor(
    private profileService: AdminProfileService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadProfile();
    this.subscribeToProfileChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.body.classList.remove('modal-open');
  }

  private initializeForms(): void {
    this.editProfileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[\d\s\-\+\(\)]+$/)]],
      address: [''],
      cin: ['', [Validators.pattern(/^\d+$/)]]
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  private loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.profileService.getAdminProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.profile = profile;
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to load profile';
          this.isLoading = false;
        }
      });
  }

  private subscribeToProfileChanges(): void {
    this.profileService.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        if (profile) {
          this.profile = profile;
        }
      });
  }

  // Edit Profile Methods
  openEditModal(): void {
    if (!this.profile) return;
    
    this.clearMessages();
    this.editProfileForm.patchValue({
      firstName: this.profile.firstName || '',
      lastName: this.profile.lastName || '',
      email: this.profile.email || '',
      phone: this.profile.phone || '',
      address: this.profile.address || '',
      cin: this.profile.cin?.toString() || ''
    });
    
    this.showEditModal = true;
    document.body.classList.add('modal-open');
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editProfileForm.reset();
    document.body.classList.remove('modal-open');
  }

  updateProfile(): void {
    if (this.editProfileForm.valid && !this.isUpdating) {
      this.isUpdating = true;
      const request: UpdateAdminProfileRequest = this.editProfileForm.value;
      
      this.profileService.updateAdminProfile(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.successMessage = response.message;
            this.closeEditModal();
            this.isUpdating = false;
          },
          error: (error) => {
            this.errorMessage = error.error?.message || 'Failed to update profile';
            this.isUpdating = false;
          }
        });
    }
  }

  // Change Password Methods
  openPasswordModal(): void {
    this.clearMessages();
    this.changePasswordForm.reset();
    this.showPasswordModal = true;
    document.body.classList.add('modal-open');
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.changePasswordForm.reset();
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
    document.body.classList.remove('modal-open');
  }

  changePassword(): void {
    if (this.changePasswordForm.valid && !this.isChangingPassword) {
      this.isChangingPassword = true;
      const request: ChangePasswordRequest = {
        currentPassword: this.changePasswordForm.value.currentPassword,
        newPassword: this.changePasswordForm.value.newPassword
      };
      
      this.profileService.changePassword(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.successMessage = response.message;
            this.closePasswordModal();
            this.isChangingPassword = false;
          },
          error: (error) => {
            this.errorMessage = error.error?.message || 'Failed to change password';
            this.isChangingPassword = false;
          }
        });
    }
  }

  // Utility Methods
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  getProfileCompletionPercentage(): number {
    if (!this.profile) return 0;
    
    const fields = [
      this.profile.firstName,
      this.profile.lastName,
      this.profile.email,
      this.profile.phone,
      this.profile.address,
      this.profile.cin
    ];
    
    const completedFields = fields.filter(field => field != null && field !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  }

  getInitials(): string {
    if (!this.profile) return '';
    const first = this.profile.firstName?.charAt(0) || '';
    const last = this.profile.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }
} 