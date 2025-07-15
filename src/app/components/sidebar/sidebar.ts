import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar as faCalendarRegular  } from '@fortawesome/free-regular-svg-icons';
import {
  faHome,
  faChartPie,
  faTasks,
  faCog,
  faUser,
  faLock,
  faEnvelope,
  faChevronDown,

} from '@fortawesome/free-solid-svg-icons';
import { RouterModule } from '@angular/router';


interface MenuItem {
  icon: any;
  label: string;
  children?: MenuItem[];
  isOpen?: boolean;
}

@Component({
  standalone: true, 
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
  imports: [CommonModule, FontAwesomeModule,RouterModule]
})
export class SidebarComponent {
  @Input() isSidebarCollapsed = false;
  @Output() sidebarToggle = new EventEmitter<void>();

  faCalendar = faCalendarRegular;
  menuItems: MenuItem[] = [
    {
      icon: faHome,
      label: 'Dashboard',
      isOpen: false,
      children: [
        { icon: faChartPie, label: 'Analytics' },
        { icon: faTasks, label: 'Projects' },
      ]
    },
    {
      icon: faCog,
      label: 'Settings',
      isOpen: false,
      children: [
        { icon: faUser, label: 'Profile' },
        { icon: faLock, label: 'Security' },
      ]
    },
    {
      icon: faEnvelope,
      label: 'Messages'
    },
   
  ];

  dropdownIcon = faChevronDown; 

  toggleSidebar() {
    this.sidebarToggle.emit();
  }

  toggleMenuItem(item: MenuItem) {
    if (!this.isSidebarCollapsed && item.children) {
      item.isOpen = !item.isOpen;
    }
  }
}
