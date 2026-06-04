import React from 'react';
import type { Player, PlateAppearance } from '../types';

interface RecentPlateAppearancesProps {
  recentHistory: PlateAppearance[];
  players: Player[];
  title?: string;
}

const resultLabelMap: Record<string, string> = {
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
  DOUBLE_PLAY: '併殺打',
  ERROR: '敵失',
};

const categoryStyle = (category: string) => {
  if (category === 'HIT') return 'bg-green-500/10 text-green-400 border-green-500/20';
  if (category === 'WALK') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (category === 'SACRIFICE') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
  if (category === 'OUT') return 'bg-gray-800/70 text-gray-400 border-gray-700/60';
  return 'bg-gray-800/50 text-gray-400 border-gray-700/50';
};

export const RecentPlateAppearances: React.FC<RecentPlateAppearancesProps> = ({
  recentHistory,
  players,
  title
}) => {
  const safeHistory = Array.isArray(recentHistory) ? recentHistory : [];
  const safePlayers = Array.isArray(players) ? players : [];

  return (
    <div className="mt-8 bg-gray-800/30 rounded-3xl p-5 border border-gray-700/50 shadow-2xl">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
          {title || '直近の入力履歴'}
        </h2>
        <span className="text-[10px] text-gray-600 font-bold">
          最新 {safeHistory.length} 件
        </span>
      </div>

      <div className="space-y-3">
        {safeHistory.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/40">
            <p className="text-gray-600 text-xs italic">履歴はまだありません</p>
          </div>
        ) : (
          safeHistory.map((item) => {
            const player = safePlayers.find((p) => String(p.id) === String(item.player_id));
            const resultLabel = resultLabelMap[item.result_detail] || item.result_detail.replace(/_/g, ' ');
            const inningHalfLabel = item.inning_half === 'BOTTOM' ? '裏' : '表';

            return (
              <div
                key={item.id}
                className="bg-gray-900/70 border border-gray-700/40 rounded-2xl p-4 shadow-lg transition-transform active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] text-blue-400 font-black bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg">
                        {item.inning}回{inningHalfLabel}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-sm font-black text-gray-100 truncate">
                      <span className="text-gray-500 mr-1.5">
                        #{player?.uniform_number ?? '?'}
                      </span>
                      {player?.name || item.player_name || '不明'}
                    </div>

                    <div className="text-[10px] text-gray-500 mt-1">
                      打順: {player?.batting_order ?? '-'}番 / 守備: {player?.position || '-'}
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end shrink-0">
                    <span className={`text-[11px] font-black px-3 py-1.5 rounded-xl shadow-sm border ${categoryStyle(item.result_category)}`}>
                      {resultLabel}
                    </span>

                    <div className="flex gap-1.5 mt-2">
                      {Number(item.rbi) > 0 && (
                        <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-lg font-black shadow-inner">
                          打点 {item.rbi}
                        </span>
                      )}
                      {Number(item.runs) > 0 && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-lg font-black shadow-inner">
                          得点 {item.runs}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
