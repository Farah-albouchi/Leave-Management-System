import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectionStrategy, inject, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark, faUser, faEnvelope, faPhone, faBuilding, faCalendarAlt, faClipboardList, faSpinner, faCheck, faExclamationTriangle, faClock, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { Employee } from '../../models/employee.models';
import { LeaveBalanceDto } from '../../models/leave-balance.models';
import { LeaveRequestResponseDto } from '../../models/leave-request.models';
import { EmployeeProfileService } from '../../services/employee-profile.service';

@Component({
  selector: 'app-employee-profile-modal',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './employee-profile-modal.html',
  styleUrls: ['./employee-profile-modal.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeProfileModalComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() employee: Employee | null = null;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();

  @ViewChild('firstFocusable', { static: false }) firstFocusable?: ElementRef<HTMLElement>;
  @ViewChild('lastFocusable', { static: false }) lastFocusable?: ElementRef<HTMLElement>;

  // FontAwesome icons
  faXmark = faXmark;
  faUser = faUser;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faBuilding = faBuilding;
  faCalendarAlt = faCalendarAlt;
  faClipboardList = faClipboardList;
  faSpinner = faSpinner;
  faCheck = faCheck;
  faExclamationTriangle = faExclamationTriangle;
  faClock = faClock;
  faPlus = faPlus;

  // Data properties
  leaveBalances: any[] = []; // Backend returns LeaveBalance format
  recentRequests: any[] = []; // Backend returns AdminLeaveRequestDto format
  
  // Loading states
  isLoadingBalances = false;
  isLoadingRequests = false;
  
  // Error states
  balancesError = '';
  requestsError = '';
  
  // Create leave request form states
  showCreateForm = false;
  createLeaveForm!: FormGroup;
  isSubmittingRequest = false;

  private destroy$ = new Subject<void>();
  private employeeProfileService = inject(EmployeeProfileService);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    console.log('🔄 EmployeeProfileModal ngOnInit, employee:', this.employee);
    this.initializeCreateForm();
    if (this.employee) {
      this.loadEmployeeData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🔄 EmployeeProfileModal ngOnChanges:', changes);
    
    // Load data when employee changes and modal becomes visible
    if (changes['employee'] && this.employee) {
      console.log('👤 Employee changed to:', this.employee);
      this.loadEmployeeData();
    }

    // Handle visibility changes
    if (changes['isVisible']) {
      console.log('👁️ Modal visibility changed to:', this.isVisible);
      if (this.isVisible && this.employee) {
        this.loadEmployeeData();
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.isVisible) {
      this.trapFocus();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!this.isVisible) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.onClose();
    }

    // Focus trap
    if (event.key === 'Tab') {
      this.handleTabKey(event);
    }
  }

  private handleTabKey(event: KeyboardEvent): void {
    if (!this.firstFocusable?.nativeElement || !this.lastFocusable?.nativeElement) return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusable.nativeElement) {
        event.preventDefault();
        this.lastFocusable.nativeElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusable.nativeElement) {
        event.preventDefault();
        this.firstFocusable.nativeElement.focus();
      }
    }
  }

  private trapFocus(): void {
    setTimeout(() => {
      if (this.firstFocusable?.nativeElement) {
        this.firstFocusable.nativeElement.focus();
      }
    }, 100);
  }

  private loadEmployeeData(): void {
    if (!this.employee?.id) return;

    // Debug authentication first
    this.debugAuthentication();
    
    this.loadLeaveBalances();
    this.loadRecentRequests();
  }

  private debugAuthentication(): void {
    console.log('🔍 Debugging authentication...');
    console.log('🔍 Backend URL:', 'http://localhost:8080');
    console.log('🔍 Auth token:', localStorage.getItem('authToken') ? '✅ Found' : '❌ Missing');
    
    // First test basic backend connectivity
    this.employeeProfileService.testBackendHealth()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (health) => {
          console.log('✅ Backend health check passed:', health);
          
          // If backend is up, test authentication
          this.employeeProfileService.debugAuth()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (authInfo) => {
                console.log('✅ Authentication check passed:', authInfo);
              },
              error: (error) => {
                console.error('❌ Authentication check failed:', error);
                if (error.status === 403) {
                  console.error('❌ 403 Forbidden - User does not have ADMIN role');
                } else if (error.status === 401) {
                  console.error('❌ 401 Unauthorized - Invalid or expired token');
                }
              }
            });
        },
        error: (error) => {
          console.error('❌ Backend health check failed:', error);
          if (error.status === 0) {
            console.error('❌ Cannot connect to backend - is Spring Boot server running on port 8080?');
          }
        }
      });
  }

  private loadLeaveBalances(): void {
    if (!this.employee?.id) {
      console.log('❌ No employee ID for leave balances');
      return;
    }

    console.log('🔄 Loading leave balances for employee:', this.employee.id);
    this.isLoadingBalances = true;
    this.balancesError = '';

    // Set a failsafe timeout
    setTimeout(() => {
      if (this.isLoadingBalances) {
        console.warn('⚠️ Leave balances loading timeout - stopping loader');
        this.isLoadingBalances = false;
        this.balancesError = 'Request timed out - please check if backend is running';
      }
    }, 15000);

    this.employeeProfileService.getEmployeeLeaveBalances(this.employee.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoadingBalances = false;
          console.log('✅ Leave balances loading finished');
        })
      )
      .subscribe({
        next: (balances) => {
          console.log('✅ Leave balances loaded:', balances);
          this.leaveBalances = balances;
        },
        error: (error) => {
          console.error('❌ Error loading leave balances:', error);
          if (error.name === 'TimeoutError') {
            this.balancesError = 'Request timed out - backend may not be running';
          } else if (error.status === 0) {
            this.balancesError = 'Cannot connect to backend - is it running on port 8080?';
          } else {
            this.balancesError = `Failed to load leave balances (${error.status})`;
          }
        }
      });
  }

  private loadRecentRequests(): void {
    if (!this.employee?.id) {
      console.log('❌ No employee ID for recent requests');
      return;
    }

    console.log('🔄 Loading recent requests for employee:', this.employee.id);
    this.isLoadingRequests = true;
    this.requestsError = '';

    // Set a failsafe timeout
    setTimeout(() => {
      if (this.isLoadingRequests) {
        console.warn('⚠️ Recent requests loading timeout - stopping loader');
        this.isLoadingRequests = false;
        this.requestsError = 'Request timed out - please check if backend is running';
      }
    }, 15000);

    this.employeeProfileService.getEmployeeRecentRequests(this.employee.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoadingRequests = false;
          console.log('✅ Recent requests loading finished');
        })
      )
      .subscribe({
        next: (requests) => {
          console.log('✅ Recent requests loaded:', requests);
          this.recentRequests = requests;
        },
        error: (error) => {
          console.error('❌ Error loading recent requests:', error);
          if (error.name === 'TimeoutError') {
            this.requestsError = 'Request timed out - backend may not be running';
          } else if (error.status === 0) {
            this.requestsError = 'Cannot connect to backend - is it running on port 8080?';
          } else {
            this.requestsError = `Failed to load recent requests (${error.status})`;
          }
        }
      });
  }

  onBackdropClick(event: MouseEvent): void {
    // Only close if clicking the backdrop, not the modal content
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  // Create leave request form methods
  private initializeCreateForm(): void {
    this.createLeaveForm = this.fb.group({
      type: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      halfDay: [false],
      reason: ['', Validators.required]
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.createLeaveForm.reset();
      this.createLeaveForm.patchValue({ halfDay: false });
    }
  }

  submitLeaveRequest(): void {
    if (this.createLeaveForm.invalid || !this.employee?.id) {
      this.createLeaveForm.markAllAsTouched();
      return;
    }

    const formValue = this.createLeaveForm.value;
    const leaveRequest = {
      employeeId: this.employee.id,
      type: formValue.type,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      halfDay: formValue.halfDay,
      reason: formValue.reason,
      autoApprove: true // Mark for auto-approval by admin
    };

    console.log('🔄 Submitting leave request:', leaveRequest);
    this.isSubmittingRequest = true;

    this.employeeProfileService.createLeaveRequestForEmployee(leaveRequest)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmittingRequest = false)
      )
      .subscribe({
        next: (response) => {
          console.log('✅ Leave request created successfully:', response);
          this.showCreateForm = false;
          this.createLeaveForm.reset();
          
          // Refresh the recent requests list
          this.loadRecentRequests();
        },
        error: (error) => {
          console.error('❌ Error creating leave request:', error);
          // You could add error handling here (e.g., show error message)
        }
      });
  }

  getStatusIcon(status: string): any {
    switch (status?.toLowerCase()) {
      case 'approved':
        return this.faCheck;
      case 'rejected':
        return this.faExclamationTriangle;
      case 'pending':
      default:
        return this.faClock;
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'pending':
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  formatEmployeeName(employee: Employee | null): string {
    if (!employee) return 'Unknown Employee';
    return `${employee.firstName} ${employee.lastName}`;
  }
}
