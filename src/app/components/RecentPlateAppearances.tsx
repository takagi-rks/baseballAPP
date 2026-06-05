import React from 'react';
import type { PlateAppearance, Player } from '../types';

interface RecentPlateAppearancesProps {
  recentHistory: PlateAppearance[];
  players: Player[];
  title?: string;
}

function getResultLabel(item: any): string {
  return (
    item.result_label ||
    item.result_detail_label ||
    item.result_detail ||
    item.result_category ||
    '-'
  );
}

export const RecentPlateAppearances: React.FC<RecentPlateAppearancesProps> = ({
  recentHistory,
  players,
  title = '直近履歴',
}) => {
  const safeHistory = Array.isArray(recentHistory) ? recentHistory.slice(0, 6) : [];

  if (safeHistory.length === 0) {
    return (
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-3">
        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">
          {title}
        </div>
        <div className="text-[11px] text-gray-600">履歴なし</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
          {title}
        </h3>
        <span className="text-[9px] text-gray-600">最新6件</span>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {safeHistory.map((item: any, index) => {
          const player = players.find((p) => Number(p.id) === Number(item.player_id));
          return (
            <div
              key={item.id || index}
              className="bg-gray-950/50 border border-gray-800 rounded-lg px-2 py-1.5 flex items-center justify-between gap-2"
            >
              <span className="text-[11px] text-gray-200 font-bold truncate">
                {player?.name || '不明'}
              </span>
              <span className="text-[10px] text-blue-300 font-black shrink-0">
                {getResultLabel(item)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
