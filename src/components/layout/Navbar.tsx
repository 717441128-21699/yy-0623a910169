import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';

const navItems = [
  { label: '本单大厅', to: '/', key: 'home' },
  { label: '我要报名', to: '/', key: 'signup' },
  { label: '审核中心', key: 'review' },
  { label: '出行清单', key: 'checklist' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const games = useGameStore((s) => s.games);

  const isActive = (key: string) => {
    if (key === 'home') return location.pathname === '/';
    if (key === 'signup') return location.pathname.startsWith('/signup') || location.pathname.startsWith('/script');
    if (key === 'review') return location.pathname.startsWith('/review');
    if (key === 'checklist') return location.pathname.startsWith('/checklist');
    return false;
  };

  const handleNavClick = (key: string) => {
    if (key === 'review') {
      const reviewingGame = games.find(g => g.status === 'reviewing' || g.status === 'confirmed');
      if (reviewingGame) navigate(`/review/${reviewingGame.id}`);
      else navigate('/');
    } else if (key === 'checklist') {
      const confirmedGame = games.find(g => g.status === 'confirmed');
      if (confirmedGame) navigate(`/checklist/${confirmedGame.id}`);
      else {
        const anyGame = games[0];
        if (anyGame) navigate(`/checklist/${anyGame.id}`);
        else navigate('/');
      }
    } else if (key === 'signup') {
      const recruitingGame = games.find(g => g.status === 'recruiting');
      if (recruitingGame) navigate(`/script/${recruitingGame.id}`);
      else navigate('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="glass-card max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            🎭
          </span>
          <span className="font-serif text-lg font-bold text-white tracking-wide">
            剧社车队·高校剧本杀社团
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const onClick = () => !item.to && handleNavClick(item.key);
            const content = (
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 inline-flex items-center cursor-pointer ${
                  isActive(item.key)
                    ? 'bg-amber-450 text-midnight-900 shadow-glow-amber'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </span>
            );
            if (item.to) {
              return (
                <Link key={item.key} to={item.to} onClick={onClick}>
                  {content}
                </Link>
              );
            }
            return (
              <div key={item.key} onClick={onClick}>
                {content}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer">
            <span className="text-2xl">🐻</span>
            <span className="text-sm font-medium text-white/90">林社长</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
