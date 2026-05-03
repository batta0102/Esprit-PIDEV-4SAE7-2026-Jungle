import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

export type PageStepKey = 'courses' | 'sessions' | 'bookings' | 'attendance' | 'my-bookings';

export interface PageStepperContext {
  courseId?: string | number | null;
  sessionId?: string | number | null;
  attendanceType?: 'ONLINE' | 'ONSITE' | null;
}

interface StepLinkConfig {
  commands: any[];
  queryParams?: Record<string, unknown> | null;
}

interface StepDef {
  key: PageStepKey;
  label: string;
  buildLink(ctx: PageStepperContext): StepLinkConfig;
}

@Component({
  selector: 'app-page-stepper',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './page-stepper.component.html',
  styleUrl: './page-stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageStepperComponent {
  private readonly router = inject(Router);

  @Input({ required: true }) currentStep!: PageStepKey;
  @Input() context: PageStepperContext = {};

  /** Optional position flag if parent wants to style differently. */
  @Input() position: 'top' | 'bottom' = 'bottom';

  readonly steps: StepDef[] = [
    {
      key: 'courses',
      label: 'Courses',
      buildLink: () => ({ commands: ['/back/courses'], queryParams: null })
    },
    {
      key: 'sessions',
      label: 'Sessions',
      buildLink: (ctx) => ({
        commands: ['/back/courses/sessions'],
        queryParams: ctx.courseId != null ? { courseId: String(ctx.courseId) } : null
      })
    },
    {
      key: 'bookings',
      label: 'Bookings',
      buildLink: (ctx) => {
        const qp: Record<string, unknown> = {};
        if (ctx.sessionId != null) {
          qp['sessionId'] = String(ctx.sessionId);
        } else if (ctx.courseId != null) {
          qp['courseId'] = String(ctx.courseId);
        }
        return { commands: ['/back/courses/bookings'], queryParams: Object.keys(qp).length ? qp : null };
      }
    },
    {
      key: 'attendance',
      label: 'Attendance',
      buildLink: (ctx) => {
        const qp: Record<string, unknown> = {};
        if (ctx.sessionId != null) qp['id'] = String(ctx.sessionId);
        if (ctx.attendanceType != null) qp['type'] = ctx.attendanceType;
        return { commands: ['/back/attendance'], queryParams: Object.keys(qp).length ? qp : null };
      }
    },
    {
      key: 'my-bookings',
      label: 'My bookings',
      buildLink: () => ({ commands: ['/front/bookings'], queryParams: null })
    }
  ];

  readonly currentIndex = computed(() =>
    this.steps.findIndex((s) => s.key === this.currentStep)
  );

  readonly canGoPrev = computed(() => this.currentIndex() > 0);
  readonly canGoNext = computed(() => {
    const idx = this.currentIndex();
    return idx >= 0 && idx < this.steps.length - 1;
  });

  goTo(step: StepDef): void {
    const link = step.buildLink(this.context ?? {});
    this.router.navigate(link.commands, {
      queryParams: link.queryParams ?? undefined
    });
  }

  goPrev(): void {
    if (!this.canGoPrev()) return;
    const target = this.steps[this.currentIndex() - 1];
    this.goTo(target);
  }

  goNext(): void {
    if (!this.canGoNext()) return;
    const target = this.steps[this.currentIndex() + 1];
    this.goTo(target);
  }
}

