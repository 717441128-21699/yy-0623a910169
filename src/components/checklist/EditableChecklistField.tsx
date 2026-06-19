import { useState } from 'react';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableChecklistFieldProps {
  title: string;
  icon: keyof typeof Icons;
  iconColor: string;
  initialValue: string;
  onSave: (val: string) => void;
  multiline?: boolean;
  copyable?: boolean;
  mapLink?: string;
  readOnly?: boolean;
}

export default function EditableChecklistField({
  title,
  icon,
  iconColor,
  initialValue,
  onSave,
  multiline = false,
  copyable = false,
  mapLink,
  readOnly = false,
}: EditableChecklistFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialValue);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const Icon = Icons[icon] as LucideIcon;

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(initialValue);
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

  const handleEdit = () => {
    setEditValue(initialValue);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditValue(initialValue);
    setIsEditing(false);
  };

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-5 flex flex-col gap-3 border-l-4',
        accentBorder,
        isEditing && 'ring-2 ring-amber-450/30'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={cn('p-2 rounded-xl bg-white/5', iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          {copyable && !isEditing && (
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
          {!readOnly && !isEditing && (
            <button
              onClick={handleEdit}
              className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              <Icons.Pencil className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          {multiline ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={6}
              className="form-input resize-none text-sm leading-relaxed"
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="form-input text-sm"
              autoFocus
            />
          )}
          <div className="flex items-center justify-end gap-2">
            <button onClick={handleCancel} className="btn-ghost text-sm py-2 px-4">
              取消
            </button>
            <button onClick={handleSave} className="btn-primary text-sm py-2 px-4">
              <Icons.Check className="w-4 h-4" />
              保存
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-sm text-white/80 whitespace-pre-line leading-relaxed flex-1">
            {initialValue}
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
        </>
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
