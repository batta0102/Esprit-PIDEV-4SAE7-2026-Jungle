import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface OnlineCourseRequestDto {
  title: string;
  description?: string;
  level: Level;
  tutorId: number;
}

export interface OnlineCourseResponseDto {
  id: number;
  title: string;
  description?: string;
  level: Level;
  tutorId: number;
}

@Injectable({ providedIn: 'root' })
export class OnlineCourseService {
  private readonly baseUrl = 'http://localhost:9090/onlinecourses';

  constructor(private http: HttpClient) {}

  getAllCourses(): Observable<ApiResponse<OnlineCourseResponseDto[]>> {
    return this.http.get<ApiResponse<OnlineCourseResponseDto[]>>(`${this.baseUrl}/all`);
  }

  addCourse(payload: OnlineCourseRequestDto): Observable<ApiResponse<OnlineCourseResponseDto>> {
    return this.http.post<ApiResponse<OnlineCourseResponseDto>>(`${this.baseUrl}/add`, payload);
  }
}
