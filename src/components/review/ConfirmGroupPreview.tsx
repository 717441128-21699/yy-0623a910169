import { useState, useMemo, useEffect } from 'react';
import {
  X, Users, MapPin, Wallet, AlertTriangle, CheckCircle2, Calendar,
  Save, ArrowLeft, Sparkles,
} from 'lucide-react';
import type { GameScript, Applicant, AssignedRole, GroupDraft } from '@/types';
import { cn } from '@/lib/utils';

interface ConfirmGroupPreviewProps {
  open: boolean;
  onClose: () => void;
  game: GameScript;
  applicants: Applicant[];
  allApplicants: Applicant[];
  previousDraft?: GroupDraft;
  onSaveDraft: (roles: AssignedRole[]) => void;
  onConfirm: (roles: AssignedRole[]) => void;
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

function buildAssignedRoles(applicants: Applicant[], game: GameScript): AssignedRole[] {
  return applicants.map((a, idx) => ({
    name: a.name,
    role: a.preferredRole || game.roles[idx % game.roles.length] || '成员',
    duty: DUTIES[idx % DUTIES.length],
    avatar: a.avatar,
    applicantId: a.id,
  }));
}

type DiffItem =
  | { type: 'added'; name: string; avatar: string }
  | { type: 'movedOut'; name: string; avatar: string; targetStatus: string; role: string; duty: string }
  | { type: 'changed'; name: string; avatar: string; field: 'role' | 'duty' | 'both'; oldRole: string; newRole: string; oldDuty: string; newDuty: string };

function computeDiff(current: AssignedRole[], previous: AssignedRole[], allApplicants: Applicant[]): DiffItem[] {
  const currMap = new Map(current.map(r => [r.applicantId, r]));
  const prevMap = new Map(previous.map(r => [r.applicantId, r]));
  const appMap = new Map(allApplicants.map(a => [a.id, a]));
  const diffs: DiffItem[] = [];

  const statusLabel: Record<string, string> = {
    pending: '待审核',
    standby: '候补车',
    next: '下次优先',
  };

  for (const [id, r] of currMap) {
    if (!prevMap.has(id)) {
      diffs.push({ type: 'added', name: r.name, avatar: r.avatar });
    }
  }

  for (const [id, r] of prevMap) {
    if (!currMap.has(id)) {
      const app = appMap.get(id || '');
      const targetStatus = app ? (statusLabel[app.status] || '已移除') : '已移除';
      diffs.push({ type: 'movedOut', name: r.name, avatar: r.avatar, targetStatus, role: r.role, duty: r.duty });
    }
  }

  for (const [id, r] of currMap) {
    const prev = prevMap.get(id);
    if (!prev) continue;
    const roleChanged = prev.role !== r.role;
    const dutyChanged = prev.duty !== r.duty;
    if (roleChanged || dutyChanged) {
      diffs.push({
        type: 'changed',
        name: r.name,
        avatar: r.avatar,
        field: roleChanged && dutyChanged ? 'both' : roleChanged ? 'role' : 'duty',
        oldRole: prev.role,
        newRole: r.role,
        oldDuty: prev.duty,
        newDuty: r.duty,
      });
    }
  }

  return diffs;
}

export default function ConfirmGroupPreview({
  open,
  onClose,
  game,
  applicants,
  allApplicants,
  previousDraft,
  onSaveDraft,
  onConfirm,
}: ConfirmGroupPreviewProps) {
  const [assignedRoles, setAssignedRoles] = useState<AssignedRole[]>(
    () => buildAssignedRoles(applicants, game),
  );

  const shortage = game.playerCount - applicants.length;
  const isShort = shortage > 0;

  const roleConflicts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of assignedRoles) {
      if (r.role === '成员') continue;
      counts.set(r.role, (counts.get(r.role) || 0) + 1);
    }
    const conflicted = new Set<string>();
    for (const [role, count] of counts) {
      if (count > 1) conflicted.add(role);
    }
    return conflicted;
  }, [assignedRoles]);

  const warnings = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const a of applicants) {
      const w: string[] = [];
      if (a.budgetLimit < game.budget) w.push('预算不足');
      if (!a.hasCrossCityExp) w.push('无跨城经验');
      map.set(a.id, w);
    }
    return map;
  }, [applicants, game.budget]);

  const draftDiff = useMemo(() => {
    if (!previousDraft) return null;
    return computeDiff(assignedRoles, previousDraft.assignedRoles, allApplicants);
  }, [assignedRoles, previousDraft, allApplicants]);

  function updateRole(index: number, newRole: string) {
    setAssignedRoles(prev => {
      const next = [...prev];
      next[index] = { ...next[index], role: newRole };
      return next;
    });
  }

  function updateDuty(index: number, newDuty: string) {
    setAssignedRoles(prev => {
      const next = [...prev];
      next[index] = { ...next[index], duty: newDuty };
      return next;
    });
  }

  if (!open) return null;

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
                  还差 {shortage} 人，确认成团后将按当前人数生成
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
                const assigned = assignedRoles[idx];
                if (!assigned) return null;

                const accentBorder = DUTY_COLORS[assigned.duty] || 'border-l-indigo-400';
                const hasRoleConflict = roleConflicts.has(assigned.role);
                const memberWarnings = warnings.get(applicant.id) || [];

                return (
                  <div
                    key={applicant.id}
                    className={cn(
                      'glass-card rounded-xl p-4 flex items-center gap-4 border-l-4',
                      accentBorder,
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
                        <select
                          value={assigned.role}
                          onChange={e => updateRole(idx, e.target.value)}
                          className="bg-midnight-800 border border-white/15 rounded-lg px-2 py-1 text-sm text-white/90 focus:border-amber-450/50 focus:outline-none"
                        >
                          {game.roles.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                          <option value="成员">成员</option>
                        </select>

                        <select
                          value={assigned.duty}
                          onChange={e => updateDuty(idx, e.target.value)}
                          className="bg-midnight-800 border border-white/15 rounded-lg px-2 py-1 text-sm text-white/90 focus:border-amber-450/50 focus:outline-none"
                        >
                          {DUTIES.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {(hasRoleConflict || memberWarnings.length > 0) && (
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {hasRoleConflict && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/15 text-red-300">
                            🔴 角色撞车
                          </span>
                        )}
                        {memberWarnings.map(w => (
                          <span
                            key={w}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300"
                          >
                            🟡 {w}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {previousDraft && (
            <div className="space-y-3">
              <h3 className="section-title flex items-center gap-2.5 text-lg">
                <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-indigo-400 to-purple-500" />
                📝 与上次草稿对比
              </h3>

              <div className="space-y-4">
                {draftDiff && draftDiff.filter(d => d.type === 'added').length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-emerald-300 flex items-center gap-1.5">
                      <span className="w-1 h-4 rounded-full bg-emerald-400" />
                      新增成员
                    </h4>
                    <div className="space-y-1.5">
                      {draftDiff.filter(d => d.type === 'added').map((item, i) => (
                        <div key={`add-${i}`} className="flex items-center gap-2 text-sm pl-2">
                          <span className="text-lg">{(item as any).avatar}</span>
                          <span className="text-white/90">{item.name}</span>
                          <span className="tag-pill bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-[11px]">
                            进入正式车
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {draftDiff && draftDiff.filter(d => d.type === 'movedOut').length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-rose-300 flex items-center gap-1.5">
                      <span className="w-1 h-4 rounded-full bg-rose-400" />
                      移出正式车
                    </h4>
                    <div className="space-y-1.5">
                      {draftDiff.filter(d => d.type === 'movedOut').map((item, i) => {
                        const out = item as any;
                        return (
                          <div key={`out-${i}`} className="flex items-center gap-2 text-sm pl-2 flex-wrap">
                            <span className="text-lg">{out.avatar}</span>
                            <span className="text-white/90">{out.name}</span>
                            <span className="tag-pill bg-rose-500/15 text-rose-300 border border-rose-400/30 text-[11px]">
                              去了{out.targetStatus}
                            </span>
                            <span className="text-white/40 text-xs">
                              原：{out.role} · {out.duty}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {draftDiff && draftDiff.filter(d => d.type === 'changed').length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-blue-300 flex items-center gap-1.5">
                      <span className="w-1 h-4 rounded-full bg-blue-400" />
                      分工变化
                    </h4>
                    <div className="space-y-1.5">
                      {draftDiff.filter(d => d.type === 'changed').map((item, i) => {
                        const ch = item as any;
                        return (
                          <div key={`ch-${i}`} className="flex items-center gap-2 text-sm pl-2 flex-wrap">
                            <span className="text-lg">{ch.avatar}</span>
                            <span className="text-white/90">{ch.name}</span>
                            <span className="text-white/40 text-xs">
                              {(ch.field === 'role' || ch.field === 'both') && (
                                <>{ch.oldRole} → {ch.newRole}</>
                              )}
                              {ch.field === 'both' && ' · '}
                              {(ch.field === 'duty' || ch.field === 'both') && (
                                <>{ch.oldDuty} → {ch.newDuty}</>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {draftDiff && draftDiff.length === 0 && (
                  <p className="text-sm text-white/70 flex items-center gap-2 py-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    ✅ 与上次草稿完全一致
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
          <button
            onClick={() => onSaveDraft(assignedRoles)}
            className="btn-ghost flex items-center gap-1.5"
          >
            <Save size={15} />
            💾 保存草稿
          </button>
          <button onClick={onClose} className="btn-ghost flex items-center gap-1.5">
            <ArrowLeft size={15} />
            继续调整
          </button>
          <button
            onClick={() => onConfirm(assignedRoles)}
            disabled={isShort}
            className="btn-primary flex items-center gap-1.5"
          >
            <Sparkles size={15} />
            ✨ 确认成团
          </button>
        </div>
      </div>
    </div>
  );
}
