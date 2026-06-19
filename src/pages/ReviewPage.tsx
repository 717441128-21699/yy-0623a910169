import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { MapPin, Calendar, Users, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { GRADES, type SortKey, type Applicant, type Applicant as ApplicantType, type GameScript } from '../types';
import { cn } from '../lib/utils';
import { calcRoleFitScore } from '../utils/matchScore';
import SortToolbar from '../components/review/SortToolbar';
import DragColumn from '../components/review/DragColumn';
import ApplicantCard, { ApplicantCardContent } from '../components/review/ApplicantCard';
import ConfirmGroupPreview from '../components/review/ConfirmGroupPreview';

type ColumnStatus = 'pending' | 'official' | 'standby' | 'next';

const columns: { id: ColumnStatus; title: string }[] = [
  { id: 'pending', title: '📋 待审核' },
  { id: 'official', title: '🚗 正式车' },
  { id: 'standby', title: '⏳ 候补车' },
  { id: 'next', title: '📅 下次优先' },
];

function sortByKey(applicants: Applicant[], sortKey: SortKey, game: GameScript | undefined, officialApps: Applicant[]): Applicant[] {
  const sorted = [...applicants];
  switch (sortKey) {
    case 'matchScore':
      return sorted.sort((a, b) => b.matchScore - a.matchScore);
    case 'grade':
      return sorted.sort((a, b) => GRADES.indexOf(b.grade) - GRADES.indexOf(a.grade));
    case 'acquainted':
      return sorted.sort((a, b) => Number(b.acquaintedWithHost) - Number(a.acquaintedWithHost));
    case 'noFlake':
      return sorted.sort((a, b) => Number(a.hasFlakedBefore) - Number(b.hasFlakedBefore));
    case 'role':
      if (!game) return sorted;
      return sorted
        .map(a => ({ app: a, fit: calcRoleFitScore(a, game, officialApps) }))
        .sort((a, b) => b.fit.score - a.fit.score)
        .map(item => item.app);
    default:
      return sorted;
  }
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const getGame = useGameStore(state => state.getGame);
  const getApplicantsByGame = useGameStore(state => state.getApplicantsByGame);
  const moveApplicant = useGameStore(state => state.moveApplicant);
  const reorderApplicants = useGameStore(state => state.reorderApplicants);
  const updateGameStatus = useGameStore(state => state.updateGameStatus);
  const generateChecklist = useGameStore(state => state.generateChecklist);

  const game = useMemo(() => (id ? getGame(id) : undefined), [id, getGame]);
  const allApplicants = useMemo(() => (id ? getApplicantsByGame(id) : []), [id, getApplicantsByGame]);

  const [sortKey, setSortKey] = useState<SortKey>('matchScore');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const officialApps = useMemo(
    () => allApplicants.filter(a => a.status === 'official').sort((a, b) => a.order - b.order),
    [allApplicants]
  );

  const sortedByStatus = useCallback(
    (status: Applicant['status']): Applicant[] => {
      const list = allApplicants.filter(a => a.status === status);
      return sortByKey(list, sortKey, game, officialApps);
    },
    [allApplicants, sortKey, game, officialApps]
  );

  const pendingApplicants = sortedByStatus('pending');
  const officialApplicants = sortedByStatus('official');
  const standbyApplicants = sortedByStatus('standby');
  const nextApplicants = sortedByStatus('next');

  const activeApplicant = activeId
    ? allApplicants.find(a => a.id === activeId) || null
    : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const canConfirm = game ? officialApplicants.length === game.playerCount : false;

  const handleOpenPreview = () => {
    if (!game) return;
    setShowPreview(true);
  };

  const handleConfirmGroup = () => {
    if (!game || !canConfirm || !id) return;
    generateChecklist(id);
    updateGameStatus(id, 'confirmed');
    setShowPreview(false);
    navigate(`/checklist/${id}`);
  };

  const getApplicantsByStatus = (status: ColumnStatus): Applicant[] => {
    switch (status) {
      case 'pending': return pendingApplicants;
      case 'official': return officialApplicants;
      case 'standby': return standbyApplicants;
      case 'next': return nextApplicants;
    }
  };

  const findContainer = (itemId: string): ColumnStatus | null => {
    if (itemId === 'pending' || itemId === 'official' || itemId === 'standby' || itemId === 'next') {
      return itemId as ColumnStatus;
    }
    const applicant = allApplicants.find(a => a.id === itemId);
    return applicant ? applicant.status : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !game || !id) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    const activeContainer = findContainer(activeIdStr);
    const overContainer = findContainer(overIdStr);

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      const items = getApplicantsByStatus(activeContainer);
      const oldIndex = items.findIndex(a => a.id === activeIdStr);
      let newIndex = items.findIndex(a => a.id === overIdStr);
      if (newIndex === -1) newIndex = items.length;
      if (oldIndex !== newIndex && oldIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        reorderApplicants(id, activeContainer, newItems.map(a => a.id));
      }
      return;
    }

    const overItems = getApplicantsByStatus(overContainer);
    let overIndex = overItems.findIndex(a => a.id === overIdStr);
    if (overIndex === -1) overIndex = overItems.length;

    moveApplicant(activeIdStr, overContainer as Applicant['status'], overIndex);
  };

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center max-w-md">
          <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-amber-450 opacity-60" />
          <h2 className="font-serif text-2xl font-bold text-white mb-2">活动不存在</h2>
          <p className="text-white/60 mb-6">无法找到对应的剧本活动，请检查链接是否正确。</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-450/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative">
            <button
              onClick={() => navigate(`/script/${id}`)}
              className="btn-ghost !py-2 !px-3 text-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              返回剧本详情
            </button>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3 tracking-wide">
                  {game.title}
                  <span className="ml-3 text-base font-sans font-medium text-amber-450 bg-amber-450/15 px-3 py-1 rounded-full align-middle">
                    车头审核
                  </span>
                </h1>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-white/60">
                    <MapPin className="w-4 h-4 text-amber-450" />
                    <span>{game.destinationCity} · {game.shopName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>{game.departureDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>
                      正式 <span className={cn(
                        'font-bold',
                        officialApplicants.length === game.playerCount ? 'text-amber-450' : 'text-white/80'
                      )}>{officialApplicants.length}</span>
                      <span className="text-white/40"> / {game.playerCount}</span>
                      <span className="text-white/40 mx-1">·</span>
                      待审 <span className="font-bold text-white/80">{pendingApplicants.length}</span>
                      <span className="text-white/40 mx-1">·</span>
                      候补 <span className="font-bold text-indigo-300">{standbyApplicants.length}</span>
                      <span className="text-white/40 mx-1">·</span>
                      下次 <span className="font-bold text-slate-300">{nextApplicants.length}</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {game.type.map(t => (
                    <span key={t} className="tag-pill bg-indigo-500/15 text-indigo-300 border border-indigo-400/20">
                      {t}
                    </span>
                  ))}
                  <span className="tag-pill bg-amber-450/15 text-amber-300 border border-amber-450/30">
                    {game.difficulty}星难度
                  </span>
                  <span className="tag-pill bg-white/10 text-white/70 border border-white/10">
                    {game.duration}
                  </span>
                  <span className="tag-pill bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                    {game.transport}
                  </span>
                  <span className="tag-pill bg-purple-500/15 text-purple-300 border border-purple-400/30">
                    预算 ¥{game.budget}/人
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                <button
                  onClick={handleOpenPreview}
                  disabled={officialApplicants.length === 0}
                  className={cn(
                    'btn-primary text-base !py-3 !px-6',
                    canConfirm && 'animate-pulse-slow'
                  )}
                >
                  ✨ 预览成团效果
                </button>
                {!canConfirm && officialApplicants.length > 0 && (
                  <p className="text-xs text-amber-400/70 text-center max-w-[200px]">
                    正式车还差 {game.playerCount - officialApplicants.length} 人才能最终确认
                  </p>
                )}
                {officialApplicants.length === 0 && (
                  <p className="text-xs text-white/40 text-center max-w-[200px]">
                    先把报名者拖到正式车里
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">排序方式：</span>
              <SortToolbar sortKey={sortKey} onSortChange={setSortKey} />
            </div>
            <div className="text-xs text-white/40 flex items-center gap-1">
              <span>💡</span>
              <span>排序仅用于浏览，拖拽调整最终成团顺序</span>
            </div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {columns.map(col => (
              <DragColumn
                key={col.id}
                id={col.id}
                title={col.title}
                applicants={getApplicantsByStatus(col.id)}
                capacity={col.id === 'official' ? game.playerCount : undefined}
                game={game}
                officialApps={officialApps}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
            {activeApplicant ? (
              <div className="glass-card p-4 shadow-glow-amber-strong border-amber-450/60 scale-105 opacity-95 rotate-1">
                <ApplicantCardContent applicant={activeApplicant as ApplicantType} game={game} officialApps={officialApps} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {game && (
        <ConfirmGroupPreview
          open={showPreview}
          onClose={() => setShowPreview(false)}
          game={game}
          applicants={officialApps}
          onConfirm={handleConfirmGroup}
        />
      )}
    </div>
  );
}
