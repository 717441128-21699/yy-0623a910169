import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Applicant, GameScript } from '../../types';
import { cn } from '../../lib/utils';
import SortableApplicantCard from './SortableApplicantCard';

interface DragColumnProps {
  id: string;
  title: string;
  applicants: Applicant[];
  capacity?: number;
  game?: GameScript;
  officialApps?: Applicant[];
}

const columnStyles: Record<string, { border: string; badge: string; glow: string }> = {
  official: {
    border: 'border-amber-450/50',
    badge: 'bg-amber-450 text-midnight-900',
    glow: 'shadow-glow-amber/15',
  },
  standby: {
    border: 'border-indigo-400/50',
    badge: 'bg-indigo-500 text-white',
    glow: 'shadow-glow-purple',
  },
  next: {
    border: 'border-slate-400/30',
    badge: 'bg-slate-500 text-white',
    glow: '',
  },
  pending: {
    border: 'border-white/10',
    badge: 'bg-white/20 text-white',
    glow: '',
  },
};

export default function DragColumn({ id, title, applicants, capacity, game, officialApps }: DragColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'column', status: id },
  });

  const style = columnStyles[id] || columnStyles.pending;
  const isFull = capacity !== undefined && applicants.length >= capacity;
  const isOverCapacity = capacity !== undefined && applicants.length > capacity;

  return (
    <div
      className={cn(
        'glass-card flex flex-col h-full min-h-[400px] transition-all duration-300',
        style.border,
        style.glow,
        isOver && 'ring-2 ring-white/30 scale-[1.01]'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="font-serif font-bold text-lg text-white">{title}</h3>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center justify-center min-w-[2rem] h-7 px-2 rounded-full text-sm font-bold',
              style.badge,
              isOverCapacity && 'bg-red-500 animate-pulse'
            )}
          >
            {applicants.length}
          </span>
          {capacity !== undefined && (
            <span className="text-sm text-white/40">/ {capacity}</span>
          )}
        </div>
      </div>

      {capacity !== undefined && (
        <div className="px-4 pt-3">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isFull ? 'bg-amber-450 shadow-glow-amber/50' : isOverCapacity ? 'bg-red-500' : 'bg-indigo-400/60'
              )}
              style={{ width: `${Math.min((applicants.length / capacity) * 100, 100)}%` }}
            />
          </div>
          {isFull && (
            <p className="text-xs text-amber-400/80 mt-1.5 text-center font-medium">
              ✨ 已满员
            </p>
          )}
          {isOverCapacity && (
            <p className="text-xs text-red-400 mt-1.5 text-center font-medium">
              ⚠️ 超出容量，请移除多余成员
            </p>
          )}
        </div>
      )}

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-3 space-y-3 overflow-y-auto',
          isOver && 'bg-white/5 rounded-b-2xl'
        )}
      >
        <SortableContext items={applicants.map(a => a.id)} strategy={verticalListSortingStrategy}>
          {applicants.map(applicant => (
            <SortableApplicantCard key={applicant.id} applicant={applicant} game={game} officialApps={officialApps} />
          ))}
        </SortableContext>

        {applicants.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-white/30">
            <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-sm">拖拽申请者到此处</p>
          </div>
        )}
      </div>
    </div>
  );
}
