import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.models';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser: User | null = null;
  showNotifications = false;
  showUserMenu = false;
  
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to current user changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMenuClick(): void {
    this.toggleSidebar.emit();
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false; // Close user menu when opening notifications
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false; // Close notifications when opening user menu
  }

  logout(): void {
    this.authService.logout();
  }

  getUserDisplayName(): string {
    if (this.currentUser?.firstName && this.currentUser?.lastName) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return this.currentUser?.email || 'User';
  }

  getUserInitials(): string {
    if (this.currentUser?.firstName && this.currentUser?.lastName) {
      return `${this.currentUser.firstName.charAt(0)}${this.currentUser.lastName.charAt(0)}`.toUpperCase();
    }
    return this.currentUser?.email?.charAt(0).toUpperCase() || 'U';
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
