'use client';

import React, { useState, useEffect } from 'react';
import type { Game, Player, PlayerStat } from '../types';

interface GameStatsTableProps {
  games: Game[];
  players: Player[];
  initialGameId: number | null;
}

export const GameStatsTable: React.FC<GameStatsTableProps> = ({
  games,
  players,
  initialGameId,
}) => {
  const [selectedGameId, setSelectedGameId] = useState<number | null>(initialGameId);
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedGameId(initialGameId);
  }, [initialGameId]);

  useEffect(() => {
    if (!selectedGameId) return;
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/stats/players?game_id=${selectedGameId}`);
        const json = await res.json();
        if (json.success) {
          setStats(Array.isArray(json.stats) ? json.stats : []);
        } else {
          setStats([]);
        }
      } catch {
        setStats([]);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [selectedGameId]);

  const selectedGame = games.find((g) => g.id === selectedGameId);

  const sortedStats = [...stats].sort((a, b) => {
    const pa = players.find((p) => String(p.id) === String(a.player_id));
    const pb = players.find((p) => String(p.id) === String(b.player_id));
    return (pa?.batting_order ?? 99) - (pb?.batting_order ?? 99);
  });

  const fmtAvg = (v: string | number) => {
    const n = parseFloat(String(v));
    if (isNaN(n)) return '.---';
    return n === 0 ? '.000' : n.toFixed(3).replace(/^0/, '');
  };

  const opsColor = (v: string | number) => {
    const n = parseFloat(String(v));
    if (n >= 1.0) return 'text-amber-400';
    if (n >= 0.8) return 'text-blue-400';
    if (n >= 0.6) return 'text-gray-300';
    return 'text-gray-500';
  };

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 bg-gray-900/60">
        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
          打者成績
        </span>
        <select
          value={selectedGameId ?? ''}
          onChange={(e) => setSelectedGameId(Number(e.target.value))}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-[11px] font-bold rounded-lg px-2 py-1 outline-none focus:border-blue-500 max-w-[180px] truncate"
        >
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.opponent || '練習試合'}
              {g.game_date
                ? `\u3000${new Date(g.game_date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}`
                : `\u3000#${g.id}`}
              {g.status === 'completed' ? '\u3000\u2713' : '\u3000\u25cf'}
            </option>
          ))}
        </select>
      </div>

      {selectedGame && (
        <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-950/40 border-b border-gray-800/50 text-[10px] text-gray-500">
          <span>\uD83C\uDFDF\uFE0F {selectedGame.location || '球場未設定'}</span>
          <span className={`px-1.5 py-0.5 rounded border text-[9px] font-black uppercase ${
            selectedGame.status === 'completed'
              ? 'border-gray-700 text-gray-600'
              : 'border-green-500/30 text-green-400'
          }`}>
            {selectedGame.status === 'completed' ? 'FIN' : 'LIVE'}
          </span>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-[11px] text-gray-600">\u8AAD\u307F\u8FBC\u307F\u4E2D...</div>
      ) : sortedStats.length === 0 ? (
        <div className="py-8 text-center text-[11px] text-gray-600 italic">
          \u3053\u306E\u8A66\u5408\u306E\u6253\u5E2D\u30C7\u30FC\u30BF\u306F\u3042\u308A\u307E\u305B\u3093
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-gray-800/40 text-gray-500 font-black uppercase tracking-wider border-b border-gray-800">
                <th className="text-left px-3 py-2 w-[40%]">\u9078\u624B</th>
                <th className="text-center px-1 py-2">\u6253\u5E2D</th>
                <th className="text-center px-1 py-2">\u5B89\u6253</th>
                <th className="text-center px-1 py-2">\u6253\u70B9</th>
                <th className="text-center px-1 py-2">\u5F97\u70B9</th>
                <th className="text-center px-1 py-2">\u6253\u7387</th>
                <th className="text-center px-2 py-2">OPS</th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map((stat, i) => {
                const player = players.find((p) => String(p.id) === String(stat.player_id));
                const ops = (parseFloat(stat.obp) + parseFloat(stat.slg)).toFixed(3);
                return (
                  <tr
                    key={stat.player_id}
                    className={`border-b border-gray-800/50 transition-colors ${
                      i % 2 === 0 ? 'bg-transparent' : 'bg-gray-900/20'
                    }`}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-blue-500 w-4 text-center shrink-0">
                          {player?.batting_order ?? '-'}
                        </span>
                        <div className="min-w-0">
                          <span className="text-gray-500 text-[9px] mr-1">
                            #{player?.uniform_number ?? '?'}
                          </span>
                          <span className="font-bold text-gray-100 truncate">
                            {player?.name ?? '\u4E0D\u660E'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-1 py-2 text-gray-400 font-mono">{stat.pa}</td>
                    <td className="text-center px-1 py-2 font-mono">
                      <span className={Number(stat.h) > 0 ? 'text-blue-400 font-black' : 'text-gray-600'}>
                        {stat.h}
                      </span>
                    </td>
                    <td className="text-center px-1 py-2 font-mono">
                      <span className={Number(stat.rbi) > 0 ? 'text-amber-400 font-black' : 'text-gray-600'}>
                        {stat.rbi}
                      </span>
                    </td>
                    <td className="text-center px-1 py-2 font-mono">
                      <span className={Number(stat.runs) > 0 ? 'text-green-400 font-black' : 'text-gray-600'}>
                        {stat.runs}
                      </span>
                    </td>
                    <td className="text-center px-1 py-2 font-mono text-gray-300">
                      {fmtAvg(stat.avg)}
                    </td>
                    <td className={`text-center px-2 py-2 font-mono font-black ${opsColor(ops)}`}>
                      {fmtAvg(ops)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-700 bg-gray-800/30 text-gray-400 font-black text-[10px]">
                <td className="px-3 py-2 text-gray-500 uppercase tracking-wider">\u5408\u8A08</td>
                <td className="text-center px-1 py-2 font-mono">
                  {sortedStats.reduce((s, r) => s + Number(r.pa), 0)}
                </td>
                <td className="text-center px-1 py-2 font-mono text-blue-400">
                  {sortedStats.reduce((s, r) => s + Number(r.h), 0)}
                </td>
                <td className="text-center px-1 py-2 font-mono text-amber-400">
                  {sortedStats.reduce((s, r) => s + Number(r.rbi), 0)}
                </td>
                <td className="text-center px-1 py-2 font-mono text-green-400">
                  {sortedStats.reduce((s, r) => s + Number(r.runs), 0)}
                </td>
                <td className="text-center px-1 py-2 text-gray-600">\u2014</td>
                <td className="text-center px-2 py-2 text-gray-600">\u2014</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
