import { X, Users, MapPin, Wallet, AlertTriangle, CheckCircle2, Calendar } from 'lucide-react';
import type { GameScript, Applicant } from '@/types';
import { cn } from '@/lib/utils';

interface ConfirmGroupPreviewProps {
  open: boolean;
  onClose: () => void;
  game: GameScript;
  applicants: Applicant[];
  onConfirm: () => void;
}

const DUTIES = ['车头·总协调', '财务·预算AA', '复盘记录员', '摄影·物料', '副驾·安全', '后勤·餐饮', '外联·店铺'];

const DUTY_COLORS: Record<string, string> = {
  '车头·总协调': 'border-l-amber-400',
  '财务·预算AA': 'border-l-emerald-400',
  '复盘记录员': 'border-l-indigo-400',
  '摄影·物料': 'border-l-purple-400',
  '副驾·安全': 'border-l-cyan-400',
  '后勤·餐饮': 'border-l-rose-400',
  '外联·店铺': 'border-l-pink-400',
};

export default function ConfirmGroupPreview({
  open,
  onClose,
  game,
  applicants,
  onConfirm,
}: ConfirmGroupPreviewProps) {
  if (!open) return null;

  const shortage = game.playerCount - applicants.length;
  const isShort = shortage > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-midnight-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            🎬 成团预览
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="glass-card p-4 space-y-3">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={18} className="text-amber-400" />
              {game.title}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 text-white/80">
                <MapPin size={15} className="text-emerald-400 shrink-0" />
                <span className="truncate">{game.destinationCity}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Wallet size={15} className="text-amber-400 shrink-0" />
                <span>￥{game.budget}/人</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Users size={15} className="text-indigo-400 shrink-0" />
                <span>
                  {applicants.length}
                  <span className="text-white/40">/{game.playerCount}人</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/80 col-span-2 sm:col-span-3">
                <Calendar size={15} className="text-cyan-400 shrink-0" />
                <span>{game.departureDate} 出发 · {game.returnTime} 返程</span>
              </div>
            </div>
          </div>

          {isShort && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">人数不足</p>
                <p className="text-sm text-amber-200/80 mt-0.5">
                  还差 {shortage} 人，确定要生成？
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="section-title flex items-center gap-2.5 text-lg">
              <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
              分工表
            </h3>

            <div className="space-y-2">
              {applicants.map((applicant, idx) => {
                const duty = DUTIES[idx % DUTIES.length];
                const role = applicant.preferredRole || game.roles[idx % game.roles.length] || '成员';
                const accentBorder = DUTY_COLORS[duty] || 'border-l-indigo-400';

                return (
                  <div
                    key={applicant.id}
                    className={cn(
                      'glass-card rounded-xl p-4 flex items-center gap-4 border-l-4',
                      accentBorder
                    )}
                  >
                    <div className="relative">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-midnight-600 to-midnight-700 border border-white/10 flex items-center justify-center text-xl shadow-inner">
                        {applicant.avatar}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-midnight-900 shadow">
                        {idx + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold">{applicant.name}</span>
                        <span className="tag-pill bg-white/5 text-white/60 border border-white/10 text-xs">
                          {applicant.grade}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="tag-pill bg-indigo-500/15 text-indigo-300 border border-indigo-400/20 text-xs">
                          {role}
                        </span>
                        <span className="text-white/70 text-sm font-medium">
                          {duty}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
          <button onClick={onClose} className="btn-ghost">
            继续调整
          </button>
          <button
            onClick={onConfirm}
            disabled={isShort}
            className="btn-primary"
          >
            ✨ 确认成团
          </button>
        </div>
      </div>
    </div>
  );
}
