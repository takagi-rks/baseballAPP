import React from 'react';

interface InningScore {
  inning: number;
  runs: number;
}

interface ScoreboardProps {
  scores?: InningScore[];
  opponentScores?: InningScore[];
  battingSide?: 'TOP' | 'BOTTOM';
}

function getRun(scores: InningScore[] | undefined, inning: number): number {
  if (!Array.isArray(scores)) return 0;
  return scores.find((s) => Number(s.inning) === inning)?.runs || 0;
}

function totalRuns(scores: InningScore[] | undefined): number {
  if (!Array.isArray(scores)) return 0;
  return scores.reduce((sum, score) => sum + Number(score.runs || 0), 0);
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  scores = [],
  opponentScores = [],
  battingSide = 'TOP',
}) => {
  const rows = battingSide === 'TOP'
    ? [
        { label: '自分', scores, accent: 'text-blue-400' },
        { label: '相手', scores: opponentScores, accent: 'text-red-400' },
      ]
    : [
        { label: '相手', scores: opponentScores, accent: 'text-red-400' },
        { label: '自分', scores, accent: 'text-blue-400' },
      ];

  return (
    <div className="bg-black/40 border border-gray-700/50 rounded-xl overflow-hidden mb-6 shadow-2xl">
      <div className="grid grid-cols-[64px_repeat(7,1fr)_48px] text-[10px] text-gray-500 font-bold border-b border-gray-800 bg-gray-800/30 uppercase tracking-tighter">
        <div className="text-center py-2 border-r border-gray-800">チーム</div>
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="text-center py-2 border-r border-gray-800">
            {i}
          </div>
        ))}
        <div className="text-center py-2 bg-gray-700/30 text-gray-300 font-black">
          R
        </div>
      </div>

      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[64px_repeat(7,1fr)_48px] text-sm font-black font-mono border-b border-gray-800 last:border-b-0"
        >
          <div className={`text-center py-3 border-r border-gray-800 font-black ${row.accent}`}>
            {row.label}
          </div>

          {[1, 2, 3, 4, 5, 6, 7].map((inning) => {
            const run = getRun(row.scores, inning);
            return (
              <div
                key={inning}
                className="text-center py-3 border-r border-gray-800 text-gray-100 italic"
              >
                {run > 0 ? run : <span className="text-gray-700 text-xs font-normal">0</span>}
              </div>
            );
          })}

          <div className={`text-center py-3 bg-blue-600/10 border-l border-blue-500/20 ${row.accent}`}>
            {totalRuns(row.scores)}
          </div>
        </div>
      ))}
    </div>
  );
};
