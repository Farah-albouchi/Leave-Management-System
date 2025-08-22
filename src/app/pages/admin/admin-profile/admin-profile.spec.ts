import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { of } from 'rxjs';

import { AdminProfileComponent } from './admin-profile';
import { AdminProfileService } from '../../../services/admin-profile.service';
import { AuthService } from '../../../services/auth.service';

describe('AdminProfileComponent', () => {
  let component: AdminProfileComponent;
  let fixture: ComponentFixture<AdminProfileComponent>;
  let mockAdminProfileService: jasmine.SpyObj<AdminProfileService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const mockProfile = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    address: '123 Main St',
    cin: 123456789,
    createdAt: '2024-01-01',
    profileCompleted: true,
    role: 'ADMIN' as const
  };

  beforeEach(async () => {
    const adminProfileServiceSpy = jasmine.createSpyObj('AdminProfileService', [
      'getAdminProfile',
      'updateAdminProfile',
      'changePassword'
    ], {
      profile$: of(mockProfile)
    });

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    await TestBed.configureTestingModule({
      imports: [AdminProfileComponent, ReactiveFormsModule, FontAwesomeModule],
      providers: [
        { provide: AdminProfileService, useValue: adminProfileServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    mockAdminProfileService = TestBed.inject(AdminProfileService) as jasmine.SpyObj<AdminProfileService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  beforeEach(() => {
    mockAdminProfileService.getAdminProfile.and.returnValue(of(mockProfile));
    mockAdminProfileService.updateAdminProfile.and.returnValue(of({ message: 'Profile updated successfully' }));
    mockAdminProfileService.changePassword.and.returnValue(of({ message: 'Password changed successfully' }));

    fixture = TestBed.createComponent(AdminProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile on init', () => {
    expect(mockAdminProfileService.getAdminProfile).toHaveBeenCalled();
    expect(component.profile).toEqual(mockProfile);
    expect(component.isLoading).toBeFalse();
  });

  it('should calculate profile completion percentage correctly', () => {
    const percentage = component.getProfileCompletionPercentage();
    expect(percentage).toBe(100); // All fields are filled in mockProfile
  });

  it('should generate initials correctly', () => {
    const initials = component.getInitials();
    expect(initials).toBe('JD');
  });

  it('should format date correctly', () => {
    const formattedDate = component.formatDate('2024-01-01');
    expect(formattedDate).toBe('1/1/2024');
  });

  it('should open edit modal with current profile data', () => {
    component.openEditModal();
    
    expect(component.showEditModal).toBeTrue();
    expect(component.editProfileForm.get('firstName')?.value).toBe('John');
    expect(component.editProfileForm.get('lastName')?.value).toBe('Doe');
    expect(component.editProfileForm.get('email')?.value).toBe('john.doe@example.com');
  });

  it('should open password modal', () => {
    component.openPasswordModal();
    
    expect(component.showPasswordModal).toBeTrue();
    expect(component.changePasswordForm.pristine).toBeTrue();
  });

  it('should close modals correctly', () => {
    component.showEditModal = true;
    component.showPasswordModal = true;
    
    component.closeEditModal();
    component.closePasswordModal();
    
    expect(component.showEditModal).toBeFalse();
    expect(component.showPasswordModal).toBeFalse();
  });

  it('should update profile successfully', () => {
    component.profile = mockProfile;
    component.openEditModal();
    
    const updateData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+0987654321',
      address: '456 Oak St',
      cin: '987654321'
    };
    
    component.editProfileForm.patchValue(updateData);
    component.updateProfile();
    
    expect(mockAdminProfileService.updateAdminProfile).toHaveBeenCalledWith(updateData);
  });

  it('should change password successfully', () => {
    component.openPasswordModal();
    
    const passwordData = {
      currentPassword: 'oldpass',
      newPassword: 'newpass',
      confirmPassword: 'newpass'
    };
    
    component.changePasswordForm.patchValue(passwordData);
    component.changePassword();
    
    expect(mockAdminProfileService.changePassword).toHaveBeenCalledWith({
      currentPassword: 'oldpass',
      newPassword: 'newpass'
    });
  });

  it('should toggle password visibility', () => {
    expect(component.showCurrentPassword).toBeFalse();
    expect(component.showNewPassword).toBeFalse();
    expect(component.showConfirmPassword).toBeFalse();
    
    component.togglePasswordVisibility('current');
    component.togglePasswordVisibility('new');
    component.togglePasswordVisibility('confirm');
    
    expect(component.showCurrentPassword).toBeTrue();
    expect(component.showNewPassword).toBeTrue();
    expect(component.showConfirmPassword).toBeTrue();
  });

  it('should clear messages', () => {
    component.errorMessage = 'Error message';
    component.successMessage = 'Success message';
    
    component.clearMessages();
    
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
  });
}); 