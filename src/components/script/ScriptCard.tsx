import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Star, ClipboardList, ChevronRight } from 'lucide-react';
import type { GameScript } from '@/types';

interface ScriptCardProps {
  game: GameScript;
  applicantCount: number;
}

const statusConfig = {
  recruiting: { label: '招募中', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  reviewing: { label: '审核中', className: 'bg-amber-450/20 text-amber-450 border-amber-450/30' },
  confirmed: { label: '已成团', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
};

export default function ScriptCard({ game, applicantCount }: ScriptCardProps) {
  const progress = Math.min(100, Math.round((applicantCount / game.playerCount) * 100));
  const detailPath =
    game.status === 'reviewing' || game.status === 'confirmed'
      ? `/review/${game.id}`
      : `/script/${game.id}`;
  const status = statusConfig[game.status];

  return (
    <div className="glass-card-hover overflow-hidden flex flex-col md:flex-row gap-0">
      <div className="relative md:w-56 flex-shrink-0 aspect-[3/4] md:aspect-auto overflow-hidden rounded-2xl md:rounded-none md:rounded-l-2xl">
        <img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <span className={`tag-pill border ${status.className}`}>{status.label}</span>
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-serif text-xl font-bold text-white line-clamp-2">
              {game.title}
            </h3>
            <div className="flex gap-1 flex-shrink-0">
              {game.type.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="tag-pill bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < game.difficulty
                    ? 'text-amber-450 fill-amber-450'
                    : 'text-white/20'
                }
              />
            ))}
            <span className="ml-2 text-xs text-white/50">
              {game.difficulty}/5 难度
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-white/70">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-amber-450" />
              <span>{game.departureDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-amber-450" />
              <span>{game.destinationCity}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-amber-450" />
              <span>
                {applicantCount}/{game.playerCount}人
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="tag-pill bg-amber-450/20 text-amber-450 border border-amber-450/30 font-semibold">
              AA￥{game.budget}
            </span>
            <span className="tag-pill bg-midnight-600/60 text-white/70 border border-white/10">
              {game.transport}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-white/50">
              <span>招募进度</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-midnight-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-450 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <Link
            to={detailPath}
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-450 hover:text-amber-400 transition-colors"
          >
            查看详情
            <ChevronRight size={16} />
          </Link>

          {game.status === 'confirmed' && (
            <Link
              to={`/checklist/${game.id}`}
              className="btn-primary text-sm py-2 px-4"
            >
              <ClipboardList size={16} />
              出行清单
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
