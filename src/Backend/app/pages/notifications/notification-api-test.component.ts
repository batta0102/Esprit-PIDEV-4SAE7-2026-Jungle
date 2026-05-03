import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { RealtimeNotificationService } from '../../../../core/api/services/realtime-notification.service';
import { environment } from '../../../../core/api/environment';
import type { RealtimeNotification } from '../../../../core/api/models';

/**
 * Temporary page to exercise RealtimeNotificationService HTTP calls.
 * Route: /back/notifications-api-test
 */
@Component({
  selector: 'app-notification-api-test',
  standalone: true,
  imports: [CommonModule, JsonPipe],
  templateUrl: './notification-api-test.component.html'
})
export class NotificationApiTestComponent implements OnInit {
  private readonly notificationsApi = inject(RealtimeNotificationService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly items = signal<RealtimeNotification[]>([]);
  readonly lastAction = signal<string | null>(null);

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);
    this.notificationsApi.getMyNotifications().subscribe({
      next: (list) => {
        this.items.set(list);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.items.set([]);
        this.loading.set(false);
        this.error.set(err instanceof Error ? err.message : String(err));
      }
    });
  }

  markOne(id: number): void {
    this.lastAction.set(null);
    this.error.set(null);
    this.notificationsApi.markAsRead(id).subscribe({
      next: () => {
        this.lastAction.set(`markAsRead(${id}) — OK`);
        this.refresh();
      },
      error: (err: unknown) => {
        this.lastAction.set(`markAsRead(${id}) — error`);
        this.error.set(err instanceof Error ? err.message : String(err));
      }
    });
  }

  markAll(): void {
    this.lastAction.set(null);
    this.error.set(null);
    this.notificationsApi.markAllAsRead().subscribe({
      next: () => {
        this.lastAction.set('markAllAsRead() — OK');
        this.refresh();
      },
      error: (err: unknown) => {
        this.lastAction.set('markAllAsRead() — error');
        this.error.set(err instanceof Error ? err.message : String(err));
      }
    });
  }

  /** POST /api/notifications — same user as notifications.debug-user-id (often 1) so GET /my returns it. */
  sendTestNotification(): void {
    this.lastAction.set(null);
    this.error.set(null);
    const userId = Number(environment.notificationsStompUserId);
    this.notificationsApi
      .createNotification({
        userId: Number.isFinite(userId) && userId > 0 ? userId : 1,
        type: 'SESSION_CANCELLED',
        title: 'Manual test',
        message: 'Demo notification (POST /api/notifications).'
      })
      .subscribe({
        next: () => {
          this.lastAction.set('createNotification() — OK');
          this.refresh();
        },
        error: (err: unknown) => {
          this.lastAction.set('createNotification() — error');
          this.error.set(err instanceof Error ? err.message : String(err));
        }
      });
  }
}
