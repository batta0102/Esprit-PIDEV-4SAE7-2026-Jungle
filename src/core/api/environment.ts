/**
 * API configuration (Jungle project)
 *
 * Dev (`npm start`): relative URLs (same origin as `localhost:4200`).
 * Root **proxy.conf.cjs** forwards to **GestionCours** on port **8098**.
 * Avoid hard-coded `http://localhost:8098/...` in HttpClient to prevent CORS issues.
 *
 * If a tutorial uses another port or `src/environments/environment.ts`, adjust to your real backend;
 * course microservice here is on **8098** (see Java `application.properties`).
 */
export const environment = {
  /** Prefix for sessions, rooms, bookings, etc. (e.g. `/api/v1/classrooms/all`) */
  apiBaseUrl: '/api/v1',
  /**
   * REST notifications (non-WebSocket). E.g. GET `/api/notifications/my`.
   * Separate from `apiBaseUrl` when Postman/API uses `/api/notifications`, not `/api/v1`.
   */
  notificationsApiBase: '/api/notifications',
  /** Direct GestionCours URL (Postman tests; not used by default in dev) */
  apiGatewayUrl: 'http://localhost:8098',
  apiUrl: '/back',
  stompSockJsUrl: '/ws',
  notificationsStompUserId: '1',
} as const;
