import { Observable } from 'rxjs';
import { Course, CourseCreate, GetCoursesParams } from '../models';
import { Session, SessionCreate } from '../models';
import { Booking, BookingCreate } from '../models';

/** Course API interface – implement with real or mock. */
export interface ICourseApiService {
  getCourses(params?: GetCoursesParams): Observable<Course[]>;
  getCourseById(id: string | number, type?: 'Online' | 'On-site'): Observable<Course>;
  createCourse(course: CourseCreate): Observable<Course>;
  updateCourse(id: string | number, type: 'Online' | 'On-site', course: Partial<CourseCreate>): Observable<Course>;
  deleteCourse(id: string | number, type: 'Online' | 'On-site'): Observable<void>;
}

/** Session API interface – implement with real or mock. */
export interface ISessionApiService {
  getSessions(params?: { courseId?: string | number }): Observable<Session[]>;
  getSessionById(id: string | number, type: 'Online' | 'On-site'): Observable<Session>;
  createSession(session: SessionCreate): Observable<Session>;
  updateSession(id: string | number, type: 'Online' | 'On-site', session: Partial<SessionCreate>): Observable<Session>;
  deleteSession(id: string | number, type: 'Online' | 'On-site'): Observable<void>;
}

/** Booking API params (e.g. studentId, sessionId). */
export interface GetBookingsParams {
  sessionId?: string | number;
  studentId?: string | number;
  courseId?: string | number;
}

/** Booking API interface – implement with real or mock. */
export interface IBookingApiService {
  getBookings(params?: GetBookingsParams): Observable<Booking[]>;
  getBookingById(id: string | number, type: 'Online' | 'On-site'): Observable<Booking>;
  createBooking(payload: BookingCreate): Observable<Booking>;
  updateBooking(id: string | number, type: 'Online' | 'On-site', payload: Partial<BookingCreate>): Observable<Booking>;
  deleteBooking(id: string | number, type: 'Online' | 'On-site'): Observable<void>;
}
