import { useState } from 'react';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoCardProps {
  title: string;
  iconName: keyof typeof Icons;
  iconColor: string;
  content: string;
  copyable?: boolean;
  mapLink?: string;
}

export default function InfoCard({
  title,
  iconName,
  iconColor,
  content,
  copyable = false,
  mapLink,
}: InfoCardProps) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const Icon = Icons[iconName] as LucideIcon;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const borderColorMap: Record<string, string> = {
    'text-indigo-400': 'border-l-indigo-400',
    'text-amber-400': 'border-l-amber-400',
    'text-emerald-400': 'border-l-emerald-400',
    'text-rose-400': 'border-l-rose-400',
    'text-purple-400': 'border-l-purple-400',
    'text-cyan-400': 'border-l-cyan-400',
    'text-pink-400': 'border-l-pink-400',
  };

  const accentBorder = borderColorMap[iconColor] || 'border-l-indigo-400';

  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-1 transition-all duration-300 border-l-4',
        accentBorder,
        'hover:shadow-lg'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn('p-2 rounded-xl bg-white/5', iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-white">{title}</h3>
        </div>
        {copyable && (
          <button
            onClick={handleCopy}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              copied
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            )}
          >
            <Icons.Clipboard className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="text-sm text-white/80 whitespace-pre-line leading-relaxed flex-1">
        {content}
      </div>

      {mapLink && (
        <div className="pt-1">
          <a
            href={mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-medium',
              iconColor,
              'hover:underline underline-offset-2 transition-all'
            )}
          >
            <Icons.MapPin className="w-4 h-4" />
            打开地图
          </a>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/90 backdrop-blur-md text-white text-sm font-medium shadow-lg shadow-emerald-500/30">
            <Icons.Check className="w-4 h-4" />
            已复制到剪贴板
          </div>
        </div>
      )}
    </div>
  );
}
