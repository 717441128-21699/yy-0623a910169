import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function DifficultyStars({ difficulty }: { difficulty: number }) {
  const full = Math.floor(difficulty);
  const hasHalf = difficulty % 1 >= 0.5;
  const stars = [];
  for (let i = 0; i < full; i++) {
    stars.push(<Star key={`f${i}`} className="w-4 h-4 fill-amber-450 text-amber-450" />);
  }
  if (hasHalf) {
    stars.push(<StarHalf key="h" className="w-4 h-4 fill-amber-450 text-amber-450" />);
  }
  const empty = 5 - full - (hasHalf ? 1 : 0);
  for (let i = 0; i < empty; i++) {
    stars.push(<Star key={`e${i}`} className="w-4 h-4 text-white/30" />);
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

export function TypeTag({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    '硬核推理': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    '情感沉浸': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    '恐怖惊悚': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    '机制阵营': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    '欢乐撕逼': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    '古风历史': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    '科幻变格': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    '都市还原': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };
  const classes = colorMap[type] || 'bg-white/10 text-white/70 border-white/20';
  return (
    <span className={cn('tag-pill border', classes)}>
      {type}
    </span>
  );
}

export function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-450/15 flex items-center justify-center text-amber-450 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs text-white/50 mb-0.5">{label}</div>
        <div className="text-sm text-white/90 font-medium leading-snug">{value}</div>
      </div>
    </div>
  );
}

export function RoleChip({ role }: { role: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-midnight-800/70 border border-white/10">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/60 to-purple-600/60 flex items-center justify-center text-lg shadow-inner">
        🎭
      </div>
      <span className="text-sm text-white/85 font-medium truncate">{role}</span>
    </div>
  );
}

export function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  const isFull = current >= total;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-white/70">报名进度</span>
        <span className={cn('text-sm font-bold', isFull ? 'text-rose-400' : 'text-amber-450')}>
          {current} / {total} 人
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-midnight-900/60 border border-white/5 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            isFull
              ? 'bg-gradient-to-r from-rose-500 to-rose-400'
              : 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isFull && (
        <div className="mt-1.5 text-xs text-rose-400 font-medium">
          ⚠️ 名额已满，仅接受候补报名
        </div>
      )}
    </div>
  );
}

export function SectionTitle({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {icon && <div className="text-amber-450">{icon}</div>}
      <h3 className="font-serif text-xl font-bold text-white tracking-wide">{children}</h3>
    </div>
  );
}

export function AvatarChip({
  emoji,
  selected,
  onClick,
}: {
  emoji: string;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-14 h-14 rounded-2xl text-3xl flex items-center justify-center transition-all duration-200 border',
        selected
          ? 'bg-amber-450 border-amber-450 shadow-glow-amber/60 scale-105'
          : 'bg-midnight-800/70 border-white/10 hover:border-amber-450/50 hover:bg-amber-450/10 active:scale-95'
      )}
    >
      {emoji}
    </button>
  );
}

export function FormSection({
  title,
  step,
  children,
  last,
}: {
  title: string;
  step: number;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-450 to-amber-500 flex items-center justify-center text-midnight-900 text-sm font-bold shadow-glow-amber">
          {step}
        </div>
        <h3 className="font-serif text-lg font-bold text-white">{title}</h3>
      </div>
      <div className="pl-11">{children}</div>
      {!last && <div className="divider-line mt-6" />}
    </div>
  );
}

export function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'chip-option',
        active && 'active'
      )}
    >
      {label}
    </button>
  );
}
