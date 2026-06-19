import { create } from 'zustand';
import type { GameScript, Applicant, TripChecklistData, AssignedRole, GroupDraft } from '../types';
import { loadFromStorage, saveToStorage, uid } from '../utils/storage';
import { mockGames, mockApplicants, mockChecklists } from '../data/mockData';
import { calcMatchScore } from '../utils/matchScore';

interface GameState {
  games: GameScript[];
  applicants: Applicant[];
  checklists: Record<string, TripChecklistData>;
  drafts: Record<string, GroupDraft[]>;

  initFromMock: () => void;
  addGame: (data: Omit<GameScript, 'id' | 'createdAt' | 'status' | 'hostId'>) => string;
  getGame: (id: string) => GameScript | undefined;
  updateGameStatus: (id: string, status: GameScript['status']) => void;

  addApplicant: (data: Omit<Applicant, 'id' | 'matchScore' | 'status' | 'order' | 'appliedAt'>) => void;
  getApplicantsByGame: (gameId: string) => Applicant[];
  updateApplicantStatus: (ids: string[], status: Applicant['status']) => void;
  moveApplicant: (applicantId: string, toStatus: Applicant['status'], toIndex?: number) => void;
  reorderApplicants: (gameId: string, status: Applicant['status'], orderedIds: string[]) => void;

  saveDraft: (gameId: string, assignedRoles: AssignedRole[]) => GroupDraft;
  getDrafts: (gameId: string) => GroupDraft[];
  getLatestDraft: (gameId: string) => GroupDraft | undefined;

  generateChecklist: (gameId: string, preserveExisting?: boolean, customRoles?: AssignedRole[]) => TripChecklistData;
  getChecklist: (gameId: string) => TripChecklistData | undefined;
  updateChecklistField: (gameId: string, field: keyof Omit<TripChecklistData, 'gameId' | 'assignedRoles' | 'generatedAt'>, value: string) => void;
  updateChecklistAssignedRoles: (gameId: string, assignedRoles: AssignedRole[]) => void;
  syncChecklistMembers: (gameId: string) => TripChecklistData;
}

function saveApplicants(applicants: Applicant[]) {
  saveToStorage('applicants', applicants);
}

export const useGameStore = create<GameState>((set, get) => ({
  games: loadFromStorage('games', [] as GameScript[]),
  applicants: loadFromStorage('applicants', [] as Applicant[]),
  checklists: loadFromStorage('checklists', {} as Record<string, TripChecklistData>),
  drafts: loadFromStorage('drafts', {} as Record<string, GroupDraft[]>),

  initFromMock: () => {
    const stored = loadFromStorage('games', [] as GameScript[]);
    if (stored.length === 0) {
      set({
        games: mockGames,
        applicants: mockApplicants,
        checklists: mockChecklists,
      });
      saveToStorage('games', mockGames);
      saveToStorage('applicants', mockApplicants);
      saveToStorage('checklists', mockChecklists);
    }
  },

  addGame: (data) => {
    const id = uid('game_');
    const newGame: GameScript = {
      ...data,
      id,
      status: 'recruiting',
      createdAt: new Date().toISOString(),
      hostId: 'host_me',
    };
    const games = [...get().games, newGame];
    set({ games });
    saveToStorage('games', games);
    return id;
  },

  getGame: (id) => get().games.find(g => g.id === id),

  updateGameStatus: (id, status) => {
    const games = get().games.map(g => g.id === id ? { ...g, status } : g);
    set({ games });
    saveToStorage('games', games);
  },

  addApplicant: (data) => {
    const game = get().getGame(data.gameId);
    if (!game) return;
    const matchScore = calcMatchScore(data, game);
    const gameApps = get().getApplicantsByGame(data.gameId);
    const pendingCount = gameApps.filter(a => a.status === 'pending').length;
    const applicant: Applicant = {
      ...data,
      id: uid('a_'),
      matchScore,
      status: 'pending',
      order: pendingCount,
      appliedAt: new Date().toISOString(),
    };
    const applicants = [...get().applicants, applicant];
    set({ applicants });
    saveApplicants(applicants);
  },

  getApplicantsByGame: (gameId) => get().applicants.filter(a => a.gameId === gameId),

  updateApplicantStatus: (ids, status) => {
    const idSet = new Set(ids);
    const applicants = get().applicants.map(a => {
      if (idSet.has(a.id)) {
        return { ...a, status };
      }
      return a;
    });
    set({ applicants });
    saveApplicants(applicants);
  },

  moveApplicant: (applicantId, toStatus, toIndex) => {
    const all = get().applicants;
    const target = all.find(a => a.id === applicantId);
    if (!target) return;

    const gameId = target.gameId;
    const fromStatus = target.status;
    const gameApps = all.filter(a => a.gameId === gameId);

    if (fromStatus === toStatus) return;

    const fromList = gameApps.filter(a => a.status === fromStatus)
      .sort((a, b) => a.order - b.order)
      .filter(a => a.id !== applicantId);

    const toList = gameApps.filter(a => a.status === toStatus)
      .sort((a, b) => a.order - b.order);

    const insertIndex = toIndex === undefined ? toList.length : Math.min(toIndex, toList.length);
    const moved = { ...target, status: toStatus, order: insertIndex };
    toList.splice(insertIndex, 0, moved);

    const fromReordered = fromList.map((a, i) => ({ ...a, order: i }));
    const toReordered = toList.map((a, i) => ({ ...a, order: i }));
    const others = all.filter(a => a.gameId !== gameId || (a.status !== fromStatus && a.status !== toStatus));

    const newApplicants = [...others, ...fromReordered, ...toReordered];
    set({ applicants: newApplicants });
    saveApplicants(newApplicants);
  },

  reorderApplicants: (gameId, status, orderedIds) => {
    const all = get().applicants;
    const statusList = all.filter(a => a.gameId === gameId && a.status === status);
    const idToApp = new Map(statusList.map(a => [a.id, a]));

    const reordered: Applicant[] = orderedIds
      .map((id, i) => {
        const app = idToApp.get(id);
        return app ? { ...app, order: i } : null;
      })
      .filter((a): a is Applicant => a !== null);

    const others = all.filter(a => !(a.gameId === gameId && a.status === status));
    const newApplicants = [...others, ...reordered];
    set({ applicants: newApplicants });
    saveApplicants(newApplicants);
  },

  generateChecklist: (gameId, preserveExisting = false, customRoles) => {
    const game = get().getGame(gameId);
    if (!game) throw new Error('活动不存在');

    const apps = get()
      .getApplicantsByGame(gameId)
      .filter(a => a.status === 'official')
      .sort((a, b) => a.order - b.order);

    const existing = preserveExisting ? get().getChecklist(gameId) : undefined;

    const duties = ['车头·总协调', '财务·预算AA', '复盘记录员', '摄影·物料', '副驾·安全', '后勤·餐饮', '外联·店铺'];
    const assignedRoles = customRoles ?? apps.map((a, i) => ({
      name: a.name,
      role: a.preferredRole || game.roles[i % game.roles.length] || '成员',
      duty: duties[i % duties.length],
      avatar: a.avatar,
      applicantId: a.id,
    }));
    const checklist: TripChecklistData = {
      gameId,
      trainTickets: existing?.trainTickets ?? `去程：${game.transport} ${game.departureDate}\n返程：${game.returnTime}（具体车次待确认）`,
      shopAddressWithMap: existing?.shopAddressWithMap ?? `${game.shopName}\n${game.shopAddress}\n（导航地址请复制到高德/百度地图搜索）`,
      groupAnnouncement: existing?.groupAnnouncement ?? `【成团确认】${game.title} 正式成团！\n\n集合：${game.campus}\n交通：${game.transport}\n定金：¥${game.deposit}（提交后不退）\n总预算AA：约¥${game.budget}/人\n\n⚠️ 请假提示：${game.leaveRiskNotice}\n\n请大家24小时内确认车票信息，有问题群内讨论。社团QQ群：123456789`,
      assignedRoles,
      generatedAt: new Date().toISOString(),
    };
    const checklists = { ...get().checklists, [gameId]: checklist };
    set({ checklists });
    saveToStorage('checklists', checklists);
    return checklist;
  },

  getChecklist: (gameId) => get().checklists[gameId],

  updateChecklistField: (gameId, field, value) => {
    const existing = get().getChecklist(gameId);
    if (!existing) return;
    const updated = { ...existing, [field]: value };
    const checklists = { ...get().checklists, [gameId]: updated };
    set({ checklists });
    saveToStorage('checklists', checklists);
  },

  updateChecklistAssignedRoles: (gameId, assignedRoles) => {
    const existing = get().getChecklist(gameId);
    if (!existing) return;
    const updated = { ...existing, assignedRoles, generatedAt: new Date().toISOString() };
    const checklists = { ...get().checklists, [gameId]: updated };
    set({ checklists });
    saveToStorage('checklists', checklists);
  },

  syncChecklistMembers: (gameId) => {
    const existing = get().getChecklist(gameId);
    const game = get().getGame(gameId);
    if (!game) throw new Error('活动不存在');

    const apps = get()
      .getApplicantsByGame(gameId)
      .filter(a => a.status === 'official')
      .sort((a, b) => a.order - b.order);

    const duties = ['车头·总协调', '财务·预算AA', '复盘记录员', '摄影·物料', '副驾·安全', '后勤·餐饮', '外联·店铺'];

    const existingMap = new Map(
      (existing?.assignedRoles || []).map(r => [r.applicantId, r])
    );

    const assignedRoles = apps.map((a, i) => {
      const prev = existingMap.get(a.id);
      if (prev) {
        return { ...prev };
      }
      return {
        name: a.name,
        role: a.preferredRole || game.roles[i % game.roles.length] || '成员',
        duty: duties[i % duties.length],
        avatar: a.avatar,
        applicantId: a.id,
      };
    });

    const checklist: TripChecklistData = {
      gameId,
      trainTickets: existing?.trainTickets ?? `去程：${game.transport} ${game.departureDate}\n返程：${game.returnTime}（具体车次待确认）`,
      shopAddressWithMap: existing?.shopAddressWithMap ?? `${game.shopName}\n${game.shopAddress}\n（导航地址请复制到高德/百度地图搜索）`,
      groupAnnouncement: existing?.groupAnnouncement ?? `【成团确认】${game.title} 正式成团！\n\n集合：${game.campus}\n交通：${game.transport}\n定金：¥${game.deposit}（提交后不退）\n总预算AA：约¥${game.budget}/人\n\n⚠️ 请假提示：${game.leaveRiskNotice}\n\n请大家24小时内确认车票信息，有问题群内讨论。社团QQ群：123456789`,
      assignedRoles,
      generatedAt: new Date().toISOString(),
    };
    const checklists = { ...get().checklists, [gameId]: checklist };
    set({ checklists });
    saveToStorage('checklists', checklists);
    return checklist;
  },

  saveDraft: (gameId, assignedRoles) => {
    const draft: GroupDraft = {
      id: uid('draft_'),
      gameId,
      assignedRoles,
      savedAt: new Date().toISOString(),
    };
    const gameDrafts = get().drafts[gameId] || [];
    const drafts = { ...get().drafts, [gameId]: [...gameDrafts, draft] };
    set({ drafts });
    saveToStorage('drafts', drafts);
    return draft;
  },

  getDrafts: (gameId) => get().drafts[gameId] || [],

  getLatestDraft: (gameId) => {
    const gameDrafts = get().drafts[gameId] || [];
    return gameDrafts.length > 0 ? gameDrafts[gameDrafts.length - 1] : undefined;
  },
}));
