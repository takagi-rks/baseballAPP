import React from 'react';

interface ScoreboardProps {
  scores: { inning: number; runs: number }[];
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ scores }) => {
  const total = scores.reduce((acc, curr) => acc + curr.runs, 0);
  
  return (
    <div className="bg-black/40 border border-gray-700/50 rounded-xl overflow-hidden mb-6 shadow-2xl">
      <div className="flex text-[10px] text-gray-500 font-bold border-b border-gray-800 bg-gray-800/30 uppercase tracking-tighter">
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={i} className="flex-1 text-center py-1 border-r border-gray-800 last:border-0">{i}回</div>
        ))}
        <div className="w-10 text-center py-1 bg-gray-700/30 text-gray-300 font-black">合計</div>
      </div>
      <div className="flex text-xl font-black font-mono">
        {[1, 2, 3, 4, 5, 6, 7].map(i => {
          const score = scores.find(s => s.inning === i)?.runs || 0;
          return (
            <div key={i} className="flex-1 text-center py-3 border-r border-gray-800 last:border-0 text-gray-100 italic">
              {score > 0 ? score : <span className="text-gray-800 text-sm font-normal">0</span>}
            </div>
          );
        })}
        <div className="w-10 text-center py-3 bg-blue-600/20 text-blue-400 border-l border-blue-500/30">
          {total}
        </div>
      </div>
    </div>
  );
};
