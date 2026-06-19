export interface GameScript {
  id: string;
  title: string;
  coverImage: string;
  type: string[];
  difficulty: number;
  duration: string;
  playerCount: number;
  description: string;
  roles: string[];

  campus: string;
  destinationCity: string;
  transport: string;
  budget: number;
  shopName: string;
  shopAddress: string;
  departureDate: string;
  returnTime: string;
  leaveRiskNotice: string;
  deposit: number;

  status: 'recruiting' | 'reviewing' | 'confirmed';
  createdAt: string;
  hostId: string;
  hostName: string;
}

export interface Applicant {
  id: string;
  gameId: string;
  name: string;
  grade: string;
  major: string;
  phone: string;
  avatar: string;

  hasCrossCityExp: boolean;
  budgetLimit: number;
  canDoReviewRecord: boolean;
  getCarSick: boolean;
  preferredRole: string;

  acquaintedWithHost: boolean;
  hasFlakedBefore: boolean;
  matchScore: number;

// 当前状态
  status: 'pending' | 'official' | 'standby' | 'next';
  // 同状态下的排序权重（越小越靠前）
  order: number;
  appliedAt: string;
}

export interface AssignedRole {
  name: string;
  role: string;
  duty: string;
  avatar: string;
}

export interface TripChecklistData {
  gameId: string;
  trainTickets: string;
  shopAddressWithMap: string;
  groupAnnouncement: string;
  assignedRoles: AssignedRole[];
  generatedAt: string;
}

export type SortKey = 'matchScore' | 'grade' | 'acquainted' | 'noFlake' | 'role';

export const GRADES = ['大一', '大二', '大三', '大四', '研一', '研二', '研三'];

export const TRANSPORTS = ['高铁', '动车', '大巴', '自驾拼车', '卧铺火车'];

export const SCRIPT_TYPES = ['硬核推理', '情感沉浸', '恐怖惊悚', '机制阵营', '欢乐撕逼', '古风历史', '科幻变格', '都市还原'];

export const DEFAULT_AVATARS = ['🎭', '🦊', '🐱', '🐻', '🦁', '🐯', '🐨', '🐼', '🦉', '🐸', '🦋', '🌸'];
