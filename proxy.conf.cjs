/**
 * Dev proxy vers GestionCours (8098).
 * - /onlinecourses et /onsitecourses : chemins réels du microservice (utilisés par CourseApiService).
 * - /api : sessions, salles, réservations sous /api/v1/...
 */
const target = 'http://localhost:8098';

const common = {
  target,
  secure: false,
  changeOrigin: true,
  logLevel: 'debug',
};

module.exports = {
  '/onlinecourses': common,
  '/onsitecourses': common,
  '/api': common,
  // SockJS + STOMP (NotificationStompService → environment.stompSockJsUrl)
  '/ws': common,
};
