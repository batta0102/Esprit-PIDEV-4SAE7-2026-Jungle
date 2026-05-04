import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as L from 'leaflet';

import { DeliveryTrackingService } from '../../core/delivery-tracking/delivery-tracking.service';
import { DeliveryTrackingResponse } from '../../core/delivery-tracking/delivery-tracking.model';

@Component({
  selector: 'app-tracking-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './tracking.page.html',
  styleUrl: './tracking.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackingPage implements OnInit, AfterViewInit, OnDestroy {
  private static leafletIconConfigured = false;

  @ViewChild('mapContainer')
  private mapContainer?: ElementRef<HTMLDivElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly trackingService = inject(DeliveryTrackingService);
  private readonly destroyRef = inject(DestroyRef);

  private map?: L.Map;
  private driverMarker?: L.Marker;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private shouldCenterOnFirstFix = true;

  readonly deliveryId = signal<number | null>(null);
  readonly tracking = signal<DeliveryTrackingResponse | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly hasCoordinates = computed(() => {
    const value = this.tracking();
    return value?.currentLat != null && value?.currentLng != null;
  });

  readonly noLocationMessage = computed(() => {
    const value = this.tracking();
    if (!value) {
      return null;
    }

    const assignedUserId = value.assignedUserId ?? value.livreurId;
    if (!assignedUserId) {
      return 'No delivery driver is assigned to this delivery yet.';
    }

    if (value.currentLat == null || value.currentLng == null) {
      return 'Driver location is not available yet. Please refresh in a few seconds.';
    }

    return null;
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const rawId = params.get('deliveryId');
      const parsedId = Number(rawId);

      if (!rawId || Number.isNaN(parsedId) || parsedId <= 0) {
        this.loading.set(false);
        this.errorMessage.set('Invalid delivery ID in URL.');
        this.stopAutoRefresh();
        return;
      }

      this.deliveryId.set(parsedId);
      this.errorMessage.set(null);
      this.shouldCenterOnFirstFix = true;
      this.fetchTracking(true);
      this.startAutoRefresh();
    });
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();

    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  refreshNow(): void {
    this.fetchTracking(false);
  }

  private fetchTracking(withLoadingState: boolean): void {
    const id = this.deliveryId();
    if (!id) {
      return;
    }

    if (withLoadingState) {
      this.loading.set(true);
    }

    this.trackingService
      .getDeliveryTracking(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.tracking.set(response);
          this.errorMessage.set(null);
          this.loading.set(false);
          this.updateDriverMarker(response);
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          this.errorMessage.set(this.toUserError(error));

          if (this.shouldStopAutoRefreshAfterError(error)) {
            this.stopAutoRefresh();
          }
        }
      });
  }

  private startAutoRefresh(): void {
    this.stopAutoRefresh();

    this.refreshTimer = setInterval(() => {
      this.fetchTracking(false);
    }, 10000);
  }

  private stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private initializeMap(): void {
    if (this.map || !this.mapContainer) {
      return;
    }

    this.configureLeafletDefaultMarkerIcon();

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [35.8256, 10.6084],
      zoom: 12,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private updateDriverMarker(response: DeliveryTrackingResponse): void {
    if (!this.map || response.currentLat == null || response.currentLng == null) {
      return;
    }

    const nextPosition = L.latLng(response.currentLat, response.currentLng);

    if (!this.driverMarker) {
      this.driverMarker = L.marker(nextPosition, {
        title: response.livreurName || 'Delivery driver'
      })
        .addTo(this.map)
        .bindPopup(this.getPopupLabel(response));

      this.driverMarker.openPopup();
      this.map.setView(nextPosition, Math.max(this.map.getZoom(), 14));
      this.shouldCenterOnFirstFix = false;
      return;
    }

    this.driverMarker.setLatLng(nextPosition);
    this.driverMarker.bindPopup(this.getPopupLabel(response));

    const shouldRecenter = this.shouldCenterOnFirstFix || !this.map.getBounds().pad(-0.2).contains(nextPosition);
    if (shouldRecenter) {
      this.map.panTo(nextPosition, { animate: true, duration: 0.7 });
      this.shouldCenterOnFirstFix = false;
    }
  }

  private getPopupLabel(response: DeliveryTrackingResponse): string {
    const name = response.livreurName || 'Driver';
    const status = response.message || response.deliveryStatus || 'Unknown status';
    return `${name} - ${status}`;
  }

  private configureLeafletDefaultMarkerIcon(): void {
    if (TrackingPage.leafletIconConfigured) {
      return;
    }

    const carSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
        <g fill="none" fill-rule="evenodd">
          <path d="M14 35.5c1.2-5.5 5.1-10.5 10.9-10.5h14.2c5.8 0 9.7 5 10.9 10.5l2 8.5H12l2-8.5Z" fill="#275d5a"/>
          <path d="M18 28.5c0-2.5 2-4.5 4.5-4.5h19c2.5 0 4.5 2 4.5 4.5V30H18v-1.5Z" fill="#3d7b76"/>
          <path d="M21 31h22l-1.2-5.1c-.4-1.7-1.9-2.9-3.7-2.9H26c-1.8 0-3.3 1.2-3.7 2.9L21 31Z" fill="#eef5f2" opacity="0.95"/>
          <path d="M20 43c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6 6 2.7 6 6Zm36 0c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6 6 2.7 6 6Z" fill="#1e1e1e"/>
          <circle cx="14" cy="43" r="3.2" fill="#b8c7c4"/>
          <circle cx="50" cy="43" r="3.2" fill="#b8c7c4"/>
          <path d="M18 36h28v2H18z" fill="#173d3b" opacity="0.8"/>
        </g>
      </svg>
    `.trim();

    const carIcon = L.icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(carSvg)}`,
      iconSize: [42, 42],
      iconAnchor: [21, 36],
      popupAnchor: [0, -30],
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      shadowSize: [41, 41],
      shadowAnchor: [13, 41]
    });

    L.Marker.prototype.options.icon = carIcon;

    TrackingPage.leafletIconConfigured = true;
  }

  private toUserError(error: HttpErrorResponse): string {
    if (error.status === 404) {
      return 'Tracking information not found for this delivery.';
    }

    if (error.status >= 500) {
      return 'Tracking service error. Verify the API Gateway and delivery backend.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Your session expired. Please log in again.';
    }

    if (error.status === 0) {
      return 'Cannot reach API Gateway on localhost:8085.';
    }

    return 'Failed to load tracking details. Please try again.';
  }

  private shouldStopAutoRefreshAfterError(error: HttpErrorResponse): boolean {
    return error.status === 0 || error.status === 404 || error.status >= 500;
  }
}
