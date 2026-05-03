/**
 * Backend payloads aligned with DB columns (snake_case).
 * Never send "id" on create.
 */

export interface ClassroomCreatePayload {
  name: string;
  capacity: number;
}

export interface CourseCreatePayload {
  title: string;
  level: string;
  tutor_id: number;
  description?: string | null;
  /** For online_courses only */
  classroom_name?: string | null;
}

export interface SessionCreatePayload {
  course_id: number;
  date: string;
  capacity: number;
  meeting_link?: string | null;
  classroom_id?: number | null;
}

export interface BookingCreatePayload {
  booking_date: string;
  session_id: number;
  student_id: number;
  status: string;
}
