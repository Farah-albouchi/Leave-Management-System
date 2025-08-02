import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';

interface LeaveBalance {
  type: string;
  daysLeft: number;
}

interface LeaveRequest {
  id: string;
  type: string;
  reason: string;
  startDate: string;
  endDate: string;
  status?: string;
  attachmentUrl? : string
}

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.html',
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  styleUrls: ['./employee-profile.css'],
  standalone: true,
})
export class EmployeeProfile implements OnInit {
  employeeId: string = '';
  employee: any;

  ngOnInit() {
    this.employeeId = this.route.snapshot.params['id'];
    this.employee = {
      id: this.employeeId,
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      department: 'Engineering',
      role: 'Employee',
      status: 'Active',
      joined: '2023-04-15',
      phone: '+216 20 111 222',
      cin: 12345678,
      address: 'Rue de Sousse, Tunisia',
      createdAt: '2025-07-01',
      profileCompleted: true,
      leaveBalance: [
        { type: 'Annual', daysLeft: 8 },
        { type: 'Sick', daysLeft: 0 }
      ],
      leaves: [
        { type: 'Annual', startDate: '2024-01-10', endDate: '2024-01-15', status: 'Approved' },
        { type: 'Sick', startDate: '2024-03-05', endDate: '2024-03-06', status: 'Approved' },
      ],
      pendingRequest: {
        id: 'req-101',
        type: 'aaaa',
        reason: 'Family emergency',
        startDate: '2024-08-01',
        endDate: '2024-08-05',
        attachmentUrl : '/test.pdf'
      }
    };

    this.editUser = {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@example.com',
      phone: '+216 20 111 222',
      cin: 12345678,
      address: 'Rue de Sousse, Tunisia',
      createdAt: new Date(),
      role: 'EMPLOYEE',
      profileCompleted: true,
      id: 'abc-123',
      leaveBalance: [
        { type: 'Annual', daysLeft: 5 },
        { type: 'Sick', daysLeft: 2 },
      ]
    };
    

    this.pendingRequest = this.employee.pendingRequest;
  }

  editUser: any = {};
  showEditModal = false;
  showDeleteModal = false;
  showApproveModal = false;
  selectedLeaveType: string = '';
  paidOption: 'PAID' | 'UNPAID' = 'PAID';
  pendingRequest: LeaveRequest | null = null;

  openEditModal() {
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  updateEmployee() {
    console.log('Updated User:', this.editUser);
    this.closeEditModal();
    alert('✅ Profile updated!');
  }

  openDeleteModal() {
    this.showDeleteModal = true;
  }

  confirmDelete() {
    this.showDeleteModal = false;
    alert('🗑️ Employee deleted!');
    // TODO: API call and navigation
  }

  openApprovePopup(request: LeaveRequest) {
    this.pendingRequest = request;
    this.selectedLeaveType = '';
    this.paidOption = 'PAID';
    this.showApproveModal = true;
  }

  closeApproveModal() {
    this.showApproveModal = false;
  }

  confirmApprove() {
    if (!this.selectedLeaveType) {
      alert('Please select a leave type');
      return;
    }

    console.log('Approved with type', this.selectedLeaveType, 'option:', this.paidOption);
    this.showApproveModal = false;
    this.pendingRequest = null;
    // TODO: Send to backend
  }

  getDaysLeft(type: string): number {
    const found = this.employee.leaveBalance?.find((lb: LeaveBalance) => lb.type === type);
    return found ? found.daysLeft : 0;
  }
  showRejectModal = false;
  rejectionRemark = '';
  
  openRejectModal() {
    this.rejectionRemark = '';
    this.showRejectModal = true;
  }
  
  closeRejectModal() {
    this.showRejectModal = false;
  }
  
  confirmReject() {
    console.log('Rejected with remark:', this.rejectionRemark);
    this.showRejectModal = false;
    // Add backend API call here
  }
  
  constructor(private route: ActivatedRoute) {}
}
