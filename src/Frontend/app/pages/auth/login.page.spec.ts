import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { LoginPage } from './login.page';
import { AuthService } from '../../core/auth/auth.service';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let component: LoginPage;
  let authMock: { login: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authMock = {
      login: vi.fn().mockResolvedValue(undefined)
    };

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([]), { provide: AuthService, useValue: authMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call auth login on submit', async () => {
    await component.submit();

    expect(authMock.login).toHaveBeenCalled();
    expect(component.error()).toBeNull();
  });

  it('should handle error when login fails', async () => {
    authMock.login.mockRejectedValueOnce(new Error('Login failed'));

    await component.submit();

    expect(component.error()).toContain('Login failed');
    expect(component.busy()).toBe(false);
  });
});
