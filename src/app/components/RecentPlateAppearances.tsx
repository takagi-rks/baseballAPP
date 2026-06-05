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
    SINGLE:       '単打',
    DOUBLE:       '二塁打',
    TRIPLE:       '三塁打',
    HOME_RUN:     '本塁打',
    WALK:         '四球',
    HIT_BY_PITCH: '死球',
    STRIKEOUT:    '凡退',
    GROUND_OUT:   '凡退',
    FLY_OUT:      '凡退',
    SAC_BUNT:     '犠打',
    SAC_FLY:      '犠飛',
  };
  return (
    map[item.result_detail] ||
    map[item.result_category] ||
    item.result_label ||
    item.result_detail_label ||
    item.result_detail ||
    item.result_category ||
    '-'
  );
}

function getResultClass(item: any): string {
  if (Number(item.rbi || 0) > 0)
    return 'bg-amber-500/20 border-amber-500/40 text-amber-200';
  if (item.result_detail === 'HOME_RUN')
    return 'bg-red-500/20 border-red-500/40 text-red-200';
  if (['SINGLE', 'DOUBLE', 'TRIPLE'].includes(item.result_detail))
    return 'bg-blue-500/20 border-blue-500/40 text-blue-200';
  if (
    item.result_category === 'WALK' ||
    item.result_detail === 'HIT_BY_PITCH' ||
    item.result_detail === 'WALK'
  ) return 'bg-green-500/20 border-green-500/40 text-green-200';
  if (['STRIKEOUT', 'GROUND_OUT', 'FLY_OUT'].includes(item.result_detail))
    return 'bg-gray-800/70 border-gray-700 text-gray-300';
  return 'bg-gray-800/60 border-gray-700 text-gray-300';
}

function getInningLabel(item: any): string {
  if (!item.inning) return '';
  return `${item.inning}回${item.inning_half === 'BOTTOM' ? '裏' : '表'}`;
}

export const RecentPlateAppearances: React.FC<RecentPlateAppearancesProps> = ({
  recentHistory,
  players,
  title = '直近履歴',
  onDelete,
  onEditSuccess,
  isProcessing = false,
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
        body: JSON.stringify({
          result_category: option.result_category,
          result_detail:   option.result_detail,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEditingId(null);
        onEditSuccess?.();
      } else {
        console.error('Edit failed:', json.error);
      }
    } catch (e) {
      console.error('Edit network error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  if (safeHistory.length === 0) {
    return (
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-1.5">
        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">
          {title}
        </div>
        <div className="text-[11px] text-gray-600">履歴なし</div>
      </div>
    );
  }

  const grouped = safeHistory.reduce<Record<string, any[]>>((acc, item: any) => {
    const key = getInningLabel(item) || '不明';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-1.5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
          {title}
        </h3>
        <span className="text-[9px] text-gray-600">✏️編集 / ×削除</span>
      </div>

      <div className="space-y-0.5">
        {Object.entries(grouped).map(([inningLabel, items]) => (
          <div key={inningLabel}>
            <div className="text-[10px] text-blue-300 font-black mb-0.5 text-center">
              ー{inningLabel}ー
            </div>

            <div className="space-y-0.5">
              {items.map((item: any, index: number) => {
                const player = players.find((p) => Number(p.id) === Number(item.player_id));
                const isEditing = editingId === Number(item.id);

                return (
                  <div key={item.id || index} className="space-y-0.5">
                    <div
                      className={`border rounded-md px-2 py-0.5 flex items-center justify-between gap-2 ${getResultClass(item)}`}
                    >
                      <span className="text-[10px] font-bold truncate">
                        {player?.name || '不明'}
                      </span>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-black">
                          {Number(item.rbi || 0) > 0
                            ? `${item.rbi}点`
                            : getResultLabel(item)}
                        </span>

                        {item.id && (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingId(isEditing ? null : Number(item.id))
                            }
                            disabled={isProcessing || isSaving}
                            className={`w-5 h-5 rounded text-[11px] leading-none disabled:opacity-30 transition-colors ${
                              isEditing
                                ? 'bg-yellow-500/30 text-yellow-300'
                                : 'bg-black/30 text-gray-300 hover:bg-yellow-500/20 hover:text-yellow-300'
                            }`}
                            aria-label="打席結果を編集"
                          >
                            ✏️
                          </button>
                        )}

                        {onDelete && item.id && (
                          <button
                            type="button"
                            onClick={() => onDelete(Number(item.id))}
                            disabled={isProcessing || isSaving}
                            className="w-4 h-4 rounded bg-black/30 text-[11px] leading-none text-white disabled:opacity-30"
                            aria-label="打席履歴を削除"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className="bg-gray-950/80 border border-yellow-500/30 rounded-md px-2 py-1.5 flex flex-wrap gap-1">
                        {EDIT_OPTIONS.map((opt) => (
                          <button
                            key={opt.result_detail}
                            type="button"
                            onClick={() => handleEdit(Number(item.id), opt)}
                            disabled={isSaving}
                            className="text-[10px] font-black px-2 py-1 rounded-lg border border-gray-700 bg-gray-800 text-gray-200
                                       hover:bg-yellow-500/20 hover:border-yellow-500/50 hover:text-yellow-200
                                       active:scale-95 transition-all disabled:opacity-40"
                          >
                            {isSaving ? '…' : opt.label}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          disabled={isSaving}
                          className="text-[10px] font-black px-2 py-1 rounded-lg border border-gray-700 bg-gray-900 text-gray-500
                                     hover:text-gray-300 active:scale-95 transition-all disabled:opacity-40 ml-auto"
                        >
                          閉じる
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
