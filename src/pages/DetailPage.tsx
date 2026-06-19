import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Train,
  Banknote,
  Store,
  AlertTriangle,
  Clock,
  Users,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import {
  DifficultyStars,
  TypeTag,
  InfoRow,
  RoleChip,
  ProgressBar,
  SectionTitle,
} from './_detailPageHelpers';
import { cn } from '@/lib/utils';

const CURRENT_USER_HOST_ID = 'host_me';

export default function DetailPage() {
  const { id = '' } = useParams();
  const game = useGameStore((s) => s.getGame(id));
  const applicants = useGameStore((s) => s.getApplicantsByGame(id));
  const applicantCount = applicants.length;

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-6xl mb-4">🎭</div>
        <h2 className="font-serif text-2xl font-bold text-white mb-2">剧本不存在</h2>
        <p className="text-white/60 mb-6">该活动可能已被取消或链接无效</p>
        <Link to="/" className="btn-primary">
          <ArrowLeft className="w-4 h-4" /> 返回大厅
        </Link>
      </div>
    );
  }

  const isHost = game.hostId === CURRENT_USER_HOST_ID;
  const isFull = applicantCount >= game.playerCount;

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto px-4 lg:px-8 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">返回大厅</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 lg:gap-8">
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-card p-5 lg:p-7 animate-fade-in-up">
              <div className="relative overflow-hidden rounded-2xl mb-6 group">
                <img
                  src={game.coverImage}
                  alt={game.title}
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-midnight-900 via-midnight-900/20 to-transparent rounded-2xl" />
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                  {game.type.map((t) => (
                    <TypeTag key={t} type={t} />
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h1 className="font-serif text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
                  {game.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/50">难度</span>
                    <DifficultyStars difficulty={game.difficulty} />
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <Clock className="w-4 h-4 text-amber-450" />
                    <span className="text-sm font-medium">{game.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <Users className="w-4 h-4 text-amber-450" />
                    <span className="text-sm font-medium">{game.playerCount} 人本</span>
                  </div>
                </div>
              </div>

              <SectionTitle icon={<Sparkles className="w-5 h-5" />}>剧情简介</SectionTitle>
              <p className="text-white/75 leading-relaxed text-[15px] mb-6 whitespace-pre-line">
                {game.description}
              </p>

              <SectionTitle icon={<Users className="w-5 h-5" />}>可选角色</SectionTitle>
              <div className="glass-card p-4 lg:p-5 bg-midnight-800/40 border-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {game.roles.map((role) => (
                    <RoleChip key={role} role={role} />
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/50 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  角色将根据匹配度和报名顺序由车头统一分配，报名时可填写偏好
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-6 space-y-5">
              <div className="glass-card p-5 lg:p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <SectionTitle icon={<MapPin className="w-5 h-5" />}>行程信息</SectionTitle>
                <div className="divide-y divide-white/5 -mx-2">
                  <InfoRow
                    icon={<MapPin className="w-4.5 h-4.5" />}
                    label="出发集合点"
                    value={game.campus}
                  />
                  <InfoRow
                    icon={<Train className="w-4.5 h-4.5" />}
                    label="目的地 · 交通"
                    value={`${game.destinationCity} · ${game.transport}`}
                  />
                  <InfoRow
                    icon={<Calendar className="w-4.5 h-4.5" />}
                    label="出发时间"
                    value={game.departureDate}
                  />
                  <InfoRow
                    icon={<Calendar className="w-4.5 h-4.5" />}
                    label="返程时间"
                    value={game.returnTime}
                  />
                  <InfoRow
                    icon={<Store className="w-4.5 h-4.5" />}
                    label="剧本店"
                    value={
                      <div>
                        <div className="font-semibold">{game.shopName}</div>
                        <div className="text-xs text-white/60 mt-0.5">{game.shopAddress}</div>
                      </div>
                    }
                  />
                  <InfoRow
                    icon={<Banknote className="w-4.5 h-4.5" />}
                    label="费用说明"
                    value={
                      <div>
                        <div>
                          预算 <span className="text-amber-450 font-bold">¥{game.budget}</span>/人
                          <span className="text-white/50 text-xs ml-2">（多退少补，AA结算）</span>
                        </div>
                        <div className="text-xs text-white/60 mt-0.5">
                          定金 ¥{game.deposit}（提交后不退，用于锁定车票/房间）
                        </div>
                      </div>
                    }
                  />
                </div>
              </div>

              <div
                className={cn(
                  'glass-card p-5 border-l-4 animate-fade-in-up',
                  'border-amber-450 bg-amber-450/5'
                )}
                style={{ animationDelay: '0.15s' }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-450/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-450" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-serif font-bold text-white mb-1">⚠️ 请假风险提示</div>
                    <p className="text-sm text-white/75 leading-relaxed">{game.leaveRiskNotice}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-5 lg:p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <ProgressBar current={applicantCount} total={game.playerCount} />

                <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
                  <Link
                    to={`/signup/${game.id}`}
                    className={cn('btn-primary w-full', isFull && 'opacity-70')}
                  >
                    {isFull ? '候补报名' : '立即报名'}
                    <ChevronRight className="w-4 h-4" />
                  </Link>

                  {isHost && (
                    <Link to={`/review/${game.id}`} className="btn-ghost w-full">
                      <Sparkles className="w-4 h-4" />
                      查看审核
                    </Link>
                  )}

                  <div className="text-center text-xs text-white/40 pt-2">
                    发起者：<span className="text-white/60 font-medium">{game.hostName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
