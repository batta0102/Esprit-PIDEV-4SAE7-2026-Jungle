import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('12345678-aaaa-bbbb-cccc-123456789000');
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should return undefined for unknown event', () => {
    expect(service.getEventById('missing')).toBeUndefined();
  });

  it('should update section completion state', () => {
    service.setSectionComplete('t1', 'c1', 's1', true);

    expect(service.isSectionComplete('t1', 'c1', 's1')).toBe(true);
  });

  it('should add training chapter', () => {
    const initial = service.trainings()[0];
    const originalCount = initial.chapters.length;

    service.addTrainingChapter(initial.id, 'New Chapter');

    const updated = service.getTrainingById(initial.id);
    expect(updated?.chapters.length).toBe(originalCount + 1);
    expect(updated?.chapters[originalCount].id).toContain('ch-12345678');
  });

  it('should add training section', () => {
    const training = service.trainings()[0];
    const chapter = training.chapters[0];
    const initialCount = chapter.sections.length;

    service.addTrainingSection(training.id, chapter.id, 'Section A', 'Objective', ['video']);

    const updated = service.getTrainingById(training.id);
    const updatedChapter = updated?.chapters.find((c) => c.id === chapter.id);
    expect(updatedChapter?.sections.length).toBe(initialCount + 1);
    expect(updatedChapter?.sections[initialCount].id).toContain('s-12345678');
  });
});
