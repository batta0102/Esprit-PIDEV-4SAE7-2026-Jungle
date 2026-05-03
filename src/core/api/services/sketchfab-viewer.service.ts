import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    Sketchfab?: new (iframe: HTMLIFrameElement) => SketchfabEmbedClient;
  }
}

/** Minimal typings for https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js */
interface SketchfabEmbedClient {
  init(
    uid: string,
    options: {
      success?: (api: SketchfabViewerApi) => void;
      error?: (err?: unknown) => void;
      autostart?: number;
      preload?: number;
      ui_theme?: string;
    }
  ): void;
}

interface SketchfabViewerApi {
  start(): void;
}

const SKETCHFAB_VIEWER_SCRIPT = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';

@Injectable({ providedIn: 'root' })
export class SketchfabViewerService {
  private readonly platformId = inject(PLATFORM_ID);
  private scriptPromise: Promise<void> | null = null;

  /**
   * Resolves a 32-char Sketchfab model id from a bare UID or a sketchfab.com URL
   * (models/… or 3d-models/…-uid).
   */
  /** Sketchfab model ids are 32 characters (letters + digits). Preserve casing from user or URL. */
  private static readonly UID_RE = /^[a-z0-9]{32}$/i;
  private static readonly MODELS_PATH_RE = /sketchfab\.com\/models\/([a-z0-9]{32})/i;
  private static readonly SLUG_PATH_RE = /sketchfab\.com\/3d-models\/[\w-]+-([a-z0-9]{32})(?:\b|\/|\?|#)/i;

  extractUidFromString(value: string): string | null {
    const s = String(value ?? '').trim();
    if (!s) return null;
    if (SketchfabViewerService.UID_RE.test(s)) return s;
    const modelsPath = s.match(SketchfabViewerService.MODELS_PATH_RE);
    if (modelsPath) return modelsPath[1];
    const slugPath = s.match(SketchfabViewerService.SLUG_PATH_RE);
    if (slugPath) return slugPath[1];
    return null;
  }

  ensureViewerScript(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }
    if (typeof window.Sketchfab === 'function') {
      return Promise.resolve();
    }
    if (this.scriptPromise) {
      return this.scriptPromise;
    }
    this.scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${SKETCHFAB_VIEWER_SCRIPT}"]`);
      if (existing) {
        const finishIfReady = (): boolean => {
          if (typeof window.Sketchfab === 'function') {
            resolve();
            return true;
          }
          return false;
        };
        if (finishIfReady()) return;
        existing.addEventListener(
          'load',
          () => {
            if (!finishIfReady()) {
              reject(new Error('Sketchfab script loaded but global Sketchfab is missing'));
            }
          },
          { once: true }
        );
        existing.addEventListener('error', () => reject(new Error('Sketchfab script error')), { once: true });
        // If the script finished loading before we subscribed, "load" will not replay — catch next tick.
        queueMicrotask(() => finishIfReady());
        return;
      }
      const script = document.createElement('script');
      script.src = SKETCHFAB_VIEWER_SCRIPT;
      script.async = true;
      script.onload = () => {
        if (typeof window.Sketchfab === 'function') resolve();
        else reject(new Error('Sketchfab script loaded but global Sketchfab is missing'));
      };
      script.onerror = () => reject(new Error('Failed to load Sketchfab Viewer API'));
      document.head.appendChild(script);
    });
    return this.scriptPromise;
  }

  /**
   * Initializes the official Sketchfab Viewer on an empty iframe (about:blank).
   * Call from the browser after the iframe is in the DOM.
   */
  initViewer(iframe: HTMLIFrameElement, modelUid: string): Promise<void> {
    const uid = String(modelUid).trim();
    if (!SketchfabViewerService.UID_RE.test(uid)) {
      return Promise.reject(new Error('Invalid Sketchfab model UID'));
    }
    return this.ensureViewerScript().then(
      () =>
        new Promise((resolve, reject) => {
          const Ctor = window.Sketchfab;
          if (typeof Ctor !== 'function') {
            reject(new Error('Sketchfab global missing'));
            return;
          }
          iframe.setAttribute('src', 'about:blank');
          const client = new Ctor(iframe);
          client.init(uid, {
            autostart: 1,
            preload: 1,
            ui_theme: 'dark',
            success: (api: SketchfabViewerApi) => {
              try {
                api.start();
              } catch {
                /* ignore */
              }
              resolve();
            },
            error: (err?: unknown) => {
              console.error('[SketchfabViewer] init error', err);
              reject(err instanceof Error ? err : new Error('Sketchfab init error'));
            }
          });
        })
    );
  }
}
