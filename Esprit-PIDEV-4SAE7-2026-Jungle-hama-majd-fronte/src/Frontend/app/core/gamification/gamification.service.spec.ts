import { TestBed } from '@angular/core/testing';

import { GamificationService } from './gamification.service';

describe('GamificationService', () => {
  let service: GamificationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(GamificationService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should expose leaderboard entries', () => {
    const entries = service.leaderboard('week');

    expect(entries.length).toBeGreaterThan(0);
    expect(entries.some((entry) => entry.id === 'you')).toBe(true);
  });

  it('should return challenge progress', () => {
    const challenge = service.challenges()[0];
    const progress = service.getChallengeProgress(challenge.id);

    expect(progress.total).toBeGreaterThan(0);
    expect(progress.percent).toBe(0);
  });

  it('should complete unlocked task and increase xp', () => {
    const challenge = service.challenges()[0];
    const section = challenge.sections[0];
    const task = section.tasks[0];

    const events = service.completeTask(challenge.id, section.id, task.id);

    expect(events.length).toBeGreaterThan(0);
    expect(service.isTaskComplete(challenge.id, section.id, task.id)).toBe(true);
    expect(service.xp()).toBeGreaterThan(0);
  });

  it('should return empty events for unknown task', () => {
    const events = service.completeTask('x', 'y', 'z');
    expect(events).toEqual([]);
  });

  it('should return achievements snapshot', () => {
    const achievements = service.getAchievements();

    expect(achievements.length).toBe(4);
    expect(achievements[0].name).toContain('Task');
  });
});
