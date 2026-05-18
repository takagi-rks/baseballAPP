import React from 'react';
import { Player, PlateAppearance } from '../types';

interface RecentPlateAppearancesProps {
  recentHistory: PlateAppearance[];
  players: Player[];
}

export const RecentPlateAppearances: React.FC<RecentPlateAppearancesProps> = ({
  recentHistory,
  players
}) => {
  return (
    <div className="mt-12 bg-gray-800/30 rounded-3xl p-5 border border-gray-700/50 shadow-2xl">
      <h2 className="text-gray-400 text-[10px] font-bold mb-5 uppercase tracking-[0.2em] flex items-center">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
        直近の入力履歴
      </h2>
      <div className="space-y-3">
        {recentHistory.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/40">
            <p className="text-gray-600 text-xs italic">履歴はまだありません</p>
          </div>
        ) : (
          recentHistory.map((item) => {
            const player = players.find(p => String(p.id) === String(item.player_id));
            return (
              <div key={item.id} className="bg-gray-900/60 border border-gray-700/30 rounded-2xl p-4 flex items-center justify-between shadow-lg transition-transform active:scale-[0.98]">
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] text-blue-400 font-black uppercase">{item.inning}回裏</span>
                    <span className="text-[10px] text-gray-600">•</span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="text-sm font-black text-gray-100">
                    <span className="text-gray-500 mr-1.5">#{player?.uniform_number || '?'}</span>
                    {player?.name || '不明'}
                  </span>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-tighter shadow-sm border ${
                    item.result_category === 'HIT' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    item.result_category === 'WALK' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                    item.result_category === 'SACRIFICE' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-gray-800/50 text-gray-400 border-gray-700/50'
                  }`}>
                    {item.result_detail.replace('_', ' ')}
                  </span>
                  {(item.rbi > 0 || item.runs > 0) && (
                    <div className="flex space-x-1.5 mt-2">
                      {item.rbi > 0 && <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-lg font-black shadow-inner">RBI {item.rbi}</span>}
                      {item.runs > 0 && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-lg font-black shadow-inner">RUN</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
