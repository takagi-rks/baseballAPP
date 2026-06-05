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

function getRun(scores: InningScore[] | undefined, inning: number, maxInning: number): number | null {
  if (!Array.isArray(scores)) return null;
  const row = scores.find((s) => Number(s.inning) === inning);
  if (row) return Number(row.runs || 0);
  return inning <= maxInning ? 0 : null;
}

function getMaxInning(scores: InningScore[] | undefined): number {
  if (!Array.isArray(scores) || scores.length === 0) return 0;
  return Math.max(...scores.map((s) => Number(s.inning)));
}

function totalRuns(scores: InningScore[] | undefined): number {
  if (!Array.isArray(scores)) return 0;
  return scores.reduce((sum, s) => sum + Number(s.runs || 0), 0);
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  scores = [], opponentScores = [], battingSide = 'TOP',
}) => {
  const rows = battingSide === 'TOP'
    ? [{ label: '自分', scores, isUs: true }, { label: '相手', scores: opponentScores, isUs: false }]
    : [{ label: '相手', scores: opponentScores, isUs: false }, { label: '自分', scores, isUs: true }];

  return (
    <div className="bg-white border-b border-gray-200 overflow-x-auto">
      <table className="w-full border-collapse text-center" style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left text-[10px] font-semibold text-gray-400 py-2 pl-4 w-14">チーム</th>
            {[1,2,3,4,5,6,7].map(i => (
              <th key={i} className="text-[10px] font-semibold text-gray-400 py-2 w-8">{i}</th>
            ))}
            <th className="text-[10px] font-semibold text-gray-500 py-2 pr-4 w-10">R</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const maxInn = getMaxInning(row.scores);
            const total = totalRuns(row.scores);
            return (
              <tr key={row.label} className="border-b border-gray-100 last:border-b-0">
                <td className={`text-left text-xs font-bold py-2.5 pl-4 ${row.isUs ? 'text-blue-600' : 'text-red-500'}`}>
                  {row.label}
                </td>
                {[1,2,3,4,5,6,7].map(inning => {
                  const run = getRun(row.scores, inning, maxInn);
                  const hasScore = run !== null && run > 0;
                  return (
                    <td key={inning} className={`text-xs py-2.5 font-mono ${
                      run === null ? 'text-gray-200'
                        : hasScore
                          ? row.isUs ? 'text-blue-600 font-bold bg-blue-50' : 'text-red-500 font-bold bg-red-50'
                          : 'text-gray-300'
                    }`}>
                      {run === null ? '—' : run}
                    </td>
                  );
                })}
                <td className={`text-sm font-bold py-2.5 pr-4 font-mono ${row.isUs ? 'text-blue-600' : 'text-red-500'}`}>
                  {total}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
