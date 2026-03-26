import { Component, inject, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApplicationService } from '../../../core/services/application.service';
import { NotificationResponse, NotificationType } from '../../../models/notification.models';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner-component';

@Component({
  selector: 'app-notification-bell',
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './notification-bell-component.html',
  styleUrl: './notification-bell-component.css',
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly applicationService = inject(ApplicationService);
  private readonly router = inject(Router);
  private timeUpdateInterval?: any;

  isOpen = signal(false);
  loading = signal(false);
  notifications = signal<NotificationResponse[]>([]);
  currentTime = signal(new Date());
  readonly NotificationType = NotificationType;

  get unreadCount() {
    return this.notificationService.unreadCount();
  }

  ngOnInit(): void {
    this.notificationService.startWebSocketNotifications();
    // Request browser notification permission
    this.notificationService.requestNotificationPermission();

    // Update time every minute for relative time display
    this.timeUpdateInterval = setInterval(() => {
      this.currentTime.set(new Date());
    }, 60000); // Update every minute
  }

  ngOnDestroy(): void {
    this.notificationService.stopWebSocketNotifications();
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
  }

  toggleDropdown(): void {
    if (!this.isOpen()) {
      this.loadNotifications();
    }
    this.isOpen.update((v) => !v);
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.notificationService.getNotifications(0, 5).subscribe({
      next: (page) => {
        this.notifications.set(page.content);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  onNotificationClick(notification: NotificationResponse): void {
    // Mark as read
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          this.notifications.update((notifications) =>
            notifications.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
          );
          this.notificationService.refreshUnreadCount();
        },
      });
    }

    // Navigate to related entity
    this.navigateToRelatedEntity(notification);

    // Close dropdown
    this.isOpen.set(false);
  }

  navigateToRelatedEntity(notification: NotificationResponse): void {
    if (!notification.relatedEntityType || !notification.relatedEntityId) {
      return;
    }

    if (notification.relatedEntityType === 'APPLICATION') {
      if (this.authService.isAdmin()) {
        // For admin, fetch application to get jobOfferId and navigate to specific job offer's applications
        this.applicationService.getApplicationById(notification.relatedEntityId).subscribe({
          next: (application) => {
            console.log(application);
            this.router.navigate(['/admin/applications/', application.jobOfferId]);
          },
          error: () => {
            // Fallback to general applications page if fetch fails
            this.router.navigate(['/admin/applications/']);
          },
        });
      } else {
        // For candidate, go to my applications
        this.router.navigate(['/candidate/applications']);
      }
    }

    if (notification.relatedEntityType === 'USER') {
      // Navigate to user profile view (admin only)
      this.router.navigate(['/admin/users', notification.relatedEntityId]);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update((notifications) =>
          notifications.map((n) => ({ ...n, isRead: true }))
        );
        this.notificationService.refreshUnreadCount();
      },
    });
  }

  getTimeAgo(dateString: string): string {
    const now = this.currentTime(); // Use the signal that updates every minute
    const notificationDate = new Date(dateString);
    
    // Debug logging
    console.log('Date string:', dateString);
    console.log('Parsed date:', notificationDate);
    console.log('Current time:', now);
    
    const secondsAgo = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);
    console.log('Seconds ago:', secondsAgo);

    if (secondsAgo < 0) return 'just now'; // Handle future dates
    if (secondsAgo < 60) return 'just now';
    if (secondsAgo < 120) return '1 minute ago';
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} minutes ago`;
    if (secondsAgo < 7200) return '1 hour ago';
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hours ago`;
    if (secondsAgo < 172800) return '1 day ago';
    if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)} days ago`;
    return notificationDate.toLocaleDateString();
  }

  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.NEW_APPLICATION:
        return 'user';
      case NotificationType.NEW_CANDIDATE_REGISTERED:
        return 'user-plus';
      case NotificationType.MEETING_SCHEDULED:
        return 'calendar';
      case NotificationType.APPLICATION_APPROVED:
        return 'check-circle';
      case NotificationType.APPLICATION_REJECTED:
        return 'x-circle';
      default:
        return 'bell';
    }
  }

  getNotificationIconClass(type: NotificationType): string {
    switch (type) {
      case NotificationType.APPLICATION_APPROVED:
        return 'icon-success';
      case NotificationType.APPLICATION_REJECTED:
        return 'icon-error';
      case NotificationType.MEETING_SCHEDULED:
        return 'icon-info';
      case NotificationType.NEW_CANDIDATE_REGISTERED:
        return 'icon-info';
      default:
        return 'icon-default';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-bell')) {
      this.isOpen.set(false);
    }
  }
}
