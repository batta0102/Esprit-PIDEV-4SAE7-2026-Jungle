export interface Booking {
  id?: string | number;
  sessionId: string | number;
  studentId?: string | number;
  status?: string;
  /** Backend: bookingDate (ISO string). */
  bookingDate?: string;
  bookedAt?: string;
  /** Derived: Online | On-site. */
  type?: 'Online' | 'On-site';
  /** Optional: course title from session (for display). */
  courseId?: string | number;
  [key: string]: unknown;
}

export interface BookingCreate {
  type: 'Online' | 'On-site';
  sessionId: string | number;
  studentId: number;
  status: string;
  /** ISO date string e.g. yyyy-MM-ddTHH:mm:ss */
  bookingDate: string;
}
