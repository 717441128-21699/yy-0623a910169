import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Applicant } from '../../types';
import { cn } from '../../lib/utils';
import { ApplicantCardContent } from './ApplicantCard';

interface SortableApplicantCardProps {
  applicant: Applicant;
}

export default function SortableApplicantCard({ applicant }: SortableApplicantCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: applicant.id,
    data: { type: 'applicant', status: applicant.status },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
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
        'hover:-translate-y-0.5 hover:shadow-glow-amber/20 hover:border-amber-450/30',
        isDragging && 'z-50 shadow-glow-amber border-amber-450/50 scale-105'
      )}
    >
      <ApplicantCardContent applicant={applicant} />
    </div>
  );
}
