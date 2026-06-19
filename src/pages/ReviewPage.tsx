import { useState, useMemo } from 'react';
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
  type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { MapPin, Calendar, Users, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { GRADES, type SortKey, type Applicant, type Applicant as ApplicantType } from '../types';
import { cn } from '../lib/utils';
import SortToolbar from '../components/review/SortToolbar';
import DragColumn from '../components/review/DragColumn';
import ApplicantCard, { ApplicantCardContent } from '../components/review/ApplicantCard';

type ColumnStatus = 'pending' | 'official' | 'standby' | 'next';

const columns: { id: ColumnStatus; title: string }[] = [
  { id: 'official', title: '🚗 正式车' },
  { id: 'standby', title: '⏳ 候补车' },
  { id: 'next', title: '📅 下次优先' },
];

function sortApplicants(applicants: Applicant[], sortKey: SortKey): Applicant[] {
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
      return sorted.sort((a, b) => Number(!!b.preferredRole) - Number(!!a.preferredRole));
    default:
      return sorted;
  }
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const getGame = useGameStore(state => state.getGame);
  const getApplicantsByGame = useGameStore(state => state.getApplicantsByGame);
  const updateApplicantStatus = useGameStore(state => state.updateApplicantStatus);
  const updateGameStatus = useGameStore(state => state.updateGameStatus);
  const generateChecklist = useGameStore(state => state.generateChecklist);

  const game = useMemo(() => (id ? getGame(id) : undefined), [id, getGame]);
  const allApplicants = useMemo(() => (id ? getApplicantsByGame(id) : []), [id, getApplicantsByGame]);

  const [sortKey, setSortKey] = useState<SortKey>('matchScore');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localApplicants, setLocalApplicants] = useState<Applicant[]>(allApplicants);

  const sortedApplicants = useMemo(
    () => sortApplicants(localApplicants.length > 0 ? localApplicants : allApplicants, sortKey),
    [localApplicants, allApplicants, sortKey]
  );

  const pendingApplicants = sortedApplicants.filter(a => a.status === 'pending');
  const officialApplicants = sortedApplicants.filter(a => a.status === 'official');
  const standbyApplicants = sortedApplicants.filter(a => a.status === 'standby');
  const nextApplicants = sortedApplicants.filter(a => a.status === 'next');

  const activeApplicant = activeId
    ? [...allApplicants, ...localApplicants].find(a => a.id === activeId) || null
    : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const canConfirm = game ? officialApplicants.length === game.playerCount : false;

  const handleConfirmGroup = () => {
    if (!game || !canConfirm || !id) return;
    generateChecklist(id);
    updateGameStatus(id, 'confirmed');
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

  const findContainer = (id: string): ColumnStatus | null => {
    if (id === 'pending' || id === 'official' || id === 'standby' || id === 'next') {
      return id as ColumnStatus;
    }
    const applicant = [...allApplicants, ...localApplicants].find(a => a.id === id);
    return applicant ? applicant.status : null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setLocalApplicants(prev => {
      const currentList = prev.length > 0 ? prev : allApplicants;
      const activeItems = currentList.filter(a => a.status === activeContainer);
      const overItems = currentList.filter(a => a.status === overContainer);
      const activeIndex = activeItems.findIndex(a => a.id === activeId);
      let overIndex = overItems.findIndex(a => a.id === overId);
      if (overIndex === -1) overIndex = overItems.length;

      const newActiveItems = [...activeItems];
      const [removed] = newActiveItems.splice(activeIndex, 1);
      const removedWithStatus = removed ? { ...removed, status: overContainer as Applicant['status'] } : null;

      const newOverItems = [...overItems];
      if (removedWithStatus) {
        newOverItems.splice(overIndex, 0, removedWithStatus);
      }

      const otherItems = currentList.filter(
        a => a.status !== activeContainer && a.status !== overContainer
      );

      return [...otherItems, ...newActiveItems, ...newOverItems];
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer) return;

    let finalApplicants: Applicant[];

    if (activeContainer === overContainer) {
      const currentList = localApplicants.length > 0 ? localApplicants : allApplicants;
      const items = currentList.filter(a => a.status === activeContainer);
      const oldIndex = items.findIndex(a => a.id === activeId);
      let newIndex = items.findIndex(a => a.id === overId);
      if (newIndex === -1) newIndex = items.length;

      if (oldIndex !== newIndex) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        const otherItems = currentList.filter(a => a.status !== activeContainer);
        finalApplicants = [...otherItems, ...newItems];
        setLocalApplicants(finalApplicants);
      }
      return;
    }

    const currentList = localApplicants.length > 0 ? localApplicants : allApplicants;
    const activeItems = currentList.filter(a => a.status === activeContainer);
    const overItems = currentList.filter(a => a.status === overContainer);
    const activeIndex = activeItems.findIndex(a => a.id === activeId);
    let overIndex = overItems.findIndex(a => a.id === overId);
    if (overIndex === -1) overIndex = overItems.length;

    const newActiveItems = [...activeItems];
    const [removed] = newActiveItems.splice(activeIndex, 1);

    const newOverItems = [...overItems];
    if (removed) {
      newOverItems.splice(overIndex, 0, { ...removed, status: overContainer as Applicant['status'] });
    }

    const otherItems = currentList.filter(
      a => a.status !== activeContainer && a.status !== overContainer
    );

    finalApplicants = [...otherItems, ...newActiveItems, ...newOverItems];
    setLocalApplicants(finalApplicants);
    updateApplicantStatus([activeId], overContainer as Applicant['status']);
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
              onClick={() => navigate('/')}
              className="btn-ghost !py-2 !px-3 text-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3 tracking-wide">
                  {game.title}
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
                  onClick={handleConfirmGroup}
                  disabled={!canConfirm}
                  className={cn(
                    'btn-primary text-base !py-3 !px-6',
                    canConfirm && 'animate-pulse-slow'
                  )}
                >
                  ✨ 确认成团
                </button>
                {!canConfirm && (
                  <p className="text-xs text-amber-400/70 text-center max-w-[200px]">
                    正式车需要满 {game.playerCount} 人才能确认成团
                    （还差 {game.playerCount - officialApplicants.length} 人）
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <SortToolbar sortKey={sortKey} onSortChange={setSortKey} />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {pendingApplicants.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-white flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-450/20 text-amber-400 text-sm font-bold">
                      {pendingApplicants.length}
                    </span>
                    📋 待审核区
                  </h3>
                  <p className="text-sm text-white/40 mt-1 ml-10">拖拽下方卡片到右侧三个列中进行分类</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {pendingApplicants.map(applicant => (
                  <ApplicantCard key={applicant.id} applicant={applicant} />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {columns.map(col => (
              <DragColumn
                key={col.id}
                id={col.id}
                title={col.title}
                applicants={getApplicantsByStatus(col.id)}
                capacity={col.id === 'official' ? game.playerCount : undefined}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
            {activeApplicant ? (
              <div className="glass-card p-4 shadow-glow-amber-strong border-amber-450/60 scale-105 opacity-95 rotate-1">
                <ApplicantCardContent applicant={activeApplicant as ApplicantType} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
