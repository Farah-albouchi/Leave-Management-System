export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  recipient?: User;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  leaveRequestUpdates: boolean;
  reminderNotifications: boolean;
}