import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { RealtimeNotificationService } from './realtime-notification.service';

describe('RealtimeNotificationService', () => {
  let service: RealtimeNotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RealtimeNotificationService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(RealtimeNotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should GET my notifications', () => {
    let resultLength = 0;

    service.getMyNotifications().subscribe((list) => {
      resultLength = list.length;
      expect(list[0].id).toBe(10);
      expect(list[0].read).toBe(false);
    });

    const req = httpMock.expectOne('/api/notifications/my');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: 10,
        userId: 1,
        type: 'COURSE_CREATED',
        title: 'Course added',
        message: 'Created',
        payloadJson: null,
        read: false,
        createdAt: '2026-01-01T10:00:00.000Z',
        readAt: null
      }
    ]);

    expect(resultLength).toBe(1);
  });

  it('should PATCH markAsRead', () => {
    service.markAsRead(7).subscribe((res) => {
      expect(res).toBeUndefined();
    });

    const req = httpMock.expectOne('/api/notifications/7/read');
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });

  it('should emit list refresh when requestListRefresh is called', () => {
    let calls = 0;

    service.onListRefresh().subscribe(() => {
      calls += 1;
    });

    service.requestListRefresh();

    expect(calls).toBe(1);
  });
});
