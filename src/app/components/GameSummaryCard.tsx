import React from 'react';
import type { Game, Player, PlayerStat } from '../types';

interface Score {
  inning: number;
  runs: number;
}

interface GameSummaryCardProps {
  gameDetails: Game | null;
  scoreboard: Score[];
  opponentScoreboard: Score[];
  playerStats: PlayerStat[];
  players: Player[];
}

function totalRuns(scores: Score[]): number {
  return Array.isArray(scores)
    ? scores.reduce((sum, row) => sum + Number(row.runs || 0), 0)
    : 0;
}

function fmtAvg(value: number): string {
  if (!Number.isFinite(value)) return '.000';
  return value.toFixed(3).replace(/^0/, '');
}

export const GameSummaryCard: React.FC<GameSummaryCardProps> = ({
  gameDetails,
  scoreboard,
  opponentScoreboard,
  playerStats,
  players,
}) => {
  const totalUs = totalRuns(scoreboard);
  const totalThem = totalRuns(opponentScoreboard);

  const resultLabel =
    totalUs > totalThem ? '勝利' :
    totalUs < totalThem ? '敗戦' :
    '引き分け';

  const resultColor =
    totalUs > totalThem ? 'text-blue-400' :
    totalUs < totalThem ? 'text-red-400' :
    'text-gray-300';

  const battingSideLabel = gameDetails?.batting_side === 'BOTTOM' ? '後攻' : '先攻';

  const totals = Array.isArray(playerStats)
    ? playerStats.reduce(
        (acc, row: any) => {
          acc.atBats += Number(row.at_bats || row.ab || 0);
          acc.hits += Number(row.hits || 0);
          acc.homeRuns += Number(row.home_runs || row.hr || 0);
          acc.rbi += Number(row.rbi || 0);
          acc.walks += Number(row.walks || row.bb || 0);
          acc.totalBases += Number(row.total_bases || row.tb || 0);
          return acc;
        },
        {
          atBats: 0,
          hits: 0,
          homeRuns: 0,
          rbi: 0,
          walks: 0,
          totalBases: 0,
        }
      )
    : {
        atBats: 0,
        hits: 0,
        homeRuns: 0,
        rbi: 0,
        walks: 0,
        totalBases: 0,
      };

  const avg = totals.atBats > 0 ? totals.hits / totals.atBats : 0;
  const obpDenominator = totals.atBats + totals.walks;
  const obp = obpDenominator > 0 ? (totals.hits + totals.walks) / obpDenominator : 0;
  const slg = totals.atBats > 0 ? totals.totalBases / totals.atBats : 0;
  const ops = obp + slg;

  const mvp = Array.isArray(playerStats)
    ? [...playerStats]
        .map((row: any) => {
          const player = players.find((p) => Number(p.id) === Number(row.player_id));
          const score =
            Number(row.hits || row.h || 0) * 2 +
            Number(row.home_runs || row.hr || 0) * 5 +
            Number(row.rbi || 0) * 2 +
            Number(row.walks || row.bb || 0) +
            Number(row.runs || 0);

          return { row, player, score };
        })
        .sort((a, b) => b.score - a.score)[0]
    : null;

  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-3xl p-3 shadow-2xl">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.25em]">
            Game Summary
          </div>
          <h2 className="text-lg font-black text-white mt-1">
            vs {gameDetails?.opponent || '練習試合'}
          </h2>
          <p className="text-[11px] text-gray-500 mt-1">
            {battingSideLabel} / {gameDetails?.location || '球場未設定'}
          </p>
        </div>

        <div className="text-right">
          <div className={`text-2xl font-black ${resultColor}`}>{resultLabel}</div>
          <div className="text-sm font-mono font-black text-gray-300">
            {totalUs} - {totalThem}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">
            {gameDetails?.status === 'completed' ? 'FIN' : 'LIVE'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-gray-950/60 border border-gray-800 rounded-2xl p-3 text-center">
          <div className="text-[9px] text-gray-500 font-black mb-1">安打</div>
          <div className="text-xl font-black text-white">{totals.hits}</div>
        </div>
        <div className="bg-gray-950/60 border border-gray-800 rounded-2xl p-3 text-center">
          <div className="text-[9px] text-gray-500 font-black mb-1">本塁打</div>
          <div className="text-xl font-black text-white">{totals.homeRuns}</div>
        </div>
        <div className="bg-gray-950/60 border border-gray-800 rounded-2xl p-3 text-center">
          <div className="text-[9px] text-gray-500 font-black mb-1">打点</div>
          <div className="text-xl font-black text-white">{totals.rbi}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-gray-950/40 border border-gray-800 rounded-xl p-2 text-center">
          <div className="text-[9px] text-gray-500 font-black">AVG</div>
          <div className="text-sm font-black text-blue-300">{fmtAvg(avg)}</div>
        </div>
        <div className="bg-gray-950/40 border border-gray-800 rounded-xl p-2 text-center">
          <div className="text-[9px] text-gray-500 font-black">OBP</div>
          <div className="text-sm font-black text-blue-300">{fmtAvg(obp)}</div>
        </div>
        <div className="bg-gray-950/40 border border-gray-800 rounded-xl p-2 text-center">
          <div className="text-[9px] text-gray-500 font-black">SLG</div>
          <div className="text-sm font-black text-blue-300">{fmtAvg(slg)}</div>
        </div>
        <div className="bg-gray-950/40 border border-gray-800 rounded-xl p-2 text-center">
          <div className="text-[9px] text-gray-500 font-black">OPS</div>
          <div className="text-sm font-black text-amber-300">{fmtAvg(ops)}</div>
        </div>
      </div>

      {mvp?.player && mvp.score > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-2">
          <div className="text-[10px] text-blue-300 font-black uppercase tracking-[0.2em] mb-1">
            MVP候補
          </div>
          <div className="text-sm font-black text-white">
            #{mvp.player.uniform_number} {mvp.player.name}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            安打 {mvp.row.hits || mvp.row.h || 0} / 本塁打 {mvp.row.home_runs || mvp.row.hr || 0} / 打点 {mvp.row.rbi || 0}
          </div>
        </div>
      )}
    </div>
  );
};
