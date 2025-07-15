import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { RequestDetails } from './request-details/request-details';

@Component({
  selector: 'app-my-requests',
  standalone:true,
  imports: [CommonModule,FontAwesomeModule,RequestDetails],
  templateUrl: './my-requests.html',
  styleUrl: './my-requests.css'
})
export class MyRequests {
  faPlus = faPlus;
  leaveRequests = [
    {
      type: 'Annual Leave',
      startDate: '15/01/2024',
      endDate: '19/01/2024',
      days: 5,
      status: 'Approved',
      submitted: '01/01/2024',
    },
    {
      type: 'Sick Leave',
      startDate: '22/01/2024',
      endDate: '22/01/2024',
      days: 1,
      status: 'Pending',
      submitted: '20/01/2024',
    },
    {
      type: 'Annual Leave',
      startDate: '10/02/2024',
      endDate: '14/02/2024',
      days: 5,
      status: 'Rejected',
      submitted: '25/01/2024',
    },
  ];
  selectedRequest: any = null;
showModal = false;

openModal(request: any) {
  this.selectedRequest = request;
  this.showModal = true;
}

closeModal() {
  this.showModal = false;
}
handleCancelRequest() {
  if (this.selectedRequest) {
    this.selectedRequest.status = 'Cancelled'; 
    this.closeModal();
  }
}


}
