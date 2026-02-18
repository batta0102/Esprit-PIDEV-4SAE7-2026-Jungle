import { Component, OnInit } from '@angular/core';
import { CourseService, CourseResponseDto, OnlineCourseRequestDto, ApiResponse } from '../../core/course/course.service';

/**
 * Course Management Component
 * 
 * Example component showing how to:
 * - Display list of courses
 * - Create new course
 * - Update existing course
 * - Delete course
 * 
 * Integrates with CourseService to communicate with backend via API Gateway
 */
@Component({
  selector: 'app-course-management',
  templateUrl: './course-management.component.html',
  styleUrls: ['./course-management.component.scss']
})
export class CourseManagementComponent implements OnInit {

  courses: CourseResponseDto[] = [];
  selectedCourse: CourseResponseDto | null = null;
  
  // Form state
  showForm = false;
  isEditMode = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Form data
  formData: OnlineCourseRequestDto = {
    title: '',
    description: '',
    level: 'BEGINNER',
    tutorId: 0
  };

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  /**
   * Load all courses from backend
   */
  loadCourses(): void {
    this.loading = true;
    this.courseService.getAllCourses().subscribe({
      next: (response: ApiResponse<CourseResponseDto[]>) => {
        this.courses = response.data;
        this.loading = false;
        this.successMessage = response.message;
        this.clearSuccessMessage();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Failed to load courses: ' + error.message;
        this.clearErrorMessage();
      }
    });
  }

  /**
   * Get course by ID
   */
  viewCourseDetails(id: number): void {
    this.loading = true;
    this.courseService.getCourseById(id).subscribe({
      next: (response: ApiResponse<CourseResponseDto>) => {
        this.selectedCourse = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Failed to load course details: ' + error.message;
        this.clearErrorMessage();
      }
    });
  }

  /**
   * Open form for creating new course
   */
  openCreateForm(): void {
    this.isEditMode = false;
    this.showForm = true;
    this.resetForm();
    this.selectedCourse = null;
  }

  /**
   * Open form for editing existing course
   */
  openEditForm(course: CourseResponseDto): void {
    this.isEditMode = true;
    this.showForm = true;
    this.selectedCourse = course;
    this.formData = {
      title: course.title,
      description: course.description,
      level: course.level,
      tutorId: course.tutorId
    };
  }

  /**
   * Submit form (create or update)
   */
  submitForm(): void {
    if (!this.validateForm()) {
      this.errorMessage = 'Please fill all required fields';
      this.clearErrorMessage();
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.selectedCourse) {
      // Update course
      this.courseService.updateCourse(this.selectedCourse.id, this.formData).subscribe({
        next: (response: ApiResponse<CourseResponseDto>) => {
          this.loading = false;
          this.successMessage = response.message;
          this.loadCourses();
          this.closeForm();
          this.clearSuccessMessage();
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'Failed to update course: ' + error.message;
          this.clearErrorMessage();
        }
      });
    } else {
      // Create new course
      this.courseService.addCourse(this.formData).subscribe({
        next: (response: ApiResponse<CourseResponseDto>) => {
          this.loading = false;
          this.successMessage = response.message;
          this.loadCourses();
          this.closeForm();
          this.clearSuccessMessage();
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = 'Failed to create course: ' + error.message;
          this.clearErrorMessage();
        }
      });
    }
  }

  /**
   * Delete course
   */
  deleteCourse(id: number): void {
    if (!confirm('Are you sure you want to delete this course?')) {
      return;
    }

    this.loading = true;
    this.courseService.deleteCourse(id).subscribe({
      next: (response: ApiResponse<void>) => {
        this.loading = false;
        this.successMessage = response.message;
        this.loadCourses();
        this.selectedCourse = null;
        this.clearSuccessMessage();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Failed to delete course: ' + error.message;
        this.clearErrorMessage();
      }
    });
  }

  /**
   * Close form
   */
  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  /**
   * Reset form data
   */
  private resetForm(): void {
    this.formData = {
      title: '',
      description: '',
      level: 'BEGINNER',
      tutorId: 0
    };
  }

  /**
   * Validate form data
   */
  private validateForm(): boolean {
    return !!(this.formData.title && this.formData.tutorId > 0);
  }

  /**
   * Clear error message after 5 seconds
   */
  private clearErrorMessage(): void {
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  /**
   * Clear success message after 3 seconds
   */
  private clearSuccessMessage(): void {
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }
}
