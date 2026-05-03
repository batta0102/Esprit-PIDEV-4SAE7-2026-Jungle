import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Course, CourseCreate, GetCoursesParams } from '../models';

/** GestionCours mappe les cours sur /onlinecourses et /onsitecourses (hors /api/v1). */
const COURSE_ONLINE = '/onlinecourses';
const COURSE_ONSITE = '/onsitecourses';

function toList<T>(res: T[] | { content?: T[]; data?: T[] } | null | undefined): T[] {
  if (Array.isArray(res)) return res;
  if (res && typeof res === 'object') {
    const o = res as Record<string, unknown>;
    if (Array.isArray(o['content'])) return o['content'] as T[];
    if (Array.isArray(o['data'])) return o['data'] as T[];
    if (Array.isArray(o['items'])) return o['items'] as T[];
    if (Array.isArray(o['results'])) return o['results'] as T[];
    if (Array.isArray(o['onlineCourses'])) return o['onlineCourses'] as T[];
    if (Array.isArray(o['onsiteCourses'])) return o['onsiteCourses'] as T[];
    const firstArrayValue = Object.values(o).find((value) => Array.isArray(value));
    if (Array.isArray(firstArrayValue)) return firstArrayValue as T[];
  }
  return [];
}

function normalizeType(rawType: unknown, fallback: 'Online' | 'On-site'): 'Online' | 'On-site' {
  const text = String(rawType ?? '').trim().toLowerCase();
  if (!text) return fallback;
  if (text.includes('site') || text.includes('onsite') || text.includes('on-site')) return 'On-site';
  if (text.includes('online')) return 'Online';
  return fallback;
}

function normalizeCourse(raw: Course, fallbackType: 'Online' | 'On-site'): Course {
  const src = (raw ?? {}) as Record<string, unknown>;
  const id =
    src['id'] ??
    src['courseId'] ??
    src['onlineCourseId'] ??
    src['onsiteCourseId'] ??
    src['_id'] ??
    `${fallbackType}-${Math.random().toString(36).slice(2, 9)}`;
  const title =
    src['title'] ??
    src['courseTitle'] ??
    src['courseName'] ??
    src['name'] ??
    `Course ${String(id)}`;

  const tutorId = src['tutorId'] ?? src['tutor_id'];
  const classroomName = src['classroomName'] ?? src['classroom_name'] ?? src['classroom'];
  const classroomId = src['classroomId'] ?? src['classroom_id'];
  return {
    ...(src as Course),
    id: id as string | number,
    title: String(title),
    instructor: (src['instructor'] ?? src['teacher'] ?? src['tutorName'] ?? src['trainer']) as string | undefined,
    description: (src['description'] ?? src['details'] ?? src['summary']) as string | undefined,
    level: (src['level'] ?? src['courseLevel'] ?? src['languageLevel']) as string | undefined,
    type: normalizeType(src['type'] ?? src['courseType'] ?? src['mode'], fallbackType),
    ...(tutorId != null && { tutorId: Number(tutorId) }),
    ...(classroomName != null && classroomName !== '' && { classroom: String(classroomName) }),
    ...(classroomId != null && { classroomId: Number(classroomId) })
  };
}

@Injectable({ providedIn: 'root' })
export class CourseApiService {
  private readonly http = inject(HttpClient);

  getCourses(params?: GetCoursesParams): Observable<Course[]> {
    const onlineUrl = `${COURSE_ONLINE}/all`;
    const onsiteUrl = `${COURSE_ONSITE}/all`;
    return forkJoin({
      online: this.http.get<Course[] | { content?: Course[]; data?: Course[] }>(onlineUrl).pipe(
        map(toList),
        catchError(() => of([]))
      ),
      onsite: this.http.get<Course[] | { content?: Course[]; data?: Course[] }>(onsiteUrl).pipe(
        map(toList),
        catchError(() => of([]))
      )
    }).pipe(
      map(({ online, onsite }) => {
        const onlineWithType = online.map((c) => normalizeCourse(c, 'Online'));
        const onsiteWithType = onsite.map((c) => normalizeCourse(c, 'On-site'));
        const byId = new Map<string, Course>();
        [...onlineWithType, ...onsiteWithType].forEach((course) => {
          byId.set(String(course.id), course);
        });
        let list = Array.from(byId.values());
        if (params?.search?.trim()) {
          const q = params.search.trim().toLowerCase();
          list = list.filter((c) => (c.title ?? '').toLowerCase().includes(q));
        }
        if (params?.level) list = list.filter((c) => (c.level ?? '') === params.level);
        if (params?.type) list = list.filter((c) => (c.type ?? '') === params.type);
        return list;
      })
    );
  }

  getCourseById(id: string | number, type?: 'Online' | 'On-site'): Observable<Course> {
    const unwrap = (res: unknown): Course => {
      if (res && typeof res === 'object' && res !== null && 'data' in res) {
        const data = (res as { data?: unknown }).data;
        if (data && typeof data === 'object') return data as Course;
      }
      return res as Course;
    };
    if (type) {
      const basePath = type === 'On-site' ? COURSE_ONSITE : COURSE_ONLINE;
      return this.http.get<Course | { data?: Course }>(`${basePath}/${id}`).pipe(
        map((res) => normalizeCourse(unwrap(res), type)),
        catchError(this.handleError)
      );
    }
    return this.http.get<Course | { data?: Course }>(`${COURSE_ONLINE}/${id}`).pipe(
      map((res) => normalizeCourse(unwrap(res), 'Online')),
      catchError(() =>
        this.http.get<Course | { data?: Course }>(`${COURSE_ONSITE}/${id}`).pipe(
          map((res) => normalizeCourse(unwrap(res), 'On-site')),
          catchError(this.handleError)
        )
      )
    );
  }

  createCourse(course: CourseCreate): Observable<Course> {
    const type = course.type === 'On-site' ? 'On-site' : 'Online';
    const basePath = type === 'On-site' ? COURSE_ONSITE : COURSE_ONLINE;
    const body = this.toBackendCreateBody(course);
    return this.http.post<Course | { data?: Course }>(`${basePath}/add`, body).pipe(
      map((res) => {
        const c = res && typeof res === 'object' && 'data' in res ? (res as { data?: Course }).data : res;
        const raw: Course = (c ?? res) as Course;
        return normalizeCourse(raw, type);
      }),
      catchError(this.handleError)
    );
  }

  updateCourse(id: string | number, type: 'Online' | 'On-site', course: Partial<CourseCreate>): Observable<Course> {
    const basePath = type === 'On-site' ? COURSE_ONSITE : COURSE_ONLINE;
    const body = this.toBackendUpdateBody({ ...course, type } as CourseCreate);
    return this.http.put<Course | { data?: Course }>(`${basePath}/update/${id}`, body).pipe(
      map((res) => {
        const c = res && typeof res === 'object' && 'data' in res ? (res as { data?: Course }).data : res;
        const raw: Course = (c ?? res) as Course;
        return normalizeCourse(raw, type);
      }),
      catchError(this.handleError)
    );
  }

  deleteCourse(id: string | number, type: 'Online' | 'On-site'): Observable<void> {
    const basePath = type === 'On-site' ? COURSE_ONSITE : COURSE_ONLINE;
    return this.http.delete<void>(`${basePath}/delete/${id}`).pipe(catchError(this.handleError));
  }

  private toBackendCreateBody(course: CourseCreate): Record<string, unknown> {
    const base: Record<string, unknown> = {
      title: course.title ?? '',
      level: course.level ?? 'A1',
      tutorId: course.tutorId != null ? Number(course.tutorId) : null,
      description: course.description ?? null
    };
    if (course.type === 'On-site') {
      base['classroomName'] = (course as unknown as Record<string, unknown>)['classroomName'] ?? null;
    }
    return base;
  }

  private toBackendUpdateBody(course: Partial<CourseCreate>): Record<string, unknown> {
    const base = this.toBackendCreateBody({ ...course, type: course.type } as CourseCreate);
    return base;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const msg = error.error?.message ?? error.message ?? 'Request failed';
    console.error('[CourseApiService]', error.status, error.url, msg);
    const enrichedError = Object.assign(new Error(msg), {
      status: error.status,
      originalError: error
    });
    return throwError(() => enrichedError);
  }
}
