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

export interface RoleFitReason {
  text: string;
  score: number;
}

export interface RoleFitResult {
  score: number;
  reasons: RoleFitReason[];
}

export function calcRoleFitScore(applicant: Applicant, game: GameScript, allOfficial: Applicant[] = []): RoleFitResult {
  let score = 0;
  const reasons: RoleFitReason[] = [];

  if (applicant.budgetLimit >= game.budget) {
    score += 25;
    reasons.push({ text: '预算充足', score: 25 });
  } else {
    score -= 10;
    reasons.push({ text: '预算略紧', score: -10 });
  }

  if (applicant.hasCrossCityExp) {
    score += 20;
    reasons.push({ text: '有跨城经验', score: 20 });
  } else {
    score -= 5;
  }

  if (applicant.canDoReviewRecord) {
    score += 15;
    reasons.push({ text: '可担任复盘记录', score: 15 });
  }

  const isRoadTrip = game.transport.includes('大巴') || game.transport.includes('自驾');
  if (!applicant.getCarSick) {
    const bonus = isRoadTrip ? 15 : 5;
    score += bonus;
    if (isRoadTrip) reasons.push({ text: '不晕车（公路出行加分）', score: bonus });
  } else if (isRoadTrip) {
    score -= 10;
    reasons.push({ text: '晕车（公路出行减分）', score: -10 });
  }

  if (applicant.preferredRole) {
    const officialRoles = new Set(allOfficial.map(a => a.preferredRole));
    if (!officialRoles.has(applicant.preferredRole)) {
      score += 15;
      reasons.push({ text: '角色无冲突', score: 15 });
    } else {
      score += 5;
      reasons.push({ text: '有角色偏好', score: 5 });
    }
  }

  if (applicant.acquaintedWithHost) {
    score += 10;
    reasons.push({ text: '熟人优先', score: 10 });
  }

  if (!applicant.hasFlakedBefore) {
    score += 20;
    reasons.push({ text: '无鸽车记录', score: 20 });
  } else {
    score -= 25;
    reasons.push({ text: '有鸽车记录', score: -25 });
  }

  const gradeIdx = GRADES.indexOf(applicant.grade);
  if (gradeIdx >= 4) {
    score += 5;
  } else if (gradeIdx >= 2) {
    score += 2;
  }

  return { score: Math.max(0, Math.round(score)), reasons };
}

export function isNegativeReason(text: string): boolean {
  return /减|略紧|冲突|晕车/.test(text);
}
