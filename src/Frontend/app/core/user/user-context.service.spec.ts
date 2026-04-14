import { TestBed } from '@angular/core/testing';

import { UserContextService } from './user-context.service';

describe('UserContextService', () => {
  let service: UserContextService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserContextService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should update role', () => {
    service.setRole('ADMIN');

    expect(service.role()).toBe('ADMIN');
    expect(localStorage.getItem('jie-role-v1')).toBe('ADMIN');
  });

  it('should enroll training and store mode', () => {
    service.enrollTraining('t1', 'onsite');

    expect(service.participation().enrolledTrainingIds).toContain('t1');
    expect(service.getEnrollmentMode('t1')).toBe('onsite');
  });

  it('should join club and avoid duplicate', () => {
    service.joinClub('c1');
    service.joinClub('c1');

    const joined = service.participation().joinedClubIds;
    expect(joined.length).toBe(1);
    expect(joined[0]).toBe('c1');
  });

  it('should book event and avoid duplicate', () => {
    service.bookEvent('e1');
    service.bookEvent('e1');

    const booked = service.participation().bookedEventIds;
    expect(booked.length).toBe(1);
    expect(booked[0]).toBe('e1');
  });
});
