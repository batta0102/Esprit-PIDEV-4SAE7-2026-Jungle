export interface Session {
  id: string | number;
  courseId: string | number;
  title?: string;
  /** Backend: date (ISO string or Date). Used for display. */
  date?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  classroomId?: string | number;
  type?: 'Online' | 'On-site';
  maxParticipants?: number;
  capacity?: number;
  meetingLink?: string;
  [key: string]: unknown;
}

export interface SessionCreate {
  type: 'Online' | 'On-site';
  courseId: string | number;
  /** ISO date string for backend (e.g. yyyy-MM-ddTHH:mm:ss) */
  date: string;
  capacity: number;
  meetingLink?: string;
  classroomId?: string | number;
}
