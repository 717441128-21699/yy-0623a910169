import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Info } from 'lucide-react';
import type { Applicant, GameScript } from '../../types';
import { cn } from '../../lib/utils';
import { calcRoleFitScore, isNegativeReason, type RoleFitResult, type RoleFitReason } from '../../utils/matchScore';

interface ApplicantCardProps {
  applicant: Applicant;
  game?: GameScript;
  officialApps?: Applicant[];
}

function MatchScoreRing({ score }: { score: number }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 85 ? '#22c55e' : score >= 65 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-sm font-bold"
          style={{ color }}
        >
          {score}
        </span>
      </div>
    </div>
  );
}

export function formatScoreDelta(score: number): string {
  return score > 0 ? `+${score}` : `${score}`;
}

export function getScoreColor(score: number): string {
  return score >= 0 ? 'text-emerald-400' : 'text-rose-400';
}

export function ReasonPill({ reason }: { reason: RoleFitReason }) {
  const negative = isNegativeReason(reason.text);
  return (
    <span
      className={cn(
        'tag-pill inline-flex items-center gap-1',
        negative
          ? 'bg-rose-500/15 text-rose-300 border border-rose-400/30'
          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
      )}
    >
      <span>{reason.text}</span>
      <span className={cn('font-semibold text-xs', getScoreColor(reason.score))}>
        {formatScoreDelta(reason.score)}
      </span>
    </span>
  );
}

interface ApplicantCardContentProps {
  applicant: Applicant;
  game?: GameScript;
  officialApps?: Applicant[];
}

export function ApplicantCardContent({ applicant, game, officialApps }: ApplicantCardContentProps) {
  const [expanded, setExpanded] = useState(false);

  const roleFit: RoleFitResult | null = game
    ? calcRoleFitScore(applicant, game, officialApps || [])
    : null;

  return (
    <>
      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-3xl shrink-0 border border-white/10">
          {applicant.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4 className="font-semibold text-white text-base truncate">{applicant.name}</h4>
            <span className="tag-pill bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              {applicant.grade}
            </span>
          </div>
          <p className="text-sm text-white/50 truncate">{applicant.major}</p>
        </div>
        <div className="flex items-center gap-1">
          {game && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(v => !v);
              }}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0',
                expanded
                  ? 'bg-amber-450/25 text-amber-300 border border-amber-450/40'
                  : 'hover:bg-white/10 text-white/40 hover:text-white/70 border border-transparent'
              )}
            >
              <Info className="w-4 h-4" />
            </button>
          )}
          <MatchScoreRing score={applicant.matchScore} />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {applicant.hasCrossCityExp && (
          <span className="tag-pill bg-emerald-500/15 text-emerald-400 border border-emerald-400/30">
            跨城经验
          </span>
        )}
        {applicant.canDoReviewRecord && (
          <span className="tag-pill bg-purple-500/15 text-purple-300 border border-purple-400/30">
            复盘记录员
          </span>
        )}
        {!applicant.getCarSick && (
          <span className="tag-pill bg-slate-500/15 text-slate-300 border border-slate-400/30">
            不晕车
          </span>
        )}
        {applicant.acquaintedWithHost && (
          <span className="tag-pill bg-amber-500/15 text-amber-300 border border-amber-400/30">
            熟人
          </span>
        )}
        {applicant.hasFlakedBefore && (
          <span className="tag-pill bg-red-500/15 text-red-400 border border-red-400/30">
            鸽过
          </span>
        )}
      </div>

      {applicant.preferredRole && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-xs text-white/40">
            意向角色：<span className="text-white/70 font-medium">{applicant.preferredRole}</span>
          </p>
        </div>
      )}

      {expanded && roleFit && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/60 font-medium">角色适配度</span>
            <span
              className={cn(
                'text-3xl font-bold tabular-nums',
                roleFit.score >= 85 ? 'text-emerald-400' : roleFit.score >= 55 ? 'text-amber-400' : 'text-rose-400'
              )}
            >
              {roleFit.score}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {roleFit.reasons.map((r, i) => (
              <ReasonPill key={i} reason={r} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function ApplicantCard({ applicant, game, officialApps }: ApplicantCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: applicant.id,
    data: { type: 'applicant', status: applicant.status },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'glass-card p-4 cursor-grab active:cursor-grabbing select-none',
        'transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-glow-amber hover:border-amber-450/30',
        isDragging && 'z-50 shadow-glow-amber border-amber-450/50 scale-105'
      )}
    >
      <ApplicantCardContent applicant={applicant} game={game} officialApps={officialApps} />
    </div>
  );
}
