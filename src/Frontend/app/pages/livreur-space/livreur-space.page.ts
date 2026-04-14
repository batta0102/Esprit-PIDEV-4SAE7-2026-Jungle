import { DatePipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { DeliveryTrackingResponse } from '../../core/delivery-tracking/delivery-tracking.model';
import { DeliveryTrackingService, UserProfileResponse } from '../../core/delivery-tracking/delivery-tracking.service';

@Component({
  selector: 'app-livreur-space-page',
  standalone: true,
  imports: [RouterLink, DatePipe, NgClass],
  templateUrl: './livreur-space.page.html',
  styleUrl: './livreur-space.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LivreurSpacePage implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly trackingService = inject(DeliveryTrackingService);

  private watchId: number | null = null;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private currentProfile: UserProfileResponse | null = null;

  readonly loading = signal(true);
  readonly gpsStatus = signal('Starting...');
  readonly error = signal<string | null>(null);
  readonly currentLat = signal<number | null>(null);
  readonly currentLng = signal<number | null>(null);
  readonly deliveries = signal<DeliveryTrackingResponse[]>([]);

  async ngOnInit(): Promise<void> {
    await this.auth.init();
    this.loadProfileAndStartGps();
  }

  ngOnDestroy(): void {
    this.stopGps();
  }

  refresh(): void {
    if (this.currentProfile) {
      this.loadAssignedDeliveries(this.currentProfile.id);
    }
  }

  private loadProfileAndStartGps(): void {
    this.loading.set(true);
    this.error.set(null);

    this.trackingService.getCurrentUserProfile().subscribe({
      next: (profile) => {
        if (profile.role !== 'LIVREUR') {
          this.loading.set(false);
          this.error.set('This space is only available for LIVREUR accounts.');
          this.gpsStatus.set('Not a driver account');
          return;
        }

        this.currentProfile = profile;
        this.currentLat.set(profile.currentLat ?? null);
        this.currentLng.set(profile.currentLng ?? null);
        this.gpsStatus.set('Starting GPS watch...');
        this.startGps(profile.id);
        this.loadAssignedDeliveries(profile.id);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Unable to load your driver profile.');
      }
    });
  }

  private startGps(livreurId: number): void {
    if (!('geolocation' in navigator)) {
      this.error.set('Geolocation is not supported by this browser.');
      this.gpsStatus.set('GPS unavailable');
      this.loading.set(false);
      return;
    }

    this.stopGps();

    this.syncCurrentPosition(livreurId, 'Initial location synced');
    this.startSyncTimer(livreurId);

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.pushLocationUpdate(
          livreurId,
          position.coords.latitude,
          position.coords.longitude,
          `Location updated at ${new Date().toLocaleTimeString()}`
        );
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          this.error.set('Location permission denied.');
          this.gpsStatus.set('Permission denied');
        } else if (error.code === error.TIMEOUT) {
          this.error.set('GPS timeout. Please try again.');
          this.gpsStatus.set('Waiting for GPS...');
        } else {
          this.error.set('Unable to read GPS location.');
          this.gpsStatus.set('GPS error');
        }
        this.loading.set(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  }

  private startSyncTimer(livreurId: number): void {
    this.stopSyncTimer();

    this.syncTimer = setInterval(() => {
      this.syncCurrentPosition(livreurId, 'Location refreshed');
    }, 15000);
  }

  private stopSyncTimer(): void {
    if (this.syncTimer != null) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  private syncCurrentPosition(livreurId: number, statusMessage: string): void {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.pushLocationUpdate(
          livreurId,
          position.coords.latitude,
          position.coords.longitude,
          statusMessage
        );
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          this.error.set('Location permission denied.');
          this.gpsStatus.set('Permission denied');
        } else if (error.code === error.TIMEOUT) {
          this.gpsStatus.set('Waiting for GPS fix...');
        }
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  }

  private pushLocationUpdate(
    livreurId: number,
    latitude: number,
    longitude: number,
    statusMessage: string
  ): void {
    this.currentLat.set(latitude);
    this.currentLng.set(longitude);
    this.gpsStatus.set('Updating your location...');

    this.trackingService.updateLivreurLocation(livreurId, {
      currentLat: latitude,
      currentLng: longitude
    }).subscribe({
      next: () => {
        this.trackingService.syncDeliveryLocation(livreurId, {
          currentLat: latitude,
          currentLng: longitude
        }).subscribe({
          next: () => {
            this.error.set(null);
            this.gpsStatus.set(statusMessage);
            this.loadAssignedDeliveries(livreurId);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(err?.error?.message || 'Failed to sync delivery tracking location.');
            this.gpsStatus.set('GPS sync failed');
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to update your live location.');
        this.gpsStatus.set('GPS update failed');
        this.loading.set(false);
      }
    });
  }

  private stopGps(): void {
    this.stopSyncTimer();

    if (this.watchId != null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  private loadAssignedDeliveries(livreurId: number): void {
    this.trackingService.getAssignedDeliveriesTracking(livreurId).subscribe({
      next: (items) => {
        this.deliveries.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load assigned deliveries.');
        this.loading.set(false);
      }
    });
  }

  getStatusClass(status: string | null | undefined): string {
    switch ((status || '').toUpperCase()) {
      case 'DELIVERED':
        return 'status-delivered';
      case 'IN_TRANSIT':
        return 'status-transit';
      case 'ASSIGNED':
        return 'status-assigned';
      case 'PENDING':
        return 'status-pending';
      default:
        return 'status-unknown';
    }
  }
}
