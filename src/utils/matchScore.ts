import type { Applicant, GameScript } from '../types';
import { GRADES } from '../types';

export function calcMatchScore(applicant: Pick<Applicant, 'hasCrossCityExp' | 'budgetLimit' | 'canDoReviewRecord' | 'getCarSick' | 'acquaintedWithHost' | 'hasFlakedBefore'>, game: GameScript): number {
  let score = 50;
  if (applicant.hasCrossCityExp) score += 15;
  if (applicant.budgetLimit >= game.budget) score += 15;
  if (applicant.canDoReviewRecord) score += 10;
  if (!applicant.getCarSick) score += 5;
  if (applicant.acquaintedWithHost) score += 10;
  if (applicant.hasFlakedBefore) score -= 20;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export interface RoleFitResult {
  score: number;
  reasons: string[];
}

export function calcRoleFitScore(applicant: Applicant, game: GameScript, allOfficial: Applicant[] = []): RoleFitResult {
  let score = 0;
  const reasons: string[] = [];

  if (applicant.budgetLimit >= game.budget) {
    score += 25;
    reasons.push('预算充足');
  } else {
    score -= 10;
    reasons.push('预算略紧');
  }

  if (applicant.hasCrossCityExp) {
    score += 20;
    reasons.push('有跨城经验');
  } else {
    score -= 5;
  }

  if (applicant.canDoReviewRecord) {
    score += 15;
    reasons.push('可担任复盘记录');
  }

  const isRoadTrip = game.transport.includes('大巴') || game.transport.includes('自驾');
  if (!applicant.getCarSick) {
    score += isRoadTrip ? 15 : 5;
    if (isRoadTrip) reasons.push('不晕车（公路出行加分）');
  } else if (isRoadTrip) {
    score -= 10;
    reasons.push('晕车（公路出行减分）');
  }

  if (applicant.preferredRole) {
    const officialRoles = new Set(allOfficial.map(a => a.preferredRole));
    if (!officialRoles.has(applicant.preferredRole)) {
      score += 15;
      reasons.push('角色无冲突');
    } else {
      score += 5;
      reasons.push('有角色偏好');
    }
  }

  if (applicant.acquaintedWithHost) {
    score += 10;
    reasons.push('熟人优先');
  }

  if (!applicant.hasFlakedBefore) {
    score += 20;
    reasons.push('无鸽车记录');
  } else {
    score -= 25;
    reasons.push('有鸽车记录');
  }

  const gradeIdx = GRADES.indexOf(applicant.grade);
  if (gradeIdx >= 4) {
    score += 5;
  } else if (gradeIdx >= 2) {
    score += 2;
  }

  return { score: Math.max(0, Math.round(score)), reasons };
}
