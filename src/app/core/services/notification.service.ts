import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationResponse, UnreadCountResponse } from '../../models/notification.models';
import { PageResponse } from '../../models/pagination.models';
import { WebSocketService } from './websocket.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/api/notifications`;
  private readonly wsService = inject(WebSocketService);
  private readonly authService = inject(AuthService);
  private unsubscribeNotifications?: () => void;

  unreadCount = signal(0);

  constructor(private readonly http: HttpClient) {}

  getNotifications(page: number = 0, size: number = 10): Observable<PageResponse<NotificationResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<NotificationResponse>>(this.apiUrl, { params });
  }

  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(`${this.apiUrl}/unread-count`);
  }

  markAsRead(id: number): Observable<NotificationResponse> {
    return this.http.put<NotificationResponse>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/mark-all-read`, {});
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  startWebSocketNotifications(): void {
    const token = this.authService.getToken();
    const user = this.authService.user();

    if (!token || !user) {
      console.error('Cannot start WebSocket: No authentication token');
      return;
    }

    // Connect to WebSocket
    this.wsService.connect(token);

    // Subscribe to user's notification channel
    this.unsubscribeNotifications = this.wsService.subscribe<NotificationResponse>(
      `/topic/notifications/${user.id}`,
      (notification) => {
        
        // Increment unread count
        this.unreadCount.update((count) => count + 1);

        // Optional: Show browser notification
        this.showBrowserNotification(notification);
      }
    );

    // Initial unread count fetch
    this.refreshUnreadCount();
  }

  stopWebSocketNotifications(): void {
    if (this.unsubscribeNotifications) {
      this.unsubscribeNotifications();
      this.unsubscribeNotifications = undefined;
    }
    this.wsService.disconnect();
  }

  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (response) => this.unreadCount.set(response.count),
      error: () => {}, // Silent failure
    });
  }

  private showBrowserNotification(notification: NotificationResponse): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    }
  }

  requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}
