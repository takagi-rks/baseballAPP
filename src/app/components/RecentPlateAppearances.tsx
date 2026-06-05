import React from 'react';
import type { PlateAppearance, Player } from '../types';

interface RecentPlateAppearancesProps {
  recentHistory: PlateAppearance[];
  players: Player[];
  title?: string;
  onDelete?: (id: number) => void;
  isProcessing?: boolean;
}

function getResultLabel(item: any): string {
  const map: Record<string, string> = {
    SINGLE: '単打',
    DOUBLE: '二塁打',
    TRIPLE: '三塁打',
    HOME_RUN: '本塁打',

    WALK: '四球',
    HIT_BY_PITCH: '死球',

    STRIKEOUT: '三振',
    GROUND_OUT: 'ゴロ',
    FLY_OUT: 'フライ',

    SAC_BUNT: '犠打',
    SAC_FLY: '犠飛',
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
  if (Number(item.rbi || 0) > 0) {
    return 'bg-amber-500/20 border-amber-500/40 text-amber-200';
  }

  if (item.result_detail === 'HOME_RUN') {
    return 'bg-red-500/20 border-red-500/40 text-red-200';
  }

  if (['SINGLE', 'DOUBLE', 'TRIPLE'].includes(item.result_detail)) {
    return 'bg-blue-500/20 border-blue-500/40 text-blue-200';
  }

  if (
    item.result_category === 'WALK' ||
    item.result_detail === 'HIT_BY_PITCH' ||
    item.result_detail === 'WALK'
  ) {
    return 'bg-green-500/20 border-green-500/40 text-green-200';
  }

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
  isProcessing = false,
}) => {
  const safeHistory = Array.isArray(recentHistory) ? recentHistory.slice(0, 10) : [];

  if (safeHistory.length === 0) {
    return (
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-2">
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
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
          {title}
        </h3>
        <span className="text-[9px] text-gray-600">×で削除→再入力</span>
      </div>

      <div className="space-y-2">
        {Object.entries(grouped).map(([inningLabel, items]) => (
          <div key={inningLabel}>
            <div className="text-[9px] text-gray-500 font-black mb-1">
              {inningLabel}
            </div>

            <div className="grid grid-cols-2 gap-1">
              {items.map((item: any, index) => {
                const player = players.find((p) => Number(p.id) === Number(item.player_id));
                return (
                  <div
                    key={item.id || index}
                    className={`border rounded-lg px-2 py-1 flex items-center justify-between gap-1 ${getResultClass(item)}`}
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

                      {onDelete && item.id && (
                        <button
                          type="button"
                          onClick={() => onDelete(Number(item.id))}
                          disabled={isProcessing}
                          className="w-4 h-4 rounded bg-black/30 text-[10px] leading-none text-white disabled:opacity-30"
                          aria-label="打席履歴を削除"
                        >
                          ×
                        </button>
                      )}
                    </div>
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
