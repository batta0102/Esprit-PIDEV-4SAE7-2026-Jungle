import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';

import { NotificationBellComponent } from './notification-bell.component';
import { RealtimeNotificationService } from '../../../../core/api/services/realtime-notification.service';
import { NotificationStompService } from '../../../../core/api/services/notification-stomp.service';
import { AuthFacade } from '../../core/auth/auth.facade';
import type { RealtimeNotification } from '../../../../core/api/models';

describe('NotificationBellComponent', () => {
  let fixture: ComponentFixture<NotificationBellComponent>;
  let component: NotificationBellComponent;
  let getMyNotificationsCalls = 0;
  let notificationsApiSpy: {
    getMyNotifications: () => unknown;
    markAsRead: (_id: number) => unknown;
    markAllAsRead: () => unknown;
    createNotification: (_body: unknown) => unknown;
    onListRefresh: () => unknown;
  };

  const sampleNotifications: RealtimeNotification[] = [
    {
      id: 1,
      userId: 1,
      type: 'COURSE_CREATED',
      title: 'Course added',
      message: 'A new course was added',
      payloadJson: null,
      read: false,
      createdAt: '2026-01-01T10:00:00.000Z',
      readAt: null
    },
    {
      id: 2,
      userId: 1,
      type: 'COURSE_UPDATED',
      title: 'Course updated',
      message: 'A course was updated',
      payloadJson: null,
      read: true,
      createdAt: '2026-01-01T11:00:00.000Z',
      readAt: '2026-01-01T11:05:00.000Z'
    }
  ];

  beforeEach(async () => {
    const refresh$ = new Subject<void>();
    const incoming$ = new Subject<RealtimeNotification>();
    const stompErrors$ = new Subject<string>();

    notificationsApiSpy = {
      getMyNotifications: () => {
        getMyNotificationsCalls += 1;
        return of(sampleNotifications);
      },
      markAsRead: () => of(void 0),
      markAllAsRead: () => of(void 0),
      createNotification: () => of(sampleNotifications[0]),
      onListRefresh: () => refresh$.asObservable()
    };

    const stompSpy = {
      connect: () => {},
      disconnect: () => {},
      incoming$: incoming$.asObservable(),
      stompErrors$: stompErrors$.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [NotificationBellComponent],
      providers: [
        { provide: RealtimeNotificationService, useValue: notificationsApiSpy as unknown as RealtimeNotificationService },
        { provide: NotificationStompService, useValue: stompSpy },
        {
          provide: AuthFacade,
          useValue: {
            studentId: () => '1',
            tutorId: () => null
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: () => Promise.resolve(true)
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationBellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call getMyNotifications on init', () => {
    expect(getMyNotificationsCalls).toBeGreaterThan(0);
  });

  it('should compute unread badge count', () => {
    component.items.set(sampleNotifications);
    fixture.detectChanges();

    expect(component.unreadCount()).toBe(1);

    const badge = fixture.nativeElement.querySelector('.nb-badge') as HTMLElement;
    expect(badge.textContent?.trim()).toBe('1');
  });
});
