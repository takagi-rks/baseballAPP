import React, { useState } from 'react';
import type { PlateAppearance, Player } from '../types';

const EDIT_OPTIONS: { label: string; result_category: string; result_detail: string }[] = [
  { label: '単打',   result_category: 'HIT',  result_detail: 'SINGLE'     },
  { label: '二塁打', result_category: 'HIT',  result_detail: 'DOUBLE'     },
  { label: '三塁打', result_category: 'HIT',  result_detail: 'TRIPLE'     },
  { label: '本塁打', result_category: 'HIT',  result_detail: 'HOME_RUN'   },
  { label: '四球',   result_category: 'WALK', result_detail: 'WALK'       },
  { label: '凡退',   result_category: 'OUT',  result_detail: 'GROUND_OUT' },
];

interface RecentPlateAppearancesProps {
  recentHistory: PlateAppearance[];
  players: Player[];
  title?: string;
  onDelete?: (id: number) => void;
  onEditSuccess?: () => void;
  isProcessing?: boolean;
}

function getResultLabel(item: any): string {
  const map: Record<string, string> = {
    SINGLE: '単打', DOUBLE: '二塁打', TRIPLE: '三塁打', HOME_RUN: '本塁打',
    WALK: '四球', HIT_BY_PITCH: '死球',
    STRIKEOUT: '三振', GROUND_OUT: 'ゴロ', FLY_OUT: 'フライ',
    SAC_BUNT: '犠打', SAC_FLY: '犠飛',
  };
  return map[item.result_detail] || map[item.result_category] || item.result_detail || '-';
}

function getResultStyle(item: any): string {
  if (['SINGLE','DOUBLE','TRIPLE'].includes(item.result_detail)) return 'text-blue-600';
  if (item.result_detail === 'HOME_RUN') return 'text-amber-600';
  if (item.result_category === 'WALK' || item.result_detail === 'HIT_BY_PITCH') return 'text-green-600';
  return 'text-red-500';
}

function getInningLabel(item: any): string {
  if (!item.inning) return '';
  return `${item.inning}回${item.inning_half === 'BOTTOM' ? '裏' : '表'}`;
}

export const RecentPlateAppearances: React.FC<RecentPlateAppearancesProps> = ({
  recentHistory, players, title = '直近の入力',
  onDelete, onEditSuccess, isProcessing = false,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const safeHistory = Array.isArray(recentHistory) ? recentHistory.slice(0, 10) : [];

  const handleEdit = async (itemId: number, option: typeof EDIT_OPTIONS[number]) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/plate-appearances/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result_category: option.result_category, result_detail: option.result_detail }),
      });
      const json = await res.json();
      if (json.success) { setEditingId(null); onEditSuccess?.(); }
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
        <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">{title}</span>
        <span className="text-[10px] text-gray-400">{safeHistory.length}件</span>
      </div>
      {safeHistory.length === 0 ? (
        <div className="px-4 py-4 text-xs text-gray-400 text-center">履歴はまだありません</div>
      ) : (
        safeHistory.map((item: any, index: number) => {
          const player = players.find((p) => Number(p.id) === Number(item.player_id));
          const isEditing = editingId === Number(item.id);
          return (
            <div key={item.id || index} className="border-b border-gray-50 last:border-b-0">
              <div className="flex items-center gap-3 px-4 py-2">
                <span className="text-[10px] text-gray-400 w-12 flex-shrink-0">{getInningLabel(item)}</span>
                <span className="text-sm text-gray-800 font-medium flex-1">{player?.name || '不明'}</span>
                <span className={`text-xs font-bold ${getResultStyle(item)}`}>{getResultLabel(item)}</span>
                {Number(item.rbi) > 0 && (
                  <span className="text-[10px] text-red-500 font-semibold">{item.rbi}打点</span>
                )}
                <div className="flex gap-1 ml-1">
                  {item.id && (
                    <button type="button"
                      onClick={() => setEditingId(isEditing ? null : Number(item.id))}
                      disabled={isProcessing || isSaving}
                      className={`text-[10px] px-1.5 py-0.5 rounded border disabled:opacity-30 transition-colors ${
                        isEditing ? 'bg-amber-50 border-amber-300 text-amber-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}>✏️</button>
                  )}
                  {onDelete && item.id && (
                    <button type="button"
                      onClick={() => onDelete(Number(item.id))}
                      disabled={isProcessing || isSaving}
                      className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400 disabled:opacity-30 transition-colors">×</button>
                  )}
                </div>
              </div>
              {isEditing && (
                <div className="flex flex-wrap gap-1.5 px-4 py-2 bg-amber-50 border-t border-amber-100">
                  {EDIT_OPTIONS.map((opt) => (
                    <button key={opt.result_detail} type="button"
                      onClick={() => handleEdit(Number(item.id), opt)}
                      disabled={isSaving}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded border border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:text-blue-600 active:scale-95 transition-all disabled:opacity-40">
                      {isSaving ? '…' : opt.label}
                    </button>
                  ))}
                  <button type="button" onClick={() => setEditingId(null)} disabled={isSaving}
                    className="text-[11px] px-2.5 py-1 rounded border border-gray-200 bg-white text-gray-400 ml-auto disabled:opacity-40">閉じる</button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
