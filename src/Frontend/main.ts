import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err: unknown) => {
  console.error(err);
  document.body.innerHTML +=
    '<pre style="padding:1rem;background:#fee;color:#900;font:12px monospace;white-space:pre-wrap">' +
    (err instanceof Error ? err.message + '\n' + (err.stack ?? '') : String(err)) +
    '</pre>';
});
