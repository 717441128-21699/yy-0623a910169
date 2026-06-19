import { Search, MapPin, CalendarDays, SlidersHorizontal } from 'lucide-react';
import { SCRIPT_TYPES } from '@/types';

export default function ScriptFilter() {
  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            placeholder="搜索剧本名称、类型..."
            className="form-input pl-11"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
          <button className="form-input flex items-center gap-2 text-left w-full sm:w-auto sm:min-w-[180px]">
            <MapPin size={16} className="text-amber-450 flex-shrink-0" />
            <span className="text-white/70">选择城市</span>
            <span className="ml-auto text-white/30">▾</span>
          </button>

          <button className="form-input flex items-center gap-2 text-left w-full sm:w-auto sm:min-w-[200px]">
            <CalendarDays size={16} className="text-amber-450 flex-shrink-0" />
            <span className="text-white/70">选择日期范围</span>
            <span className="ml-auto text-white/30">▾</span>
          </button>

          <button className="btn-ghost justify-center w-full sm:w-auto">
            <SlidersHorizontal size={18} />
            更多筛选
          </button>
        </div>
      </div>

      <div className="divider-line" />

      <div className="flex flex-wrap gap-2">
        {SCRIPT_TYPES.map((type, index) => (
          <button
            key={type}
            className={`chip-option ${index === 0 ? 'active' : ''}`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}
