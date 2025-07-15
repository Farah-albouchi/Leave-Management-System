import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface LeaveRequest {
  type: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  dateRange: string;
  days: string;
  statusColor: string;
  statusBg: string;
}

@Component({
  selector: 'app-recent-leave',
  imports: [CommonModule],
  templateUrl: './recent-leave.html',
  styleUrl: './recent-leave.css'
})
export class RecentLeave {
  leaveRequests: LeaveRequest[] = [
    {
      type: 'Annual Leave',
      status: 'Approved',
      dateRange: 'Dec 20–25, 2024',
      days: '5 days',
      statusColor: 'text-green-600',
      statusBg: 'bg-green-100',
    },
    {
      type: 'Sick Leave',
      status: 'Pending',
      dateRange: 'Dec 10, 2024',
      days: '1 day',
      statusColor: 'text-yellow-600',
      statusBg: 'bg-yellow-100',
    },
    {
      type: 'Personal Leave',
      status: 'Rejected',
      dateRange: 'Nov 28, 2024',
      days: '1 day',
      statusColor: 'text-red-600',
      statusBg: 'bg-red-100',
    },
  ];
}
