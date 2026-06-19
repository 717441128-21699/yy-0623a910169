import { CheckCircle2, FileText, Home, Sparkles, UserCircle2, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignUpSuccessProps {
  applicant: {
    name: string;
    grade: string;
    preferredRole: string;
    matchScore: number;
  };
  onViewDetails: () => void;
  onBackHome: () => void;
}

export default function SignUpSuccess({
  applicant,
  onViewDetails,
  onBackHome,
}: SignUpSuccessProps) {
  const { name, grade, preferredRole, matchScore } = applicant;

  const getScoreLabel = (score: number) => {
    if (score >= 85) return { text: '超高匹配度！', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    if (score >= 70) return { text: '匹配度优秀', color: 'text-amber-450', bg: 'bg-amber-450/20' };
    if (score >= 55) return { text: '匹配度良好', color: 'text-indigo-400', bg: 'bg-indigo-500/20' };
    return { text: '匹配度一般', color: 'text-white/70', bg: 'bg-white/10' };
  };

  const scoreInfo = getScoreLabel(matchScore);
  const isExcellent = matchScore >= 85;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg animate-fade-in-up">
        <div className="glass-card p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-450/10 via-transparent to-indigo-500/10 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-amber-450/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col items-center text-center mb-8 relative">
              <div className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center mb-5 relative',
                isExcellent && 'animate-float'
              )}>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/30 to-amber-450/30 animate-pulse-slow blur-xl" />
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400/20 border-2 border-emerald-400/50 flex items-center justify-center">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.6)]" />
                </div>
              </div>

              {isExcellent && (
                <div className="absolute top-0 right-0">
                  <Sparkles className="w-6 h-6 text-amber-450 animate-pulse" />
                </div>
              )}

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-2">
                <span>🎉</span>
                报名已提交
              </h1>
              <p className="text-white/60 text-base">等待车头审核中...</p>
            </div>

            <div className="glass-card p-5 sm:p-6 mb-8 bg-midnight-800/50 border-white/10">
              <div className="flex items-center justify-between mb-5 pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-450/20 flex items-center justify-center">
                    <Award className={cn('w-6 h-6', scoreInfo.color)} />
                  </div>
                  <div>
                    <div className="text-xs text-white/50 mb-0.5">综合匹配度</div>
                    <div className={cn('text-xs font-medium', scoreInfo.color)}>
                      {scoreInfo.text}
                    </div>
                  </div>
                </div>
                <div className={cn(
                  'px-4 py-2 rounded-xl font-serif font-black text-2xl',
                  scoreInfo.bg,
                  scoreInfo.color
                )}>
                  {matchScore}
                  <span className="text-sm font-normal ml-0.5">分</span>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2.5">
                    <UserCircle2 className="w-4.5 h-4.5 text-white/50" />
                    <span className="text-sm text-white/60">报名人</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{name}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-4.5 h-4.5 flex items-center justify-center text-white/50">
                      📚
                    </div>
                    <span className="text-sm text-white/60">年级</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{grade}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-4.5 h-4.5 flex items-center justify-center text-white/50">
                      🎭
                    </div>
                    <span className="text-sm text-white/60">偏好角色</span>
                  </div>
                  <span className="text-sm font-semibold text-white text-right max-w-[60%] truncate">
                    {preferredRole || '听从安排'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onViewDetails}
                className="btn-primary flex-1 py-3"
              >
                <FileText className="w-4.5 h-4.5" />
                查看本单详情
              </button>
              <button
                onClick={onBackHome}
                className="btn-ghost flex-1"
              >
                <Home className="w-4.5 h-4.5" />
                返回大厅
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-white/5 text-center">
              <div className="text-xs text-white/40">
                💡 温馨提示：车头通常在 24 小时内完成审核
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
