import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  @Output() toggleSidebar = new EventEmitter<void>();

  onMenuClick() {
    this.toggleSidebar.emit();
  }
  showNotifications = false;

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  notifications = [
    {
      type: 'success',
      title: 'Leave Request Approved',
      message: 'Your leave from Jan 2 - Jan 6 was approved',
      time: '2 hours ago',
      read: false,
    },
    {
      type: 'info',
      title: 'Leave Balance Update',
      message: 'You have 3 days of leave remaining',
      time: '1 day ago',
      read: false,
    },
    {
      type: 'warning',
      title: 'Upcoming Leave',
      message: 'Your vacation starts tomorrow (Jan 2)',
      time: '2 days ago',
      read: true,
    },
  ];
}
