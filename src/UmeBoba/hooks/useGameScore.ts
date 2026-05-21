// Re-export the canonical hook from @shared/leaderboard so existing imports
// (./hooks/useGameScore) keep working without the per-component change.
export { useGameScore } from '@shared/leaderboard';
export type { LeaderboardEntry } from '@shared/leaderboard';
