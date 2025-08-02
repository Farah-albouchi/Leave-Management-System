import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faTimesCircle, faEye } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-requests',
  templateUrl: './manage-requests.html',
  styleUrls: ['./manage-requests.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
})
export class ManageRequests {
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;
  faEye = faEye;

  searchTerm = '';
  filterStatus = '';

  requests = [
    { employee: 'Alice', startDate: '2025-07-10', endDate: '2025-07-12', reason: 'Family Event', status: 'Pending', halfDay: false, type: 'Vacation', createdAt: '2025-07-01', documentPath: '/assets/test.pdf' },
    { employee: 'Bob', startDate: '2025-06-01', endDate: '2025-06-05', reason: 'Medical', status: 'Approved', halfDay: true, type: 'Sick Leave', createdAt: '2025-05-30', documentPath: '' },
    { employee: 'Charlie', startDate: '2025-05-15', endDate: '2025-05-16', reason: 'Trip', status: 'Rejected', halfDay: false, type: 'Casual', createdAt: '2025-05-10', documentPath: '' },
  ];

  editUser = {
    leaveBalance: [
      { type: 'Sick Leave', daysLeft: 4 },
      { type: 'Vacation', daysLeft: 10 },
      { type: 'Casual', daysLeft: 2 },
    ]
  };

  filteredRequests() {
    return this.requests.filter(r =>
      (r.employee.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        r.reason.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
      (!this.filterStatus || r.status === this.filterStatus)
    );
  }

  countRequests(status: string) {
    return this.requests.filter(r => r.status === status).length;
  }

  approve(req: any) {
    req.status = 'Approved';
  }

  reject(req: any) {
    req.status = 'Rejected';
  }

  showRequestModal = false;
  selectedRequest: any = null;

  openRequestModal(request: any) {
    this.selectedRequest = request;
    this.showRequestModal = true;
  }

  closeRequestModal() {
    this.showRequestModal = false;
    this.selectedRequest = null;
  }


  showApproveModal = false;
selectedLeaveType = '';
paidOption = 'PAID';
showRejectModal = false;

openApprovePopup(request: any) {
  this.selectedRequest = request;
  this.selectedLeaveType = request.type;
  this.showApproveModal = true;

  // 👇 Keep the main request modal open
  // Do NOT set showRequestModal = false
}

closeApproveModal() {
  this.showApproveModal = false;
}

openRejectPopup(request: any) {
  this.selectedRequest = request;
  this.showRejectModal = true;

  // Do NOT close showRequestModal
}

closeRejectPopup() {
  this.showRejectModal = false;
}


// Optional helper to get remaining days for selected leave type
getDaysLeft(type: string): number {
  const found = this.editUser.leaveBalance.find(b => b.type === type);
  return found ? found.daysLeft : 0;
}

// You can handle confirmation here
confirmApprove() {
  if (this.selectedRequest) {
    this.selectedRequest.status = 'Approved';
    // You could log paidOption here or send to backend
    this.closeApproveModal();
  }
}
rejectRemark = '';

confirmReject() {
  if (this.selectedRequest) {
    this.selectedRequest.status = 'Rejected';
    console.log('Rejected with remark:', this.rejectRemark);
    this.rejectRemark = '';
    this.closeRejectPopup();
    this.closeRequestModal(); // optional: auto-close request popup
  }
}

}
