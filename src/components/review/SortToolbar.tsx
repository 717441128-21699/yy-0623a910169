import type { SortKey } from '../../types';
import { cn } from '../../lib/utils';

interface SortToolbarProps {
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
}

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'matchScore', label: '匹配度' },
  { key: 'grade', label: '年级' },
  { key: 'acquainted', label: '熟人' },
  { key: 'noFlake', label: '无鸽记录' },
  { key: 'role', label: '角色合适' },
];

export default function SortToolbar({ sortKey, onSortChange }: SortToolbarProps) {
  return (
    <div className="glass-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-white/60 mr-2">排序方式：</span>
        {sortOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onSortChange(opt.key)}
            className={cn(
              'chip-option',
              sortKey === opt.key && 'active'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
