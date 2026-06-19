import { X, UserPlus, UserMinus, ArrowRightLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { AssignedRole, Applicant } from '@/types';
import { cn } from '@/lib/utils';

interface SyncPreviewModalProps {
  open: boolean;
  onClose: () => void;
  currentRoles: AssignedRole[];
  newApplicants: Applicant[];
  onConfirmSync: () => void;
  game: { title: string; roles: string[]; playerCount: number };
}

export default function SyncPreviewModal({
  open,
  onClose,
  currentRoles,
  newApplicants,
  onConfirmSync,
  game,
}: SyncPreviewModalProps) {
  if (!open) return null;

  const currentIds = new Set(
    currentRoles.map((r) => r.applicantId).filter(Boolean) as string[]
  );
  const newIds = new Set(newApplicants.map((a) => a.id));

  const added = newApplicants.filter((a) => !currentIds.has(a.id));
  const removed = currentRoles.filter((r) => r.applicantId && !newIds.has(r.applicantId));

  const reordered: { name: string; oldPos: number; newPos: number }[] = [];
  const bothIds = currentRoles
    .map((r, i) => ({ id: r.applicantId, name: r.name, oldPos: i + 1 }))
    .filter((r) => r.id && newIds.has(r.id));
  const newPosMap = new Map(newApplicants.map((a, i) => [a.id, i + 1]));
  for (const entry of bothIds) {
    const newPos = newPosMap.get(entry.id!);
    if (newPos !== undefined && newPos !== entry.oldPos) {
      reordered.push({ name: entry.name, oldPos: entry.oldPos, newPos });
    }
  }

  const hasChanges = added.length > 0 || removed.length > 0 || reordered.length > 0;
  const countMismatch = newApplicants.length !== game.playerCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-midnight-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative glass-card w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            🔄 同步成员变更
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {countMismatch && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">人数不匹配</p>
                <p className="text-sm text-amber-200/80 mt-0.5">
                  当前正式车 {newApplicants.length} 人，需求 {game.playerCount} 人
                </p>
              </div>
            </div>
          )}

          {!hasChanges && (
            <div className="flex flex-col items-center gap-3 py-8">
              <CheckCircle2 size={40} className="text-emerald-400" />
              <p className="text-white/80 text-lg font-medium">✅ 无变化</p>
              <p className="text-white/50 text-sm">当前分工与正式车成员一致</p>
            </div>
          )}

          {added.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <UserPlus size={16} />
                新增成员（{added.length}）
              </h3>
              <div className="space-y-2">
                {added.map((a) => (
                  <div
                    key={a.id}
                    className="glass-card rounded-xl p-3 flex items-center gap-3 border-l-4 border-l-emerald-400"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-midnight-600 to-midnight-700 border border-white/10 flex items-center justify-center text-lg shadow-inner">
                      {a.avatar}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">{a.name}</span>
                      <span className="tag-pill bg-white/5 text-white/60 border border-white/10 text-xs">
                        {a.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {removed.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <UserMinus size={16} />
                移除成员（{removed.length}）
              </h3>
              <div className="space-y-2">
                {removed.map((r, idx) => (
                  <div
                    key={idx}
                    className="glass-card rounded-xl p-3 flex items-center gap-3 border-l-4 border-l-rose-400"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-midnight-600 to-midnight-700 border border-white/10 flex items-center justify-center text-lg shadow-inner">
                      {r.avatar}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">{r.name}</span>
                      <span className="tag-pill bg-indigo-500/15 text-indigo-300 border border-indigo-400/20 text-xs">
                        {r.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reordered.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                <ArrowRightLeft size={16} />
                顺序调整（{reordered.length}）
              </h3>
              <div className="space-y-2">
                {reordered.map((item, idx) => (
                  <div
                    key={idx}
                    className="glass-card rounded-xl p-3 flex items-center gap-3 border-l-4 border-l-blue-400"
                  >
                    <span className="text-white font-semibold text-sm">{item.name}</span>
                    <span className="text-white/40 text-xs">
                      原位置 {item.oldPos} → 新位置 {item.newPos}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
          <button onClick={onClose} className="btn-ghost">
            取消
          </button>
          <button
            onClick={onConfirmSync}
            disabled={newApplicants.length === 0}
            className={cn(
              'btn-primary',
              newApplicants.length === 0 && 'opacity-50 cursor-not-allowed'
            )}
          >
            🔄 确认同步
          </button>
        </div>
      </div>
    </div>
  );
}
