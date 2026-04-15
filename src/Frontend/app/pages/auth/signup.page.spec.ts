import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { SignupPage } from './signup.page';
import { AuthService } from '../../core/auth/auth.service';

describe('SignupPage', () => {
  let fixture: ComponentFixture<SignupPage>;
  let component: SignupPage;
  let authMock: { register: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authMock = {
      register: vi.fn().mockResolvedValue(undefined)
    };

    await TestBed.configureTestingModule({
      imports: [SignupPage],
      providers: [provideRouter([]), { provide: AuthService, useValue: authMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call register on submit', async () => {
    await component.submit();

    expect(authMock.register).toHaveBeenCalled();
    expect(component.error()).toBeNull();
  });

  it('should handle signup error', async () => {
    authMock.register.mockRejectedValueOnce(new Error('boom'));

    await component.submit();

    expect(component.error()).toBe('Sign up failed. Please try again.');
    expect(component.busy()).toBe(false);
  });
});
