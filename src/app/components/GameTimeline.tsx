import React from 'react';
import type { InningTimelineGroup } from '../types';

interface GameTimelineProps {
  timeline: InningTimelineGroup[];
}

export const GameTimeline: React.FC<GameTimelineProps> = ({ timeline }) => {
  const getBadgeStyle = (category: string, detail: string) => {
    if (detail === 'HOME_RUN') {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)] font-black';
    }
    if (category === 'HIT') {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20 font-black';
    }
    if (category === 'OUT') {
      return 'bg-gray-850/60 text-gray-500 border-gray-700/30 font-medium';
    }
    if (category === 'WALK') {
      return 'bg-teal-500/10 text-teal-400 border-teal-500/20 font-semibold';
    }
    return 'bg-gray-850/20 text-gray-400 border-gray-700/20 font-semibold';
  };

  const getResultLabel = (detail: string) => {
    return detail.replace('_', ' ');
  };

  // 変更理由: 表裏ラベルを日本語で表示
  const getInningLabel = (inning: number, inning_half: 'TOP' | 'BOTTOM') => {
    return `${inning}回${inning_half === 'TOP' ? '表' : '裏'}`;
  };

  return (
    <div className="mt-8 bg-gray-950/40 rounded-3xl p-3 border border-gray-900/50 shadow-2xl">
      <h2 className="text-gray-400 text-[10px] font-bold mb-6 uppercase tracking-[0.2em] flex items-center">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
        試合経過タイムライン
      </h2>

      {timeline.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/10">
          <p className="text-gray-600 text-xs italic">試合経過データはまだありません</p>
        </div>
      ) : (
        <div className="relative border-l border-gray-900 ml-3 pl-6 space-y-8">
          {timeline.map((group) => (
            <div key={`${group.inning}-${group.inning_half}`} className="relative">
              <div className="absolute -left-[42px] top-0 bg-gray-900 border border-gray-800 rounded-lg px-2 py-0.5 text-[9px] font-black text-gray-400 shadow-md whitespace-nowrap">
                {getInningLabel(group.inning, group.inning_half ?? 'TOP')}
              </div>

              <div className="space-y-4 pt-1">
                {group.events.map((event) => {
                  const hasPoints = event.rbi > 0 || event.runs > 0;
                  const isHomeRun = event.result_detail === 'HOME_RUN';

                  return (
                    <div
                      key={event.id}
                      className={`relative bg-gray-900/50 border rounded-2xl p-2 transition-all duration-200 shadow-md hover:scale-[1.01] ${
                        hasPoints
                          ? 'border-red-500/40 bg-gradient-to-r from-red-950/10 to-gray-900/50 shadow-[0_0_15px_rgba(239,68,68,0.07)]'
                          : isHomeRun
                          ? 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                          : 'border-gray-800/60 hover:border-gray-700/80'
                      }`}
                    >
                      <div className={`absolute -left-[29px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border ${
                        isHomeRun ? 'bg-amber-400 border-amber-500/40' :
                        event.result_category === 'HIT' ? 'bg-blue-400 border-blue-500/40' :
                        event.result_category === 'OUT' ? 'bg-gray-600 border-gray-700/40' :
                        'bg-teal-400 border-teal-500/40'
                      }`} />

                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2 mb-1.5">
                            <span className="text-[10px] text-gray-500 font-bold">
                              {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <span className="text-sm font-black text-gray-100 flex items-center">
                            <span className="text-gray-500 mr-2 text-[10px] font-mono">#{event.uniform_number || '?'}</span>
                            {event.player_name}
                          </span>
                        </div>

                        <div className="flex flex-col items-end space-y-1.5">
                          <span className={`text-[9px] font-bold px-2.5 py-1 rounded-xl uppercase tracking-wider border ${getBadgeStyle(event.result_category, event.result_detail)}`}>
                            {getResultLabel(event.result_detail)}
                          </span>

                          {hasPoints && (
                            <div className="flex space-x-1">
                              {event.rbi > 0 && (
                                <span className="text-[8px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-lg font-black uppercase tracking-widest animate-pulse">
                                  打点 {event.rbi}
                                </span>
                              )}
                              {event.runs > 0 && (
                                <span className="text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-lg font-black uppercase tracking-widest shadow-sm">
                                  生還
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
