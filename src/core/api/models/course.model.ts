export type CourseStatus = 'Active' | 'Upcoming' | 'Completed';
export type CourseType = 'Online' | 'On-site' | 'Both';

export interface Course {
  id: string | number;
  title: string;
  instructor?: string;
  description?: string;
  level?: string;
  type?: CourseType;
  classroom?: string;
  tutorId?: number;
  students?: number;
  sessions?: number;
  progress?: number;
  status?: CourseStatus;
  priceOnline?: number;
  priceOnsite?: number;
  rating?: number;
  reviewCount?: number;
  [key: string]: unknown;
}

export interface CourseCreate {
  title: string;
  description?: string;
  level?: string;
  type?: CourseType;
  tutorId?: number;
  classroomName?: string;
  priceOnline?: number;
  priceOnsite?: number;
}

export interface GetCoursesParams {
  search?: string;
  type?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
}
