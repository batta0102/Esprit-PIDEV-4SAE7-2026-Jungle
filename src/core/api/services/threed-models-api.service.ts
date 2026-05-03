import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environment';
import { ThreeDModelSearchHit } from '../models/threed-model-search.model';
import { SketchfabViewerService } from './sketchfab-viewer.service';

const SEARCH_URL = `${environment.apiBaseUrl}/3d-models/search`;

interface ApiEnvelope<T> {
  data?: T;
  success?: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class ThreeDModelsApiService {
  private readonly http = inject(HttpClient);
  private readonly sketchfabViewer = inject(SketchfabViewerService);

  /**
   * Calls backend: GET /api/v1/3d-models/search?query=...
   */
  search(query: string): Observable<ThreeDModelSearchHit[]> {
    const q = String(query ?? '').trim();
    if (!q) {
      return new Observable((sub) => {
        sub.next([]);
        sub.complete();
      });
    }
    const params = new HttpParams().set('query', q);
    return this.http.get<unknown>(SEARCH_URL, { params }).pipe(
      map((res) => this.normalizeList(res)),
      catchError((err: { status?: number; message?: string }) => {
        const msg =
          err?.message ??
          (typeof err === 'object' && err !== null && 'error' in err
            ? String((err as { error?: { message?: string } }).error?.message)
            : 'Search failed');
        return throwError(() => Object.assign(new Error(msg), { status: err?.status }));
      })
    );
  }

  private normalizeList(res: unknown): ThreeDModelSearchHit[] {
    let rows: unknown[] = [];
    if (Array.isArray(res)) {
      rows = res;
    } else if (res && typeof res === 'object') {
      const o = res as Record<string, unknown>;
      const d = o['data'];
      if (Array.isArray(d)) rows = d;
      else if (d && typeof d === 'object' && Array.isArray((d as Record<string, unknown>)['content'])) {
        rows = (d as Record<string, unknown>)['content'] as unknown[];
      } else if (Array.isArray(o['content'])) {
        rows = o['content'] as unknown[];
      }
    }
    const out: ThreeDModelSearchHit[] = [];
    for (const row of rows) {
      const hit = this.normalizeHit(row);
      if (hit) out.push(hit);
    }
    return out;
  }

  private normalizeHit(row: unknown): ThreeDModelSearchHit | null {
    if (!row || typeof row !== 'object') return null;
    const r = row as Record<string, unknown>;
    const uidRaw =
      r['uid'] ?? r['modelUid'] ?? r['sketchfabModelUid'] ?? r['sketchfab_uid'] ?? r['id'];
    if (uidRaw == null) return null;
    const uidStr = String(uidRaw).trim();
    const uid =
      this.sketchfabViewer.extractUidFromString(uidStr) ??
      (/^[a-z0-9]{32}$/i.test(uidStr) ? uidStr : null);
    if (!uid) return null;
    const nameRaw = r['name'] ?? r['title'] ?? r['modelName'] ?? '3D model';
    const thumbRaw =
      r['thumbnailUrl'] ?? r['thumbnail'] ?? r['imageUrl'] ?? r['previewUrl'] ?? r['thumbnail_url'];
    const name = String(nameRaw).trim() || '3D model';
    const thumbnailUrl =
      thumbRaw != null && String(thumbRaw).trim() !== '' ? String(thumbRaw).trim() : undefined;
    return { uid, name, thumbnailUrl };
  }
}
