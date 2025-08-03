import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faUser, 
  faEye, 
  faEdit, 
  faTrash, 
  faKey, 
  faHistory, 
  faPlus, 
  faRefresh,
  faDownload,
  faTimes,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

import { EmployeeService } from '../../../services/employee.service';
import { 
  Employee, 
  CreateEmployeeRequest, 
  UpdateEmployeeRequest, 
  EmployeeRole, 
  EmployeeStats, 
  EmployeeFilter 
} from '../../../models/employee.models';
import { AdminLeaveRequestDto } from '../../../models/admin-request.models';

@Component({
  selector: 'app-manage-employees',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, ReactiveFormsModule],
  templateUrl: './manage-employees.html',
  styleUrls: ['./manage-employees.css']
})
export class ManageEmployees implements OnInit, OnDestroy {
  // Icons
  faUser = faUser;
  faEye = faEye;
  faEdit = faEdit;
  faTrash = faTrash;
  faKey = faKey;
  faHistory = faHistory;
  faPlus = faPlus;
  faRefresh = faRefresh;
  faDownload = faDownload;
  faTimes = faTimes;
  faCheck = faCheck;

  // Data properties
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  stats: EmployeeStats = {
    totalEmployees: 0,
    totalAdmins: 0,
    profileCompleted: 0,
    profilePending: 0,
    totalUsers: 0
  };
  
  // State properties
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Filter properties
  filters: EmployeeFilter = {
    search: '',
    role: null,
    status: null,
    profileCompleted: null
  };

  // Modal properties
  showAddModal = false;
  showEditModal = false;
  showDetailsModal = false;
  showDeleteModal = false;
  showResetPasswordModal = false;
  showLeaveHistoryModal = false;
  
  selectedEmployee: Employee | null = null;
  leaveHistory: AdminLeaveRequestDto[] = [];
  resetPasswordResult = '';

  // Forms
  addEmployeeForm!: FormGroup;
  editEmployeeForm!: FormGroup;

  // Enums for template
  EmployeeRole = EmployeeRole;

  private destroy$ = new Subject<void>();

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadData();
    
    // Subscribe to real-time updates
    this.employeeService.employees$
      .pipe(takeUntil(this.destroy$))
      .subscribe(employees => {
        this.employees = employees;
        this.applyFilters();
        this.isLoading = false;
      });

    this.employeeService.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.stats = stats;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.addEmployeeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      cin: ['', [Validators.pattern(/^\d+$/)]],
      role: [EmployeeRole.EMPLOYEE, Validators.required]
    });

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

  private loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Load employees and stats
    this.employeeService.getAllEmployees().subscribe({
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });

    this.employeeService.getEmployeeStats().subscribe({
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  // Filter methods
  applyFilters(): void {
    this.filteredEmployees = this.employeeService.filterEmployees(this.employees, this.filters);
  }

  onFiltersChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = {
      search: '',
      role: null,
      status: null,
      profileCompleted: null
    };
    this.applyFilters();
  }

  // Add employee modal methods
  openAddModal(): void {
    console.log('Opening add modal'); // Debug log
    
    // Clear any previous messages
    this.clearMessages();
    
    // Reset and configure the form
    this.addEmployeeForm.reset();
    this.addEmployeeForm.patchValue({ role: EmployeeRole.EMPLOYEE });
    
    // Ensure modal shows
    this.showAddModal = true;
    
    // Add body class to prevent scrolling
    document.body.classList.add('modal-open');
    
    console.log('showAddModal is now:', this.showAddModal); // Debug log
    
    // Force change detection
    setTimeout(() => {
      console.log('Modal should be visible now');
    }, 100);
  }

  closeAddModal(): void {
    console.log('Closing add modal'); // Debug log
    this.showAddModal = false;
    this.addEmployeeForm.reset();
    this.clearMessages();
    
    // Remove body class to restore scrolling
    document.body.classList.remove('modal-open');
  }

  addEmployee(): void {
    if (this.addEmployeeForm.valid) {
      const request: CreateEmployeeRequest = this.addEmployeeForm.value;
      
      this.employeeService.createEmployee(request).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.closeAddModal();
          this.refreshData();
        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
    }
  }

  // Edit employee modal methods
  openEditModal(employee: Employee): void {
    console.log('Opening edit modal for employee:', employee); // Debug log
    
    // Clear any previous messages
    this.clearMessages();
    
    this.selectedEmployee = employee;
    this.editEmployeeForm.patchValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || '',
      address: employee.address || '',
      cin: employee.cin || '',
      role: employee.role
    });
    
    this.showEditModal = true;
    
    // Add body class to prevent scrolling
    document.body.classList.add('modal-open');
    
    console.log('showEditModal is now:', this.showEditModal); // Debug log
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedEmployee = null;
    this.editEmployeeForm.reset();
    this.clearMessages();
    
    // Remove body class to restore scrolling
    document.body.classList.remove('modal-open');
  }

  updateEmployee(): void {
    if (this.editEmployeeForm.valid && this.selectedEmployee) {
      const request: UpdateEmployeeRequest = this.editEmployeeForm.value;
      
      this.employeeService.updateEmployee(this.selectedEmployee.id, request).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.closeEditModal();
          this.refreshData();
        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
    }
  }

  // Details modal methods
  openDetailsModal(employee: Employee): void {
    this.selectedEmployee = employee;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedEmployee = null;
  }

  // Navigate to employee profile
  viewEmployeeProfile(employee: Employee): void {
    this.router.navigate(['/admin/manage-employees/profile', employee.id]);
  }

  // Delete confirmation methods
  openDeleteModal(employee: Employee): void {
    console.log('Opening delete modal for employee:', employee); // Debug log
    this.clearMessages();
    this.selectedEmployee = employee;
    this.showDeleteModal = true;
    document.body.classList.add('modal-open');
  }

  closeDeleteModal(): void {
    console.log('Closing delete modal'); // Debug log
    this.showDeleteModal = false;
    this.selectedEmployee = null;
    document.body.classList.remove('modal-open');
  }

  confirmDelete(): void {
    if (this.selectedEmployee) {
      this.employeeService.deleteEmployee(this.selectedEmployee.id).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.closeDeleteModal();
          this.refreshData();
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.closeDeleteModal();
        }
      });
    }
  }

  // Reset password methods
  openResetPasswordModal(employee: Employee): void {
    console.log('Opening reset password modal for employee:', employee); // Debug log
    this.clearMessages();
    this.selectedEmployee = employee;
    this.resetPasswordResult = '';
    this.showResetPasswordModal = true;
    document.body.classList.add('modal-open');
  }

  closeResetPasswordModal(): void {
    console.log('Closing reset password modal'); // Debug log
    this.showResetPasswordModal = false;
    this.selectedEmployee = null;
    this.resetPasswordResult = '';
    document.body.classList.remove('modal-open');
  }

  confirmResetPassword(): void {
    if (this.selectedEmployee) {
      this.employeeService.resetPassword(this.selectedEmployee.id).subscribe({
        next: (response) => {
          this.resetPasswordResult = response.newPassword;
        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
    }
  }

  // Leave history methods
  openLeaveHistoryModal(employee: Employee): void {
    console.log('Opening leave history modal for employee:', employee); // Debug log
    this.clearMessages();
    this.selectedEmployee = employee;
    this.leaveHistory = [];
    this.showLeaveHistoryModal = true;
    document.body.classList.add('modal-open');
    
    this.employeeService.getEmployeeLeaveHistory(employee.id).subscribe({
      next: (history) => {
        this.leaveHistory = history;
      },
      error: (error: any) => {
        this.errorMessage = error.message;
      }
    });
  }

  closeLeaveHistoryModal(): void {
    console.log('Closing leave history modal'); // Debug log
    this.showLeaveHistoryModal = false;
    this.selectedEmployee = null;
    this.leaveHistory = [];
    document.body.classList.remove('modal-open');
  }

  // Utility methods
  refreshData(): void {
    this.loadData();
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  exportEmployees(): void {
    const csvContent = this.generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private generateCSV(): string {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Created Date'];
    const rows = this.filteredEmployees.map(emp => [
      this.employeeService.formatEmployeeName(emp),
      emp.email,
      emp.phone || 'N/A',
      this.employeeService.formatRole(emp.role),
      emp.profileCompleted ? 'Active' : 'Pending',
      this.employeeService.formatDate(emp.createdAt)
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  // Template helper methods
  getEmployeeInitials(employee: Employee): string {
    return this.employeeService.getEmployeeInitials(employee);
  }

  formatEmployeeName(employee: Employee): string {
    return this.employeeService.formatEmployeeName(employee);
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

  calculateDaysText(request: AdminLeaveRequestDto): string {
    if (request.halfDay) {
      return '0.5 day';
    }
    return `${request.totalDays} ${request.totalDays === 1 ? 'day' : 'days'}`;
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
}