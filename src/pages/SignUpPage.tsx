import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Banknote,
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  Send,
  Coins,
  Car,
  FileText,
  UserCircle2,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { GRADES, DEFAULT_AVATARS } from '@/types';
import {
  FormSection,
  ToggleChip,
  AvatarChip,
  InfoRow,
  TypeTag,
} from './_detailPageHelpers';
import { cn } from '@/lib/utils';
import SignUpSuccess from '@/components/signup/SignUpSuccess';

interface FormState {
  name: string;
  grade: string;
  major: string;
  phone: string;
  hasCrossCityExp: boolean;
  budgetLimit: number;
  canDoReviewRecord: boolean;
  getCarSick: boolean;
  preferredRole: string;
  avatar: string;
  agreed: boolean;
}

export default function SignUpPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const game = useGameStore((s) => s.getGame(id));
  const addApplicant = useGameStore((s) => s.addApplicant);

  const [form, setForm] = useState<FormState>({
    name: '',
    grade: '',
    major: '',
    phone: '',
    hasCrossCityExp: false,
    budgetLimit: game?.budget || 600,
    canDoReviewRecord: false,
    getCarSick: false,
    preferredRole: '',
    avatar: '',
    agreed: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    grade: string;
    preferredRole: string;
    matchScore: number;
  } | null>(null);

  const isFormValid = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      form.grade !== '' &&
      form.major.trim().length >= 2 &&
      /^1\d{10}$/.test(form.phone.replace(/\*/g, '0')) &&
      form.avatar !== '' &&
      form.agreed
    );
  }, [form]);

  if (!game) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const data = {
      gameId: id,
      name: form.name.trim(),
      grade: form.grade,
      major: form.major.trim(),
      phone: form.phone.trim(),
      avatar: form.avatar,
      hasCrossCityExp: form.hasCrossCityExp,
      budgetLimit: form.budgetLimit,
      canDoReviewRecord: form.canDoReviewRecord,
      getCarSick: form.getCarSick,
      preferredRole: form.preferredRole || (game.roles[0] ?? ''),
      acquaintedWithHost: false,
      hasFlakedBefore: false,
    };

    addApplicant(data);

    const baseScore = 50
      + (data.hasCrossCityExp ? 15 : 0)
      + (data.budgetLimit >= game.budget ? 15 : 0)
      + (data.canDoReviewRecord ? 10 : 0)
      + (!data.getCarSick ? 5 : 0);

    setSubmittedData({
      name: data.name,
      grade: data.grade,
      preferredRole: data.preferredRole,
      matchScore: Math.max(0, Math.min(100, Math.round(baseScore))),
    });
    setSubmitted(true);
  };

  if (submitted && submittedData) {
    return (
      <SignUpSuccess
        applicant={submittedData}
        onViewDetails={() => navigate(`/script/${id}`)}
        onBackHome={() => navigate('/')}
      />
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="container mx-auto px-4 lg:px-8 pt-6">
        <Link
          to={`/script/${id}`}
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">返回剧本详情</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 lg:gap-8">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-6 space-y-5">
              <div className="glass-card p-5 animate-fade-in-up">
                <div className="flex gap-4 mb-4">
                  <div className="flex-shrink-0 w-20 h-28 rounded-xl overflow-hidden">
                    <img
                      src={game.coverImage}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 py-1">
                    <h2 className="font-serif text-xl font-bold text-white mb-2 line-clamp-2 leading-tight">
                      {game.title}
                    </h2>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {game.type.slice(0, 2).map((t) => (
                        <TypeTag key={t} type={t} />
                      ))}
                    </div>
                    <div className="text-xs text-white/50">
                      {game.duration} · {game.playerCount}人
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-white/5 -mx-2">
                  <InfoRow
                    icon={<MapPin className="w-4 h-4" />}
                    label="目的地"
                    value={`${game.destinationCity} · ${game.transport}`}
                  />
                  <InfoRow
                    icon={<Banknote className="w-4 h-4" />}
                    label="预算"
                    value={
                      <span>
                        <span className="text-amber-450 font-bold">¥{game.budget}</span>/人
                      </span>
                    }
                  />
                  <InfoRow
                    icon={<Calendar className="w-4 h-4" />}
                    label="出发"
                    value={game.departureDate}
                  />
                </div>
              </div>

              <div
                className={cn(
                  'glass-card p-4 border-l-4 animate-fade-in-up',
                  'border-amber-450 bg-amber-450/5'
                )}
                style={{ animationDelay: '0.05s' }}
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-450 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-amber-450 mb-1">请假风险提示</div>
                    <p className="text-xs text-white/70 leading-relaxed">{game.leaveRiskNotice}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white/90">报名须知</span>
                </div>
                <ul className="space-y-2 text-xs text-white/60">
                  <li className="flex gap-2">
                    <span className="text-amber-450 flex-shrink-0">·</span>
                    定金 ¥{game.deposit} 提交后不退，用于锁定车票/房间
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-450 flex-shrink-0">·</span>
                    报名后 24 小时内车头审核，结果将在审核页公示
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-450 flex-shrink-0">·</span>
                    鸽车记录会影响后续活动匹配分
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <form onSubmit={handleSubmit} className="glass-card p-5 lg:p-7 animate-fade-in-up">
              <div className="mb-6">
                <h1 className="font-serif text-2xl lg:text-3xl font-bold text-white mb-1">
                  填写报名信息
                </h1>
                <p className="text-sm text-white/50">
                  请认真填写，信息将用于匹配评分和车头审核
                </p>
              </div>

              <FormSection title="基本信息" step={1}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">
                      <UserCircle2 className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                      姓名 <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="请输入真实姓名"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <label className="form-label">年级 <span className="text-rose-400">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {GRADES.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setForm({ ...form, grade: g })}
                          className={cn(
                            'chip-option text-xs px-3 py-1.5',
                            form.grade === g && 'active'
                          )}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">专业 <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="如：软件工程"
                      value={form.major}
                      onChange={(e) => setForm({ ...form, major: e.target.value })}
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <label className="form-label">手机号 <span className="text-rose-400">*</span></label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="11位手机号码"
                      value={form.phone}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 11);
                        setForm({ ...form, phone: v });
                      }}
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection title="出行偏好" step={2}>
                <div className="space-y-5">
                  <div>
                    <label className="form-label mb-2">跨城出行经验</label>
                    <div className="flex gap-3">
                      <ToggleChip
                        label="有（跟团/自助都可）"
                        active={form.hasCrossCityExp}
                        onClick={() => setForm({ ...form, hasCrossCityExp: true })}
                      />
                      <ToggleChip
                        label="无（第一次）"
                        active={!form.hasCrossCityExp}
                        onClick={() => setForm({ ...form, hasCrossCityExp: false })}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="form-label mb-0">
                        <Coins className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                        个人预算上限
                      </label>
                      <span className="text-amber-450 font-bold text-lg font-serif">
                        ¥{form.budgetLimit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={200}
                      max={1500}
                      step={50}
                      value={form.budgetLimit}
                      onChange={(e) => setForm({ ...form, budgetLimit: Number(e.target.value) })}
                      className="w-full h-2 rounded-full appearance-none bg-midnight-900/60 border border-white/5
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-450
                        [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(245,158,11,0.6)] [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110"
                    />
                    <div className="flex justify-between mt-1.5 text-xs text-white/40">
                      <span>¥200</span>
                      <span>剧本预算 ¥{game.budget}</span>
                      <span>¥1500</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      className={cn(
                        'p-4 rounded-xl border cursor-pointer transition-all duration-200',
                        form.canDoReviewRecord
                          ? 'bg-amber-450/10 border-amber-450/40'
                          : 'bg-midnight-800/50 border-white/10 hover:border-white/20'
                      )}
                      onClick={() => setForm({ ...form, canDoReviewRecord: !form.canDoReviewRecord })}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                          form.canDoReviewRecord ? 'bg-amber-450/30' : 'bg-white/5'
                        )}>
                          <FileText className={cn(
                            'w-5 h-5',
                            form.canDoReviewRecord ? 'text-amber-450' : 'text-white/50'
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-white mb-0.5">复盘记录员</div>
                          <div className="text-xs text-white/50">
                            活动结束后负责写 300 字 + 的图文复盘（+10 匹配分）
                          </div>
                        </div>
                        <div className={cn(
                          'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all',
                          form.canDoReviewRecord
                            ? 'bg-amber-450 border-amber-450'
                            : 'border-white/20'
                        )}>
                          {form.canDoReviewRecord && <CheckCircle2 className="w-3.5 h-3.5 text-midnight-900" />}
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        'p-4 rounded-xl border cursor-pointer transition-all duration-200',
                        form.getCarSick
                          ? 'bg-rose-500/10 border-rose-500/40'
                          : 'bg-midnight-800/50 border-white/10 hover:border-white/20'
                      )}
                      onClick={() => setForm({ ...form, getCarSick: !form.getCarSick })}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                          form.getCarSick ? 'bg-rose-500/30' : 'bg-white/5'
                        )}>
                          <Car className={cn(
                            'w-5 h-5',
                            form.getCarSick ? 'text-rose-400' : 'text-white/50'
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-white mb-0.5">容易晕车</div>
                          <div className="text-xs text-white/50">
                            坐车容易头晕，需要前排座位和晕车药（-5 匹配分）
                          </div>
                        </div>
                        <div className={cn(
                          'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all',
                          form.getCarSick
                            ? 'bg-rose-500 border-rose-500'
                            : 'border-white/20'
                        )}>
                          {form.getCarSick && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection title="角色偏好" step={3}>
                <div>
                  <label className="form-label">想扮演的角色（车头参考分配）</label>
                  <div className="relative">
                    <select
                      className="form-input appearance-none pr-10 cursor-pointer"
                      value={form.preferredRole}
                      onChange={(e) => setForm({ ...form, preferredRole: e.target.value })}
                    >
                      <option value="">都可以，听从安排</option>
                      {game.roles.map((r) => (
                        <option key={r} value={r} className="bg-midnight-800">{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                  </div>
                  <div className="mt-2 text-xs text-white/40 flex items-center gap-1.5">
                    <span>💡</span>
                    最终角色由车头根据匹配度和报名顺序统一分配
                  </div>
                </div>
              </FormSection>

              <FormSection title="头像选择" step={4} last>
                <div>
                  <label className="form-label mb-3">选择一个专属头像 <span className="text-rose-400">*</span></label>
                  <div className="grid grid-cols-6 gap-2.5 sm:gap-3">
                    {DEFAULT_AVATARS.map((emoji) => (
                      <AvatarChip
                        key={emoji}
                        emoji={emoji}
                        selected={form.avatar === emoji}
                        onClick={() => setForm({ ...form, avatar: emoji })}
                      />
                    ))}
                  </div>
                </div>
              </FormSection>

              <div className="mt-8 p-4 rounded-xl bg-midnight-800/40 border border-white/10">
                <label
                  className={cn(
                    'flex items-start gap-3 cursor-pointer select-none',
                    !form.agreed && 'animate-pulse-slow'
                  )}
                >
                  <div className={cn(
                    'mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
                    form.agreed
                      ? 'bg-amber-450 border-amber-450'
                      : 'border-white/25 hover:border-amber-450/60'
                  )}
                    onClick={() => setForm({ ...form, agreed: !form.agreed })}
                  >
                    {form.agreed && <CheckCircle2 className="w-3.5 h-3.5 text-midnight-900" />}
                  </div>
                  <div className="text-sm text-white/70 leading-relaxed">
                    <span className="font-semibold text-white/90">报名承诺：</span>
                    我确认以上信息真实有效，已阅读请假风险提示，知晓定金 ¥{game.deposit} 不退。
                    如果成功入选，我将按时参加活动，不临时鸽车影响团队行程。
                  </div>
                </label>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={cn(
                    'btn-primary flex-1 py-3 text-base',
                    !isFormValid && '!opacity-40 !cursor-not-allowed'
                  )}
                >
                  <Send className="w-4.5 h-4.5" />
                  确认报名
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/script/${id}`)}
                  className="btn-ghost flex-1 sm:flex-none"
                >
                  再想想
                </button>
              </div>

              {!isFormValid && (
                <div className="mt-4 text-xs text-white/40 text-center">
                  请完成所有必填项并勾选承诺后提交
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
