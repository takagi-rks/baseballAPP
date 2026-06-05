import React from 'react';
import { Player, PlayerStat } from '../types';

interface PlayerStatsRankingProps {
  playerStats: PlayerStat[];
  players: Player[];
  onExportCSV: () => void;
  isProcessing: boolean;
}

export const PlayerStatsRanking: React.FC<PlayerStatsRankingProps> = ({
  playerStats,
  players,
  onExportCSV,
  isProcessing
}) => {
  return (
    <div className="mt-12">
      <h2 className="text-gray-400 text-[10px] font-bold mb-4 uppercase tracking-[0.2em] flex items-center justify-between">
        <div className="flex items-center">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
          個人成績ランキング (OPS順)
        </div>
        <button 
          onClick={onExportCSV}
          disabled={isProcessing || playerStats.length === 0}
          className="bg-green-600/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter active:bg-green-500/30 transition-all disabled:opacity-30 flex items-center"
        >
          📥 CSV出力
        </button>
      </h2>
      
      <div className="bg-gray-800/20 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-gray-800/40 text-gray-500 font-bold border-b border-gray-700/50">
              <th className="px-4 py-3 font-mono">RANK</th>
              <th className="px-2 py-3">PLAYER</th>
              <th className="px-2 py-3 text-center">AVG</th>
              <th className="px-4 py-3 text-right">OPS</th>
            </tr>
          </thead>
          <tbody>
            {[...playerStats]
              .sort((a, b) => parseFloat(b.ops) - parseFloat(a.ops))
              .map((stat, index) => {
                const player = players.find(p => String(p.id) === String(stat.player_id));
                return (
                  <tr key={stat.player_id} className={`border-b border-gray-700/30 transition-colors hover:bg-white/5 ${index === 0 ? 'bg-amber-500/5' : ''}`}>
                    <td className="px-4 py-2 font-mono font-bold text-gray-500">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-100">{player?.name || '不明'}</span>
                        <span className="text-[9px] text-gray-500 leading-tight">{stat.pa}打席 {stat.h}安打 {stat.rbi}打点</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center font-mono text-gray-300">
                      <span className={parseFloat(stat.avg) >= 0.3 ? 'text-green-400 font-bold' : ''}>{stat.avg}</span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className={`font-mono font-black text-sm ${parseFloat(stat.ops) >= 1.0 ? 'text-amber-400' : parseFloat(stat.ops) >= 0.8 ? 'text-blue-400' : 'text-gray-200'}`}>
                        {stat.ops}
                      </span>
                    </td>
                  </tr>
                );
              })}
            {playerStats.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-600 italic">
                  <div className="flex flex-col items-center">
                    <p>成績データはありません</p>
                    <span className="text-[9px] mt-1 uppercase tracking-widest opacity-50">Empty dataset</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
