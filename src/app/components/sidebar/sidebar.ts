import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faHome,
  faClipboard,
  faCalendarCheck,
  faCalendarAlt,
  faChartPie,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { faCalendar as faCalendarRegular } from '@fortawesome/free-regular-svg-icons';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  imports: [CommonModule, FontAwesomeModule, RouterModule],
})
export class SidebarComponent {
  @Input() isSidebarCollapsed = false;
  @Input() role: 'admin' | 'employee' = 'employee';
  @Output() sidebarToggle = new EventEmitter<void>();

  faCalendar = faCalendarRegular;

  menuItems: { label: string; path: string; icon: any }[] = [];

  ngOnInit() {
    if (this.role === 'admin') {
      this.menuItems = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: faHome },
        { label: 'Employees', path: '/admin/manage-employees', icon: faUsers },
        { label: 'Leave Requests', path: '/admin/manage-requests', icon: faClipboard },
        { label: 'Holidays', path: '/admin/holidays', icon: faCalendarAlt },
        { label: 'Statistics', path: '/admin/statistics', icon: faChartPie },
      ];
    } else {
      this.menuItems = [
        { label: 'Dashboard', path: '/dashboard', icon: faHome },
        { label: 'My Requests', path: '/myRequests', icon: faClipboard },
        { label: 'Apply Leave', path: '/ApplyLeave', icon: faCalendarCheck },
        { label: 'Calendar', path: '/CalendarLeave', icon: faCalendarAlt },
        { label: 'Leave Balance', path: '/LeaveBalance', icon: faChartPie },
      ];
    }
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }
}
