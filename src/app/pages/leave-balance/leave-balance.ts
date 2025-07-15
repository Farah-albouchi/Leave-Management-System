import { Component } from '@angular/core';
import { faPlus, faCalendar, faClock, faClipboard, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { Card } from '../dashboard/card/card';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-leave-balance',
  standalone: true,
  imports: [CommonModule,Card, FontAwesomeModule],
  templateUrl: './leave-balance.html',
  styleUrl:'./leave-balance.css'
})
export class LeaveBalance {
  faPlus = faPlus;
  faCalendar = faCalendar;
  faClock = faClock;
  faClipboard = faClipboard;
  faCheckCircle = faCheckCircle;

  leaveHistory = [
    { type: 'Annual Leave', from: '2025-06-10', to: '2025-06-12', status: 'Approved' },
    { type: 'Sick Leave', from: '2025-05-02', to: '2025-05-02', status: 'Approved' },
    { type: 'Casual Leave', from: '2025-04-15', to: '2025-04-15', status: 'Rejected' },
  ];
}
