import { useState } from 'react';
import { X, Check, Star, FileText, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import { SCRIPT_TYPES, TRANSPORTS, type GameScript } from '@/types';

type GameSubmitData = Omit<GameScript, 'id' | 'createdAt' | 'status' | 'hostId'>;

interface PublishModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: GameSubmitData) => void;
}

const CAMPUSES = ['东区南门', '西区北门', '南区东门', '北区西门'];
const STEP_TITLES = ['剧本信息', '行程信息', '确认发布'];

interface FormData {
  title: string;
  coverImage: string;
  difficulty: number;
  duration: string;
  playerCount: number;
  type: string[];
  description: string;
  roles: string;
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
  hostName: string;
}

const initialForm: FormData = {
  title: '',
  coverImage: '',
  difficulty: 3,
  duration: '',
  playerCount: 6,
  type: [],
  description: '',
  roles: '',
  campus: '',
  destinationCity: '',
  transport: '',
  budget: 0,
  shopName: '',
  shopAddress: '',
  departureDate: '',
  returnTime: '',
  leaveRiskNotice: '',
  deposit: 0,
  hostName: '林社长',
};

export default function PublishModal({ open, onClose, onSubmit }: PublishModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);

  if (!open) return null;

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleType = (t: string) => {
    setForm((prev) => ({
      ...prev,
      type: prev.type.includes(t) ? prev.type.filter((x) => x !== t) : [...prev.type, t],
    }));
  };

  const handleSubmit = () => {
    const { title, coverImage, type, difficulty, duration, playerCount, description, roles, campus, destinationCity, transport, budget, shopName, shopAddress, departureDate, returnTime, leaveRiskNotice, deposit, hostName } = form;
    const submitData: GameSubmitData = {
      title,
      coverImage: coverImage || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=%E5%89%A7%E6%9C%AC%E6%9D%80%E5%B0%81%E9%9D%A2%20%E6%A3%98%E5%9B%BE%20%E6%82%AC%E7%96%91%20%E6%B7%B1%E8%89%B2%E8%89%B2%E8%B0%83&image_size=portrait_4_3',
      type: type.length ? type : ['都市还原'],
      difficulty,
      duration: duration || '5-6小时',
      playerCount,
      description: description || '暂无简介',
      roles: roles.split(',').map((r) => r.trim()).filter(Boolean),
      campus: campus || '东区南门',
      destinationCity,
      transport: transport || '高铁',
      budget,
      shopName,
      shopAddress,
      departureDate,
      returnTime,
      leaveRiskNotice: leaveRiskNotice || '出发前24小时鸽车定金不退',
      deposit,
      hostName,
    };
    onSubmit(submitData);
    setForm(initialForm);
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-midnight-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-4">
            {STEP_TITLES.map((title, i) => (
              <div key={title} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    i + 1 <= step
                      ? 'bg-amber-450 text-midnight-900'
                      : 'bg-midnight-800 text-white/40 border border-white/10'
                  }`}
                >
                  {i + 1 < step ? <Check size={16} /> : i + 1}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    i + 1 <= step ? 'text-white' : 'text-white/40'
                  }`}
                >
                  {title}
                </span>
                {i < STEP_TITLES.length - 1 && (
                  <div
                    className={`hidden sm:block w-8 h-px ${
                      i + 1 < step ? 'bg-amber-450' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="form-label">剧本名称</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="如：雾起鸡鸣寺"
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">封面图片 URL</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://..."
                    value={form.coverImage}
                    onChange={(e) => update('coverImage', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">游戏时长</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="如：5-6小时"
                    value={form.duration}
                    onChange={(e) => update('duration', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">玩家人数</label>
                  <input
                    type="number"
                    min={2}
                    className="form-input"
                    value={form.playerCount}
                    onChange={(e) => update('playerCount', Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="form-label flex items-center justify-between">
                  <span>难度等级</span>
                  <span className="text-amber-450 font-semibold">{form.difficulty}/5</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={form.difficulty}
                  onChange={(e) => update('difficulty', Number(e.target.value))}
                  className="w-full accent-amber-450"
                />
                <div className="flex justify-between mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < form.difficulty
                          ? 'text-amber-450 fill-amber-450'
                          : 'text-white/20'
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">剧本类型（可多选）</label>
                <div className="flex flex-wrap gap-2">
                  {SCRIPT_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleType(t)}
                      className={`chip-option ${form.type.includes(t) ? 'active' : ''}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">剧本简介</label>
                <textarea
                  rows={3}
                  className="form-input resize-none"
                  placeholder="简要介绍剧本背景和亮点..."
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">角色列表（逗号分隔）</label>
                <textarea
                  rows={2}
                  className="form-input resize-none"
                  placeholder="如：林夕, 陈默, 苏然, 老周, 小林, 张教授"
                  value={form.roles}
                  onChange={(e) => update('roles', e.target.value)}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">集合校区</label>
                  <select
                    className="form-input"
                    value={form.campus}
                    onChange={(e) => update('campus', e.target.value)}
                  >
                    <option value="">请选择</option>
                    {CAMPUSES.map((c) => (
                      <option key={c} value={c} className="bg-midnight-800">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">目的地城市</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="如：南京"
                    value={form.destinationCity}
                    onChange={(e) => update('destinationCity', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">交通方式</label>
                  <select
                    className="form-input"
                    value={form.transport}
                    onChange={(e) => update('transport', e.target.value)}
                  >
                    <option value="">请选择</option>
                    {TRANSPORTS.map((t) => (
                      <option key={t} value={t} className="bg-midnight-800">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">人均预算（元）</label>
                  <input
                    type="number"
                    min={0}
                    className="form-input"
                    placeholder="如：680"
                    value={form.budget}
                    onChange={(e) => update('budget', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="form-label">出发日期</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.departureDate}
                    onChange={(e) => update('departureDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">返程时间</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="如：周日 18:00"
                    value={form.returnTime}
                    onChange={(e) => update('returnTime', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">剧本店名称</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="如：金陵推理社"
                    value={form.shopName}
                    onChange={(e) => update('shopName', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label flex items-center gap-1.5">
                    <MapPin size={14} className="text-amber-450" />
                    店铺地址
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="详细地址..."
                    value={form.shopAddress}
                    onChange={(e) => update('shopAddress', e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">定金（元）</label>
                  <input
                    type="number"
                    min={0}
                    className="form-input"
                    placeholder="如：100"
                    value={form.deposit}
                    onChange={(e) => update('deposit', Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">请假风险告知</label>
                <textarea
                  rows={3}
                  className="form-input resize-none"
                  placeholder="如：出发前48小时内请假不退定金..."
                  value={form.leaveRiskNotice}
                  onChange={(e) => update('leaveRiskNotice', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="glass-card p-5 space-y-5">
              <div className="flex items-center gap-2 text-amber-450">
                <FileText size={20} />
                <h3 className="font-serif text-lg font-bold">发布信息确认</h3>
              </div>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-white/50">剧本名称</span>
                    <p className="font-medium text-white">{form.title || '-'}</p>
                  </div>
                  <div>
                    <span className="text-white/50">难度</span>
                    <p className="font-medium text-white">
                      {'★'.repeat(form.difficulty)}
                      <span className="text-white/20">{'★'.repeat(5 - form.difficulty)}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-white/50">玩家人数</span>
                    <p className="font-medium text-white">{form.playerCount}人</p>
                  </div>
                  <div>
                    <span className="text-white/50">时长</span>
                    <p className="font-medium text-white">{form.duration || '-'}</p>
                  </div>
                  <div>
                    <span className="text-white/50">目的地</span>
                    <p className="font-medium text-white">{form.destinationCity || '-'}</p>
                  </div>
                  <div>
                    <span className="text-white/50">交通</span>
                    <p className="font-medium text-white">{form.transport || '-'}</p>
                  </div>
                  <div>
                    <span className="text-white/50">人均预算</span>
                    <p className="font-medium text-amber-450">￥{form.budget}</p>
                  </div>
                  <div>
                    <span className="text-white/50">定金</span>
                    <p className="font-medium text-white">￥{form.deposit}</p>
                  </div>
                </div>

                <div>
                  <span className="text-white/50">剧本类型</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {form.type.length ? (
                      form.type.map((t) => (
                        <span
                          key={t}
                          className="tag-pill bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        >
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-white/40">未选择</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-white/50">集合信息</span>
                  <p className="font-medium text-white">
                    {form.campus || '-'} · {form.departureDate || '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 p-5 border-t border-white/10">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
            className="btn-ghost"
          >
            <ChevronLeft size={18} />
            {step > 1 ? '上一步' : '取消'}
          </button>

          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className="btn-primary">
              下一步
              <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn-primary">
              <Check size={18} />
              确认发布
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
