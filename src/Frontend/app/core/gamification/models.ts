/**
 * Difficulty levels for challenges
 */
export type Difficulty = 'Beginner' | 'Intermediate' | 'Expert';

/**
 * Represents a single task within a challenge section
 */
export interface ChallengeTask {
  id: string;
  label: string;
  xp: number;
}

/**
 * Represents a section within a challenge containing multiple tasks
 */
export interface ChallengeSection {
  id: string;
  title: string;
  tasks: ChallengeTask[];
}

/**
 * Represents a complete challenge with sections and tasks
 */
export interface ChallengeModel {
  id: string;
  name: string;
  difficulty: Difficulty;
  rewardBadgeId?: string;
  sections: ChallengeSection[];
}

/**
 * Represents a badge that can be earned
 */
export interface BadgeModel {
  id: string;
  name: string;
  description: string;
}

/**
 * Represents an achievement with progress tracking
 */
export interface AchievementModel {
  id: string;
  name: string;
  description: string;
  current: number;
  goal: number;
}

/**
 * Time periods for leaderboard filtering
 */
export type LeaderboardPeriod = 'week' | 'month' | 'all';

/**
 * Represents a single entry in the leaderboard
 */
export interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  completedChallenges: number;
  badges: number;
}

/**
 * Union type for all possible gamification events
 */
export type GamificationEvent =
  | { type: 'xp'; delta: number }
  | { type: 'levelUp'; level: number }
  | { type: 'badgeEarned'; badgeId: string }
  | { type: 'challengeCompleted'; challengeId: string };
