import { create } from 'zustand';
import type { GameScript, Applicant, TripChecklistData } from '../types';
import { loadFromStorage, saveToStorage, uid } from '../utils/storage';
import { mockGames, mockApplicants, mockChecklists } from '../data/mockData';
import { calcMatchScore } from '../utils/matchScore';

interface GameState {
  games: GameScript[];
  applicants: Applicant[];
  checklists: Record<string, TripChecklistData>;

  initFromMock: () => void;
  addGame: (data: Omit<GameScript, 'id' | 'createdAt' | 'status' | 'hostId'>) => string;
  getGame: (id: string) => GameScript | undefined;
  updateGameStatus: (id: string, status: GameScript['status']) => void;

  addApplicant: (data: Omit<Applicant, 'id' | 'matchScore' | 'status' | 'appliedAt'>) => void;
  getApplicantsByGame: (gameId: string) => Applicant[];
  updateApplicantStatus: (ids: string[], status: Applicant['status']) => void;

  generateChecklist: (gameId: string) => TripChecklistData;
  getChecklist: (gameId: string) => TripChecklistData | undefined;
}

export const useGameStore = create<GameState>((set, get) => ({
  games: loadFromStorage('games', [] as GameScript[]),
  applicants: loadFromStorage('applicants', [] as Applicant[]),
  checklists: loadFromStorage('checklists', {} as Record<string, TripChecklistData>),

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
    const applicant: Applicant = {
      ...data,
      id: uid('a_'),
      matchScore,
      status: 'pending',
      appliedAt: new Date().toISOString(),
    };
    const applicants = [...get().applicants, applicant];
    set({ applicants });
    saveToStorage('applicants', applicants);
  },

  getApplicantsByGame: (gameId) => get().applicants.filter(a => a.gameId === gameId),

  updateApplicantStatus: (ids, status) => {
    const idSet = new Set(ids);
    const applicants = get().applicants.map(a => idSet.has(a.id) ? { ...a, status } : a);
    set({ applicants });
    saveToStorage('applicants', applicants);
  },

  generateChecklist: (gameId) => {
    const game = get().getGame(gameId);
    const apps = get().getApplicantsByGame(gameId).filter(a => a.status === 'official');
    if (!game) throw new Error('活动不存在');
    const duties = ['车头·总协调', '财务·预算AA', '复盘记录员', '摄影·物料', '副驾·安全', '后勤·餐饮', '外联·店铺'];
    const checklist: TripChecklistData = {
      gameId,
      trainTickets: `去程：${game.transport} ${game.departureDate}\n返程：${game.returnTime}（具体车次待确认）`,
      shopAddressWithMap: `${game.shopName}\n${game.shopAddress}\n（导航地址请复制到高德/百度地图搜索）`,
      groupAnnouncement: `【成团确认】${game.title} 正式成团！\n\n集合：${game.campus}\n交通：${game.transport}\n定金：¥${game.deposit}（提交后不退）\n总预算AA：约¥${game.budget}/人\n\n⚠️ 请假提示：${game.leaveRiskNotice}\n\n请大家24小时内确认车票信息，有问题群内讨论。社团QQ群：123456789`,
      assignedRoles: apps.map((a, i) => ({
        name: a.name,
        role: a.preferredRole || game.roles[i % game.roles.length] || '成员',
        duty: duties[i % duties.length],
        avatar: a.avatar,
      })),
      generatedAt: new Date().toISOString(),
    };
    const checklists = { ...get().checklists, [gameId]: checklist };
    set({ checklists });
    saveToStorage('checklists', checklists);
    return checklist;
  },

  getChecklist: (gameId) => get().checklists[gameId],
}));
