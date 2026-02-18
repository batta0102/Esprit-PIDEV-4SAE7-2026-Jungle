import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Course Service
 * 
 * Service for consuming Course Management microservice endpoints via API Gateway.
 * 
 * Base URL: http://localhost:8087/courses
 * Microservice: GestionCours (Port 9090)
 * 
 * Endpoints:
 * - GET /courses/all - Retrieve all courses
 * - GET /courses/getCour/{id} - Get course by ID
 * - POST /courses/add - Create new course
 * - PUT /courses/update/{id} - Update course
 * - DELETE /courses/delete/{id} - Delete course
 */
@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:8087/courses'; // API Gateway URL
  // Alternative direct URL (without API Gateway):
  // private apiUrl = 'http://localhost:9090/onlinecourses';

  constructor(private http: HttpClient) {}

  /**
   * Get all courses
   * @returns Observable<ApiResponse<CourseResponseDto[]>>
   */
  getAllCourses(): Observable<ApiResponse<CourseResponseDto[]>> {
    return this.http.get<ApiResponse<CourseResponseDto[]>>(
      `${this.apiUrl}/all`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get course by ID
   * @param id - Course ID
   * @returns Observable<ApiResponse<CourseResponseDto>>
   */
  getCourseById(id: number): Observable<ApiResponse<CourseResponseDto>> {
    return this.http.get<ApiResponse<CourseResponseDto>>(
      `${this.apiUrl}/getCour/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create new course
   * @param courseData - Course data (OnlineCourseRequestDto)
   * @returns Observable<ApiResponse<CourseResponseDto>>
   */
  addCourse(courseData: OnlineCourseRequestDto): Observable<ApiResponse<CourseResponseDto>> {
    return this.http.post<ApiResponse<CourseResponseDto>>(
      `${this.apiUrl}/add`,
      courseData
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update existing course
   * @param id - Course ID
   * @param courseData - Updated course data
   * @returns Observable<ApiResponse<CourseResponseDto>>
   */
  updateCourse(id: number, courseData: OnlineCourseRequestDto): Observable<ApiResponse<CourseResponseDto>> {
    return this.http.put<ApiResponse<CourseResponseDto>>(
      `${this.apiUrl}/update/${id}`,
      courseData
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete course
   * @param id - Course ID
   * @returns Observable<ApiResponse<void>>
   */
  deleteCourse(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/delete/${id}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Error handling for all HTTP requests
   * @param error - HttpErrorResponse
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }

    console.error('Course Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

/**
 * API Response wrapper
 * Standard response format from backend
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp?: string;
}

/**
 * Course Request DTO
 * Used for creating and updating courses
 */
export interface OnlineCourseRequestDto {
  title: string;
  description?: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  tutorId: number;
}

/**
 * Course Response DTO
 * Returned from server
 */
export interface CourseResponseDto {
  id: number;
  title: string;
  description?: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  tutorId: number;
  createdAt?: string;
  updatedAt?: string;
}
