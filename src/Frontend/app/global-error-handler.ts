import { ErrorHandler, Injectable } from '@angular/core';

/**
 * Affiche la première erreur runtime dans la page (utile si la console est peu visible).
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    const message =
      error instanceof Error ? `${error.message}\n${error.stack ?? ''}` : String(error);
    console.error(message);

    try {
      if (typeof document === 'undefined' || document.querySelector('[data-jie-err]')) {
        return;
      }
      const el = document.createElement('pre');
      el.setAttribute('data-jie-err', '1');
      el.setAttribute('role', 'alert');
      el.style.cssText =
        'position:fixed;bottom:0;left:0;right:0;max-height:45vh;overflow:auto;margin:0;padding:12px;' +
        'background:#450a0a;color:#fecaca;font:12px/1.4 ui-monospace,monospace;z-index:2147483647;' +
        'border-top:2px solid #f87171';
      el.textContent = 'Erreur — ' + message;
      document.body.appendChild(el);
    } catch {
      /* ignore */
    }
  }
}
