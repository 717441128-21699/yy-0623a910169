import type { Applicant, GameScript } from '../types';

type MatchScoreInput = Pick<
  Applicant,
  | 'hasCrossCityExp'
  | 'budgetLimit'
  | 'canDoReviewRecord'
  | 'getCarSick'
  | 'acquaintedWithHost'
  | 'hasFlakedBefore'
>;

export function calcMatchScore(applicant: MatchScoreInput, game: GameScript): number {
  let score = 50;
  if (applicant.hasCrossCityExp) score += 15;
  if (applicant.budgetLimit >= game.budget) score += 15;
  if (applicant.canDoReviewRecord) score += 10;
  if (!applicant.getCarSick) score += 5;
  if (applicant.acquaintedWithHost) score += 10;
  if (applicant.hasFlakedBefore) score -= 20;
  return Math.max(0, Math.min(100, Math.round(score)));
}
