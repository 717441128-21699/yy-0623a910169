import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Calendar,
  Timer,
  Wallet,
  Users,
  Copy,
  Printer,
  Image,
  Sparkles,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import EditableChecklistField from '@/components/checklist/EditableChecklistField';

export default function ChecklistPage() {
  const { id } = useParams<{ id: string }>();
  const game = useGameStore((s) => s.getGame(id || ''));
  const checklist = useGameStore((s) => s.getChecklist(id || ''));
  const generateChecklist = useGameStore((s) => s.generateChecklist);
  const getApplicantsByGame = useGameStore((s) => s.getApplicantsByGame);
  const updateChecklistField = useGameStore((s) => s.updateChecklistField);

  const [generating, setGenerating] = useState(false);
  const [copyToast, setCopyToast] = useState(false);
  const [imageToast, setImageToast] = useState(false);
  const [generateError, setGenerateError] = useState(false);
  const [syncToast, setSyncToast] = useState(false);

  const officialCount = getApplicantsByGame(id || '').filter(
    (a) => a.status === 'official'
  ).length;

  const handleGenerate = async () => {
    if (!id) return;
    setGenerating(true);
    setGenerateError(false);
    try {
      await new Promise((r) => setTimeout(r, 600));
      generateChecklist(id);
    } catch {
      setGenerateError(true);
    } finally {
      setGenerating(false);
    }
  };

  const buildFullChecklistText = (): string => {
    if (!game || !checklist) return '';
    const lines: string[] = [];
    lines.push(`==== ${game.title} · 出行清单 ====`);
    lines.push('');
    lines.push(`【出发日期】${game.departureDate}`);
    lines.push(`【返程时间】${game.returnTime}`);
    lines.push(`【人均预算】￥${game.budget}（定金￥${game.deposit}）`);
    lines.push(`【成团人数】${checklist.assignedRoles.length}人 / 原需求${game.playerCount}人`);
    lines.push('');
    lines.push('--- 车票信息 ---');
    lines.push(checklist.trainTickets);
    lines.push('');
    lines.push('--- 定金说明 ---');
    lines.push(`定金：￥${game.deposit}/人，提交后不退。24小时内鸽车需自行找人补位。`);
    lines.push('');
    lines.push('--- 店铺地址 ---');
    lines.push(checklist.shopAddressWithMap);
    lines.push('');
    lines.push('--- 社团公告 ---');
    lines.push(checklist.groupAnnouncement);
    lines.push('');
    lines.push('--- 分工表 ---');
    checklist.assignedRoles.forEach((m, idx) => {
      lines.push(`${idx + 1}. ${m.name} | ${m.role} | ${m.duty}`);
    });
    lines.push('');
    lines.push(`==== 生成时间：${new Date(checklist.generatedAt).toLocaleString('zh-CN')} ====`);
    return lines.join('\n');
  };

  const handleCopyAll = async () => {
    const text = buildFullChecklistText();
    try {
      await navigator.clipboard.writeText(text);
      setCopyToast(true);
      setTimeout(() => setCopyToast(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateImage = () => {
    setImageToast(true);
    setTimeout(() => setImageToast(false), 2000);
  };

  const handleSyncMembers = () => {
    if (!id) return;
    generateChecklist(id, true);
    setSyncToast(true);
    setTimeout(() => setSyncToast(false), 2000);
  };

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold text-white mb-2">活动不存在</h2>
          <p className="text-white/60 text-sm">请检查链接是否正确</p>
        </div>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-card p-10 text-center max-w-lg animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-glow-amber">
            <Sparkles className="w-10 h-10 text-midnight-900" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-white mb-2">{game.title}</h2>
          <p className="text-white/60 mb-8">出行清单尚未生成，点击下方按钮一键生成</p>
          {generateError && (
            <p className="text-rose-400 text-sm mb-4">生成失败，请稍后重试</p>
          )}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary text-lg px-8 py-3.5"
          >
            {generating ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                生成出行清单
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 print:pb-0">
      <div className="bg-gradient-to-r from-amber-500 via-orange-450 to-amber-500 py-10 px-4 sm:px-6 lg:px-8 print:py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="text-5xl sm:text-6xl drop-shadow-lg print:text-4xl">🎫</div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 justify-center sm:justify-start">
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-md">
                {game.title}
              </h1>
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/25 backdrop-blur-sm text-white text-sm font-bold border border-white/30 whitespace-nowrap">
                【出行清单】
              </span>
            </div>
            <p className="text-white/85 text-sm mt-2 font-medium">
              {game.destinationCity} · {game.hostName} 发起 · {new Date(checklist.generatedAt).toLocaleDateString('zh-CN')} 生成
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 space-y-8 sm:space-y-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-card p-4 sm:p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">出发日期</span>
            </div>
            <p className="text-white font-semibold text-sm sm:text-base leading-tight">
              {game.departureDate}
            </p>
          </div>

          <div className="glass-card p-4 sm:p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400">
              <Timer className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">返程时间</span>
            </div>
            <p className="text-white font-semibold text-sm sm:text-base leading-tight">
              {game.returnTime}
            </p>
          </div>

          <div className="glass-card p-4 sm:p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-400">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">人均预算</span>
            </div>
            <div>
              <p className="text-white font-bold text-base sm:text-lg">￥{game.budget}</p>
              <p className="text-white/50 text-xs mt-0.5">含定金 ￥{game.deposit}</p>
            </div>
          </div>

          <div className="glass-card p-4 sm:p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">成团人数</span>
            </div>
            <div>
              <p className="text-white font-bold text-base sm:text-lg">
                {checklist.assignedRoles.length}
                <span className="text-white/50 font-normal text-sm">
                  {' '}/ 原需求{game.playerCount}人
                </span>
              </p>
              {officialCount > 0 && officialCount !== checklist.assignedRoles.length && (
                <p className="text-white/50 text-xs mt-0.5">官方确认 {officialCount} 人</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <EditableChecklistField
            title="车票"
            icon="Ticket"
            iconColor="text-indigo-400"
            initialValue={checklist.trainTickets}
            onSave={(val) => id && updateChecklistField(id, 'trainTickets', val)}
            multiline
            copyable
          />
          <EditableChecklistField
            title="定金"
            icon="CreditCard"
            iconColor="text-amber-400"
            initialValue={`定金金额：￥${game.deposit}/人\n\n提交后不退。\n24小时内鸽车需自行找人补位，否则定金扣除作为社团公费。\n\n请转账至社团支付宝：xxx@xxx.com\n备注格式：剧本杀_${game.title}_姓名`}
            onSave={() => {}}
            multiline
            copyable
            readOnly
          />
          <EditableChecklistField
            title="店铺地址"
            icon="MapPin"
            iconColor="text-emerald-400"
            initialValue={checklist.shopAddressWithMap}
            onSave={(val) => id && updateChecklistField(id, 'shopAddressWithMap', val)}
            multiline
            copyable
            mapLink={`https://uri.amap.com/search?keyword=${encodeURIComponent(game.shopAddress)}`}
          />
          <EditableChecklistField
            title="社团公告"
            icon="Megaphone"
            iconColor="text-rose-400"
            initialValue={checklist.groupAnnouncement}
            onSave={(val) => id && updateChecklistField(id, 'groupAnnouncement', val)}
            multiline
            copyable
          />
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="section-title flex items-center gap-2.5">
              <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
              分工表
            </h2>
            <span className="text-white/50 text-sm">
              共 {checklist.assignedRoles.length} 位成员
            </span>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-white/5 border-b border-white/10 text-xs font-medium text-white/50 uppercase tracking-wider">
              <div className="col-span-1">#</div>
              <div className="col-span-2">成员</div>
              <div className="col-span-4">角色</div>
              <div className="col-span-5">分工职责</div>
            </div>

            <div className="divide-y divide-white/5">
              {checklist.assignedRoles.map((member, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 px-5 py-4 items-center hover:bg-white/[0.03] transition-colors"
                >
                  <div className="hidden sm:flex col-span-1 items-center">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-500/10 border border-amber-400/20 flex items-center justify-center text-amber-400 text-xs font-bold">
                      {idx + 1}
                    </span>
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-midnight-600 to-midnight-700 border border-white/10 flex items-center justify-center text-xl shadow-inner">
                        {member.avatar}
                      </div>
                      <div className="sm:hidden absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-midnight-900 shadow">
                        {idx + 1}
                      </div>
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm sm:text-base">{member.name}</div>
                      <div className="sm:hidden text-white/40 text-xs mt-0.5">角色</div>
                    </div>
                  </div>

                  <div className="sm:col-span-4 pl-14 sm:pl-0">
                    <div className="sm:hidden text-white/40 text-xs mb-1">角色</div>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-indigo-500/15 text-indigo-300 text-xs sm:text-sm font-medium border border-indigo-400/20">
                      {member.role}
                    </span>
                  </div>

                  <div className="sm:col-span-5 pl-14 sm:pl-0">
                    <div className="sm:hidden text-white/40 text-xs mb-1">分工职责</div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500 shrink-0" />
                      <span className="text-white/85 text-sm sm:text-base font-medium">
                        {member.duty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 print:hidden">
          <div className="flex-1 flex items-center gap-3 text-white/60">
            <div className="w-10 h-10 rounded-xl bg-amber-450/15 border border-amber-450/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-sm">
              <p className="text-white font-semibold">导出清单</p>
              <p className="text-white/50 text-xs">复制、打印或生成图片分享到群聊</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handleSyncMembers}
              className="flex-1 sm:flex-none btn-secondary"
            >
              <RefreshCw className="w-4 h-4" />
              🔄 同步正式车成员
            </button>
            <button
              onClick={handleCopyAll}
              className="flex-1 sm:flex-none btn-ghost"
            >
              <Copy className="w-4 h-4" />
              复制清单内容
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none btn-ghost"
            >
              <Printer className="w-4 h-4" />
              打印
            </button>
            <button
              onClick={handleGenerateImage}
              className="flex-1 sm:flex-none btn-primary"
            >
              <Image className="w-4 h-4" />
              生成图片
            </button>
          </div>
        </div>
      </div>

      {(copyToast || imageToast || syncToast) && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up print:hidden">
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl backdrop-blur-md text-white text-sm font-medium shadow-xl">
            <Check className="w-4 h-4" />
            {syncToast
              ? '已同步最新成员分工'
              : copyToast
              ? '清单已复制到剪贴板'
              : '图片生成功能即将上线'}
            <style>{`
              .fixed.bottom-8 > div {
                background: ${syncToast ? 'rgba(99, 102, 241, 0.9)' : copyToast ? 'rgba(16, 185, 129, 0.9)' : 'rgba(99, 102, 241, 0.9)'};
                box-shadow: ${syncToast ? '0 10px 40px rgba(99, 102, 241, 0.35)' : copyToast ? '0 10px 40px rgba(16, 185, 129, 0.35)' : '0 10px 40px rgba(99, 102, 241, 0.35)'};
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}
