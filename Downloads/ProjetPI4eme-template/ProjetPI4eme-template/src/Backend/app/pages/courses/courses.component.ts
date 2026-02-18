import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppCardComponent } from '../../components/ui/card.component';
import { AppEmptyStateComponent } from '../../components/ui/empty-state.component';
import { CourseCardComponent } from '../../components/course-card/course-card.component';
import { OnlineCourseService, OnlineCourseRequestDto, OnlineCourseResponseDto } from '../../core/online-course.service';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, AppCardComponent, AppEmptyStateComponent, CourseCardComponent],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {
  courses: OnlineCourseResponseDto[] = [];

  showCreateModal = false;
  formError = '';

  newCourse: OnlineCourseRequestDto = {
    title: '',
    description: '',
    level: 'A1',
    tutorId: 0
  };

  isLoading = false;
  loadError = '';

  constructor(private courseService: OnlineCourseService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.formError = '';
    this.resetNewCourse();
  }

  saveNewCourse(): void {
    if (!this.newCourse.title || !this.newCourse.level || !this.newCourse.tutorId) {
      this.formError = 'Please provide a title, level, and tutor ID.';
      return;
    }

    this.formError = '';
    this.isLoading = true;
    this.courseService.addCourse({
      ...this.newCourse,
      tutorId: Number(this.newCourse.tutorId)
    }).subscribe({
      next: (response) => {
        this.courses = [response.data, ...this.courses];
        this.isLoading = false;
        this.closeCreateModal();
      },
      error: () => {
        this.isLoading = false;
        this.formError = 'Failed to save the course. Please try again.';
      }
    });
  }

  private resetNewCourse(): void {
    this.newCourse = {
      title: '',
      description: '',
      level: 'A1',
      tutorId: 0
    };
  }

  private loadCourses(): void {
    this.isLoading = true;
    this.loadError = '';
    this.courseService.getAllCourses().subscribe({
      next: (response) => {
        this.courses = response.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Unable to load courses from the backend.';
      }
    });
  }
}
