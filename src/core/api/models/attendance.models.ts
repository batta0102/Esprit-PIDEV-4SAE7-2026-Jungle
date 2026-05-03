export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type AttendanceSessionType = 'ONLINE' | 'ONSITE';

export interface Attendance {
  sessionId: number;
  studentId: number;
  status: AttendanceStatus;
  note?: string;
  [key: string]: unknown;
}

export interface MarkAttendanceRequest {
  sessionType: AttendanceSessionType;
  sessionId: number;
  studentId: number;
  status: AttendanceStatus;
  note?: string;
}

export interface RiskConfig {
  courseId?: string | number;
  sessionId?: string | number;
  highThreshold: number;
  mediumThreshold: number;
  minSessionsForRisk?: number;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ExplainReason {
  code: string;
  label: string;
  description?: string;
  weight?: number;
  value?: number;
}

export interface ExplainabilityReport {
  studentId: number;
  sessionId?: number;
  courseId?: string | number;
  attendanceRate: number;
  riskLevel: 'high' | 'medium' | 'low';
  generatedAt: string;
  reasons: ExplainReason[];
}

export interface EarlyWarning {
  studentId: number;
  courseId?: string | number;
  sessionId?: number;
  riskLevel: 'high' | 'medium' | 'low';
  score: number;
  trend: 'up' | 'down' | 'stable';
  message: string;
  triggeredAt: string;
}

export interface AnomalyAlert {
  id: string;
  type: 'absence-spike' | 'late-spike' | 'consecutive-absence' | 'custom';
  severity: 'low' | 'medium' | 'high';
  courseId?: string | number;
  sessionId?: number;
  studentId?: number;
  message: string;
  detectedAt: string;
  metadata?: Record<string, unknown>;
}

export interface Intervention {
  id: string;
  studentId: number;
  courseId?: string | number;
  sessionId?: number;
  type: 'email' | 'call' | 'meeting' | 'message' | 'custom';
  status: 'open' | 'in-progress' | 'closed';
  reason?: string;
  actionPlan?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface StudentBenchmark {
  studentId: number;
  courseId?: string | number;
  attendanceRate: number;
  cohortAverage: number;
  percentile: number;
  rank?: number;
  totalStudents?: number;
}

export interface BenchmarkResponse {
  courseId?: string | number;
  generatedAt: string;
  students: StudentBenchmark[];
}
