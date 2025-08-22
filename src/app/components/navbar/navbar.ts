import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification.models';
import { User } from '../../models/auth.models';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule , FontAwesomeModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();
  isSidebarOpen = false;
faChevronRight = faChevronRight;

  currentUser: User | null = null;
  showNotifications = false;
  showUserMenu = false;
  notifications: Notification[] = [];
  unreadCount = 0;
  isLoggingOut = false;
  
  private destroy$ = new Subject<void>();
  @ViewChild('notificationDropdown') notificationDropdown!: ElementRef;
  constructor(
    private authService: AuthService,
    public notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Subscribe to current user changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Subscribe to notifications
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });

    // Subscribe to unread count
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMenuClick(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.toggleSidebar.emit();
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false; // Close user menu when opening notifications
    
    // If opening notifications, refresh them
    if (this.showNotifications) {
      this.notificationService.refresh();
    }
  }
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      this.showNotifications &&
      this.notificationDropdown &&
      !this.notificationDropdown.nativeElement.contains(event.target)
    ) {
      this.showNotifications = false;
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false; // Close notifications when opening user menu
  }

  logout(): void {
    this.isLoggingOut = true;
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

  // Notification methods
  markAsRead(notification: Notification): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe({
        error: (error) => console.error('Error marking notification as read:', error)
      });
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      error: (error) => console.error('Error marking all notifications as read:', error)
    });
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.stopPropagation(); // Prevent notification click
    this.notificationService.deleteNotification(notification.id).subscribe({
      error: (error) => console.error('Error deleting notification:', error)
    });
  }

  clearAllNotifications(): void {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.notificationService.clearAllNotifications().subscribe({
        error: (error) => console.error('Error clearing notifications:', error)
      });
    }
  }

  getNotificationIcon(type: string): string {
    return this.notificationService.getNotificationIcon(type);
  }

  getNotificationClasses(type: string): { text: string; background: string } {
    return this.notificationService.getNotificationClasses(type);
  }

  formatNotificationTime(createdAt: string): string {
    return this.notificationService.formatTime(createdAt);
  }

  onNotificationClick(notification: Notification): void {
    // Mark as read when clicked
    this.markAsRead(notification);
    
    // You can add navigation logic here based on notification type
    // For example, navigate to the relevant page
  }
}