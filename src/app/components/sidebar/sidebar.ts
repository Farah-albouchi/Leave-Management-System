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
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { faCalendar as faCalendarRegular } from '@fortawesome/free-regular-svg-icons';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../models/auth.models';

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
  currentUser: User | null = null;
  menuItems: { label: string; path: string; icon: any }[] = [];
  isLoggingOut = false;
  constructor(
    private authService: AuthService,
    public notificationService: NotificationService
  ) {}
    private destroy$ = new Subject<void>();
  ngOnInit() {
        this.authService.currentUser$
          .pipe(takeUntil(this.destroy$))
          .subscribe(user => {
            this.currentUser = user;
          });
    
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
        { label: 'My Profile', path: '/profile', icon: faUser },
      ];
    }
  }

  toggleSidebar() {
    this.sidebarToggle.emit();
  }
  logout(): void {
    this.isLoggingOut = true;
    this.authService.logout();
  }
}
