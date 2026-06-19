import { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import ScriptCard from '@/components/script/ScriptCard';
import ScriptFilter from '@/components/script/ScriptFilter';
import PublishModal from '@/components/script/PublishModal';

const stats = [
  { label: '本月发车', value: '12', suffix: '场' },
  { label: '参与', value: '87', suffix: '人' },
  { label: '平均AA', value: '￥620', suffix: '/人' },
];

export default function HomePage() {
  const games = useGameStore((s) => s.games);
  const getApplicantsByGame = useGameStore((s) => s.getApplicantsByGame);
  const addGame = useGameStore((s) => s.addGame);
  const [openPublish, setOpenPublish] = useState(false);

  return (
    <div className="space-y-16">
      <section
        className="animate-fade-in-up opacity-0"
        style={{ animationDelay: '0ms' }}
      >
        <div className="glass-card p-10 lg:p-14 bg-hero-gradient relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-amber-450/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-3xl">
            <h1 className="font-serif text-4xl lg:text-6xl font-black text-white leading-tight mb-5">
              🎭 高校剧本杀·城限本车队招募
            </h1>
            <p className="text-lg text-white/70 leading-relaxed mb-8">
              跨城发车 · 社团内部报名 · 车头审核 · 出行清单
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setOpenPublish(true)}
                className="btn-primary"
              >
                <Plus className="w-5 h-5" />
                发布新城限本
              </button>
              <a href="#scripts" className="btn-ghost">
                <Filter className="w-4 h-4" />
                浏览本单
              </a>
            </div>
          </div>
        </div>
      </section>

      <section
        className="animate-fade-in-up opacity-0"
        style={{ animationDelay: '120ms' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="glass-card p-6 text-center"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="text-white/60 text-sm mb-2">{s.label}</div>
              <div className="font-serif text-3xl font-bold">
                <span className="text-amber-450">{s.value}</span>
                <span className="text-white/70 text-base ml-1">{s.suffix}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="scripts"
        className="animate-fade-in-up opacity-0"
        style={{ animationDelay: '240ms' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="section-title">🔥 最新车队</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpenPublish(true)}
              className="btn-primary"
            >
              <Plus className="w-5 h-5" />
              发布新城限本
            </button>
          </div>
        </div>

        <div className="mb-6">
          <ScriptFilter />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {games.length === 0 ? (
            <div className="col-span-full glass-card p-16 text-center">
              <div className="text-6xl mb-4">🎬</div>
              <div className="font-serif text-xl font-bold mb-2">暂无本单</div>
              <div className="text-white/60 text-sm mb-6">成为第一个发布城限本的车头吧！</div>
              <button onClick={() => setOpenPublish(true)} className="btn-primary">
                <Plus className="w-5 h-5" />
                立即发布
              </button>
            </div>
          ) : (
            games.map((game, idx) => (
              <div
                key={game.id}
                className="animate-fade-in-up opacity-0"
                style={{ animationDelay: `${300 + idx * 80}ms` }}
              >
                <ScriptCard
                  game={game}
                  applicantCount={getApplicantsByGame(game.id).filter(a => a.status === 'pending' || a.status === 'official').length}
                />
              </div>
            ))
          )}
        </div>
      </section>

      <section
        className="animate-fade-in-up opacity-0"
        style={{ animationDelay: '360ms' }}
      >
        <div className="divider-line" />
        <div className="glass-card p-8 text-center space-y-4">
          <div className="font-serif text-xl font-bold text-white/90">
            剧社车队 · 高校剧本杀社团联盟
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/50 text-sm">
            <span>📧 联系邮箱：jusha@example.edu.cn</span>
            <span>💬 社团QQ群：123456789</span>
            <span>📍 覆盖高校：37 所</span>
          </div>
          <div className="text-white/30 text-xs pt-2">
            © 2026 剧社车队 · 仅限高校社团内部使用
          </div>
        </div>
      </section>

      <PublishModal
        open={openPublish}
        onClose={() => setOpenPublish(false)}
        onSubmit={(data) => {
          const newId = addGame(data);
          setOpenPublish(false);
          console.log('发布成功:', newId);
        }}
      />
    </div>
  );
}
