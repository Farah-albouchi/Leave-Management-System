import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timer } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { Notification } from '../models/notification.models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = 'http://localhost:8080/api/notifications';
  
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  
  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Poll for notifications every 30 seconds
    this.startPolling();
  }

  /**
   * Start polling for new notifications
   */
  private startPolling(): void {
    timer(0, 30000) // Poll immediately, then every 30 seconds
      .pipe(
        switchMap(() => this.fetchNotifications()),
        catchError(error => {
          console.error('Error polling notifications:', error);
          return [];
        })
      )
      .subscribe();
  }

  /**
   * Fetch all notifications from backend
   */
  fetchNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.API_URL).pipe(
      tap(notifications => {
        this.notificationsSubject.next(notifications);
        const unreadCount = notifications.filter(n => !n.read).length;
        this.unreadCountSubject.next(unreadCount);
      }),
      catchError(error => {
        console.error('Error fetching notifications:', error);
        return [];
      })
    );
  }

  /**
   * Get unread count from backend
   */
  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/unread-count`).pipe(
      tap(count => this.unreadCountSubject.next(count)),
      catchError(error => {
        console.error('Error fetching unread count:', error);
        return [0];
      })
    );
  }

  /**
   * Mark a specific notification as read
   */
  markAsRead(notificationId: string): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${notificationId}/read`, {}).pipe(
      tap(() => {
        // Update local state
        const notifications = this.notificationsSubject.value;
        const updatedNotifications = notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
        this.notificationsSubject.next(updatedNotifications);
        
        // Update unread count
        const unreadCount = updatedNotifications.filter(n => !n.read).length;
        this.unreadCountSubject.next(unreadCount);
      }),
      catchError(error => {
        console.error('Error marking notification as read:', error);
        throw error;
      })
    );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/mark-all-read`, {}).pipe(
      tap(() => {
        // Update local state
        const notifications = this.notificationsSubject.value;
        const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
        this.notificationsSubject.next(updatedNotifications);
        this.unreadCountSubject.next(0);
      }),
      catchError(error => {
        console.error('Error marking all notifications as read:', error);
        throw error;
      })
    );
  }

  /**
   * Delete a specific notification
   */
  deleteNotification(notificationId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${notificationId}`).pipe(
      tap(() => {
        // Update local state
        const notifications = this.notificationsSubject.value;
        const updatedNotifications = notifications.filter(n => n.id !== notificationId);
        this.notificationsSubject.next(updatedNotifications);
        
        // Update unread count
        const unreadCount = updatedNotifications.filter(n => !n.read).length;
        this.unreadCountSubject.next(unreadCount);
      }),
      catchError(error => {
        console.error('Error deleting notification:', error);
        throw error;
      })
    );
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/clear-all`).pipe(
      tap(() => {
        // Update local state
        this.notificationsSubject.next([]);
        this.unreadCountSubject.next(0);
      }),
      catchError(error => {
        console.error('Error clearing all notifications:', error);
        throw error;
      })
    );
  }

  /**
   * Format notification time for display
   */
  formatTime(createdAt: string): string {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMs = now.getTime() - notificationTime.getTime();
    
    const minutes = Math.floor(diffInMs / (1000 * 60));
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (days < 7) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return notificationTime.toLocaleDateString();
    }
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✔';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
      default:
        return '🔔';
    }
  }

  /**
   * Get notification color classes based on type
   */
  getNotificationClasses(type: string): { text: string; background: string } {
    switch (type) {
      case 'success':
        return { text: 'text-green-600', background: 'bg-green-50' };
      case 'warning':
        return { text: 'text-yellow-600', background: 'bg-yellow-50' };
      case 'error':
        return { text: 'text-red-600', background: 'bg-red-50' };
      case 'info':
      default:
        return { text: 'text-blue-600', background: 'bg-blue-50' };
    }
  }

  /**
   * Get current notifications snapshot
   */
  getCurrentNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Get current unread count snapshot
   */
  getCurrentUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  /**
   * Refresh notifications manually
   */
  refresh(): void {
    this.fetchNotifications().subscribe();
  }
}