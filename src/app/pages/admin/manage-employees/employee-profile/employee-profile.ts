import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  faUser,
  faEdit,
  faTrash,
  faKey,
  faHistory,
  faArrowLeft,
  faCheck,
  faTimes,
  faDownload,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';

import { EmployeeService } from '../../../../services/employee.service';
import { LeaveRequestService } from '../../../../services/leave-request.service';
import { LeaveBalanceService } from '../../../../services/leave-balance.service';
import { HttpClient } from '@angular/common/http';
import { 
  Employee, 
  UpdateEmployeeRequest, 
  EmployeeRole 
} from '../../../../models/employee.models';
import { LeaveRequestResponseDto, LeaveStatus } from '../../../../models/leave-request.models';
import { AdminLeaveRequestDto } from '../../../../models/admin-request.models';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.html',
  imports: [CommonModule, FontAwesomeModule, FormsModule, ReactiveFormsModule],
  styleUrls: ['./employee-profile.css'],
  standalone: true,
})
export class EmployeeProfile implements OnInit, OnDestroy {
  // Icons
  faUser = faUser;
  faEdit = faEdit;
  faTrash = faTrash;
  faKey = faKey;
  faHistory = faHistory;
  faArrowLeft = faArrowLeft;
  faCheck = faCheck;
  faTimes = faTimes;
  faDownload = faDownload;
  faFileAlt = faFileAlt;

  // Data properties
  employeeId: string = '';
  employee: Employee | null = null;
  leaveHistory: AdminLeaveRequestDto[] = [];
  leaveBalance: any[] = [];
  pendingRequests: LeaveRequestResponseDto[] = [];
  
  // State properties
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Modal properties
  showEditModal = false;
  showDeleteModal = false;
  showApproveModal = false;
  showRejectModal = false;
  showResetPasswordModal = false;

  // Form and request properties
  editEmployeeForm!: FormGroup;
  selectedRequest: LeaveRequestResponseDto | null = null;
  rejectionRemark = '';
  resetPasswordResult = '';

  // Enums for template
  EmployeeRole = EmployeeRole;
  LeaveStatus = LeaveStatus;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private leaveRequestService: LeaveRequestService,
    private leaveBalanceService: LeaveBalanceService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.params['id'];
    this.loadEmployeeData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.editEmployeeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      cin: ['', [Validators.pattern(/^\d+$/)]],
      role: ['', Validators.required]
    });
  }

  private loadEmployeeData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load employee details
    this.employeeService.getEmployeeById(this.employeeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (employee: Employee) => {
          this.employee = employee;
          this.populateEditForm();
          this.loadLeaveData();
        },
        error: (error: any) => {
          this.errorMessage = error.message;
          this.isLoading = false;
        }
      });
  }

  private loadLeaveData(): void {
    // Load leave history
    this.employeeService.getEmployeeLeaveHistory(this.employeeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (history: AdminLeaveRequestDto[]) => {
          this.leaveHistory = history;
          this.pendingRequests = history.filter(req => req.status === LeaveStatus.PENDING);
        },
        error: (error: any) => {
          console.error('Error loading leave history:', error);
        }
      });

    // Load employee's leave balance using admin endpoint
    this.http.get<any>(`http://localhost:8080/api/admin/employees/${this.employeeId}/leave-balance`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (balance: any) => {
          // Transform the balance summary to match expected format
          this.leaveBalance = balance.balancesByType || [];
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading employee leave balance:', error);
          // Set empty array on error
          this.leaveBalance = [];
          this.isLoading = false;
        }
      });
  }

  private populateEditForm(): void {
    if (this.employee) {
      this.editEmployeeForm.patchValue({
        firstName: this.employee.firstName,
        lastName: this.employee.lastName,
        email: this.employee.email,
        phone: this.employee.phone || '',
        address: this.employee.address || '',
        cin: this.employee.cin || '',
        role: this.employee.role
      });
    }
  }

  // Navigation methods
  goBack(): void {
    this.router.navigate(['/admin/manage-employees']);
  }

  // Edit modal methods
  openEditModal(): void {
    this.populateEditForm();
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.clearMessages();
  }

  updateEmployee(): void {
    if (this.editEmployeeForm.valid && this.employee) {
      const request: UpdateEmployeeRequest = this.editEmployeeForm.value;
      
      this.employeeService.updateEmployee(this.employee.id, request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.successMessage = response.message;
    this.closeEditModal();
            this.loadEmployeeData(); // Refresh data
          },
          error: (error: any) => {
            this.errorMessage = error.message;
          }
        });
    }
  }

  // Delete modal methods
  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (this.employee) {
      this.employeeService.deleteEmployee(this.employee.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.successMessage = response.message;
            this.closeDeleteModal();
            // Navigate back to employee list after deletion
            setTimeout(() => {
              this.router.navigate(['/admin/manage-employees']);
            }, 1500);
          },
          error: (error: any) => {
            this.errorMessage = error.message;
            this.closeDeleteModal();
          }
        });
    }
  }

  // Reset password methods
  openResetPasswordModal(): void {
    this.resetPasswordResult = '';
    this.showResetPasswordModal = true;
  }

  closeResetPasswordModal(): void {
    this.showResetPasswordModal = false;
    this.resetPasswordResult = '';
  }

  confirmResetPassword(): void {
    if (this.employee) {
      this.employeeService.resetPassword(this.employee.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.resetPasswordResult = response.newPassword;
          },
          error: (error: any) => {
            this.errorMessage = error.message;
          }
        });
    }
  }

  // Leave request approve/reject methods
  openApproveModal(request: LeaveRequestResponseDto): void {
    this.selectedRequest = request;
    this.showApproveModal = true;
  }

  closeApproveModal(): void {
    this.showApproveModal = false;
    this.selectedRequest = null;
  }

  confirmApprove(): void {
    if (this.selectedRequest) {
      this.leaveRequestService.updateRequestStatus(this.selectedRequest.id, LeaveStatus.ACCEPTED)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.successMessage = 'Leave request approved successfully';
            this.closeApproveModal();
            this.loadLeaveData(); // Refresh leave data
          },
          error: (error: any) => {
            this.errorMessage = error.message;
          }
        });
    }
  }

  openRejectModal(request: LeaveRequestResponseDto): void {
    this.selectedRequest = request;
    this.rejectionRemark = '';
    this.showRejectModal = true;
  }
  
  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedRequest = null;
    this.rejectionRemark = '';
  }

  confirmReject(): void {
    if (this.selectedRequest && this.rejectionRemark.trim()) {
      this.leaveRequestService.updateRequestStatus(
        this.selectedRequest.id, 
        LeaveStatus.REJECTED, 
        this.rejectionRemark
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.successMessage = 'Leave request rejected successfully';
            this.closeRejectModal();
            this.loadLeaveData(); // Refresh leave data
          },
          error: (error: any) => {
            this.errorMessage = error.message;
          }
        });
    }
  }

  // Utility methods
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Template helper methods
  formatEmployeeName(): string {
    if (!this.employee) return '';
    return this.employeeService.formatEmployeeName(this.employee);
  }

  getEmployeeInitials(): string {
    if (!this.employee) return '';
    return this.employeeService.getEmployeeInitials(this.employee);
  }

  formatRole(role: string): string {
    return this.employeeService.formatRole(role);
  }

  getRoleClasses(role: string): { text: string; background: string } {
    return this.employeeService.getRoleClasses(role);
  }

  getStatusClasses(profileCompleted: boolean): { text: string; background: string } {
    return this.employeeService.getStatusClasses(profileCompleted);
  }

  formatDate(dateString: string): string {
    return this.employeeService.formatDate(dateString);
  }

  getLeaveStatusClasses(status: string): { text: string; background: string } {
    switch (status.toUpperCase()) {
      case 'ACCEPTED':
        return { text: 'text-green-800', background: 'bg-green-100' };
      case 'REJECTED':
        return { text: 'text-red-800', background: 'bg-red-100' };
      case 'PENDING':
      default:
        return { text: 'text-yellow-800', background: 'bg-yellow-100' };
    }
  }

  calculateDaysText(request: AdminLeaveRequestDto | LeaveRequestResponseDto): string {
    const halfDay = request.halfDay;
    
    // Handle different request types
    let totalDays: number;
    if ('totalDays' in request) {
      // AdminLeaveRequestDto has totalDays property
      totalDays = request.totalDays;
    } else {
      // LeaveRequestResponseDto - calculate days from start/end dates
      totalDays = this.calculateWorkingDays(request.startDate, request.endDate, halfDay);
    }
    
    if (halfDay) {
      return '0.5 day';
    }
    return `${totalDays} ${totalDays === 1 ? 'day' : 'days'}`;
  }

  private calculateWorkingDays(startDate: string, endDate: string, halfDay: boolean): number {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    let days = 0;
    
    const current = new Date(start);
    while (!current.toDateString().localeCompare(end.toDateString()) || current < end) {
      // Skip weekends (Saturday = 6, Sunday = 0)
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        days++;
      }
      current.setDate(current.getDate() + 1);
      
      // Safety break to prevent infinite loop
      if (current > end) break;
    }
    
    return halfDay && days > 0 ? Math.max(0.5, days - 0.5) : days;
  }

  downloadDocument(request: AdminLeaveRequestDto | LeaveRequestResponseDto): void {
    if (request.documentPath) {
      const link = document.createElement('a');
      link.href = `http://localhost:8080/api/leave/download/${request.documentPath}`;
      link.download = request.documentPath;
      link.click();
    }
  }
}