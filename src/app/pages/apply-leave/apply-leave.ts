import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LeaveRequestService } from '../../services/leave-request.service';
import { CalendarStateService } from '../../services/calendar-state.service';
import { LeaveRequestCreateDto, LeaveType, LeaveStatus } from '../../models/leave-request.models';

@Component({
  standalone: true,
  selector: 'app-apply-leave',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './apply-leave.html',
  styleUrls: ['./apply-leave.css'],
})
export class ApplyLeave implements OnInit, OnDestroy {
  leaveForm!: FormGroup;
  leaveTypes = Object.values(LeaveType);
  selectedFile: File | null = null;
  calculatedDays = 0;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  fileError = '';
  dateError = '';
  prefilledFromCalendar = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private leaveRequestService: LeaveRequestService,
    private calendarStateService: CalendarStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkForPrefilledDates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.leaveForm = this.fb.group({
      type: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      halfDay: [false],
      reason: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });


    this.leaveForm.get('startDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.calculateWorkingDays());
    
    this.leaveForm.get('endDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.calculateWorkingDays());
    
    this.leaveForm.get('halfDay')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.calculateWorkingDays());
  }

  private checkForPrefilledDates(): void {
    // Check for dates from router state (navigation from calendar)
    const navigation = this.router.getCurrentNavigation();
    const routerState = navigation?.extras?.state;
    
    if (routerState?.['prefillDates']) {
      const prefillDates = routerState['prefillDates'];
      this.prefillDates(prefillDates.startDate, prefillDates.endDate);
      this.prefilledFromCalendar = true;
      return;
    }

    // Check calendar state service for selected dates
    const selectedRange = this.calendarStateService.getSelectedDateRange();
    if (selectedRange.startDate) {
      this.prefillDates(selectedRange.startDate, selectedRange.endDate || selectedRange.startDate);
      this.prefilledFromCalendar = true;
    }
  }

  private prefillDates(startDate: Date, endDate: Date): void {
    // Format dates for input fields (YYYY-MM-DD)
    const formatDateForInput = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    // Check for conflicts before prefilling
    if (this.hasConflictWithApprovedLeave(startDate, endDate)) {
      this.errorMessage = 'The selected dates conflict with existing approved leave. Please choose different dates.';
      return;
    }

    this.leaveForm.patchValue({
      startDate: formatDateForInput(startDate),
      endDate: formatDateForInput(endDate)
    });

    // Calculate working days after prefilling
    setTimeout(() => {
      this.calculateWorkingDays();
    }, 100);

    this.successMessage = `Dates prefilled from calendar: ${this.formatDisplayDate(startDate)} to ${this.formatDisplayDate(endDate)}`;
  }

  private hasConflictWithApprovedLeave(startDate: Date, endDate: Date): boolean {
    // This would ideally call a service to check for conflicts
    // For now, we'll return false and let the backend handle validation
    return false;
  }

  private formatDisplayDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  clearPrefilledDates(): void {
    this.leaveForm.patchValue({
      startDate: '',
      endDate: ''
    });
    this.prefilledFromCalendar = false;
    this.successMessage = '';
    this.errorMessage = '';
    this.calendarStateService.clearSelectedDateRange();
    this.calculateWorkingDays();
  }

  calculateWorkingDays(): void {
    const startDate = this.leaveForm.get('startDate')?.value;
    const endDate = this.leaveForm.get('endDate')?.value;
    const halfDay = this.leaveForm.get('halfDay')?.value || false;

    this.dateError = '';

    if (startDate && endDate) {
      // Validate date range
      const dateValidationError = this.leaveRequestService.validateDateRange(startDate, endDate);
      if (dateValidationError) {
        this.dateError = dateValidationError;
        this.calculatedDays = 0;
        return;
      }

      // Calculate working days
      this.calculatedDays = this.leaveRequestService.calculateWorkingDays(startDate, endDate, halfDay);
    } else {
      this.calculatedDays = 0;
    }
  }

  onFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    this.fileError = '';
    this.selectedFile = null;

    if (file) {
      // Validate file
      const fileValidationError = this.leaveRequestService.validateFile(file);
      if (fileValidationError) {
        this.fileError = fileValidationError;
        target.value = ''; // Clear file input
        return;
      }

      this.selectedFile = file;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileError = '';
    // Clear file input
    const fileInput = document.getElementById('document') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.leaveForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (this.dateError) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.leaveForm.value;
    const requestData: LeaveRequestCreateDto = {
      type: formValue.type,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      halfDay: formValue.halfDay,
      reason: formValue.reason.trim()
    };

    this.leaveRequestService.submitLeaveRequest(requestData, this.selectedFile || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Leave request submitted successfully! You will be notified once it\'s reviewed.';
          
          // Reset form after successful submission
          setTimeout(() => {
            this.leaveForm.reset();
            this.selectedFile = null;
            this.calculatedDays = 0;
            this.successMessage = '';
            
            // Optionally redirect to my requests page
            this.router.navigate(['/myRequests']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error;
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.leaveForm.controls).forEach(key => {
      const control = this.leaveForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for validation feedback
  isFieldInvalid(fieldName: string): boolean {
    const field = this.leaveForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.leaveForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldDisplayName(fieldName)} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      type: 'Leave type',
      startDate: 'Start date',
      endDate: 'End date',
      reason: 'Reason'
    };
    return displayNames[fieldName] || fieldName;
  }

  getFileSize(bytes: number): string {
    return this.leaveRequestService.getFileSize(bytes);
  }
}
