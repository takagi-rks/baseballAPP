import React, { useEffect, useMemo, useState } from 'react';

interface CareerStat {
  player_id: number;
  name: string;
  uniform_number: string | number;
  games_played?: number;
  avg?: string | number;
  plate_appearances: number;
  at_bats: number;
  hits: number;
  home_runs?: number;
  rbi?: number;
  runs?: number;
  stolen_bases?: number;
  obp?: string | number;
  slg?: string | number;
  risp_avg?: string | number;
  ops?: string | number;
  doubles?: number;
  triples?: number;
  total_bases?: number;
  strikeouts?: number;
  walks?: number;
  hit_by_pitch?: number;
  sacrifices?: number;
  sacrifice_flies?: number;
  double_plays?: number;
  reached_on_error?: number;
  errors?: number;
  caught_stealing?: number;
  catcher_caught_stealing?: number;
}

type SortKey = keyof CareerStat;
type SortDir = 'asc' | 'desc';

const columns: { key: SortKey; label: string }[] = [
  { key: 'uniform_number', label: '背番号' },
  { key: 'name', label: '選手名' },
  { key: 'games_played', label: '試合数' },
  { key: 'avg', label: '打率' },
  { key: 'plate_appearances', label: '打席' },
  { key: 'at_bats', label: '打数' },
  { key: 'hits', label: '安打' },
  { key: 'home_runs', label: '本塁打' },
  { key: 'rbi', label: '打点' },
  { key: 'runs', label: '得点' },
  { key: 'stolen_bases', label: '盗塁' },
  { key: 'obp', label: '出塁率' },
  { key: 'slg', label: '長打率' },
  { key: 'risp_avg', label: '得点圏打率' },
  { key: 'ops', label: 'OPS' },
  { key: 'doubles', label: '二塁打' },
  { key: 'triples', label: '三塁打' },
  { key: 'total_bases', label: '塁打数' },
  { key: 'strikeouts', label: '三振' },
  { key: 'walks', label: '四球' },
  { key: 'hit_by_pitch', label: '死球' },
  { key: 'sacrifices', label: '犠打' },
  { key: 'sacrifice_flies', label: '犠飛' },
  { key: 'double_plays', label: '併殺打' },
  { key: 'reached_on_error', label: '敵失' },
  { key: 'errors', label: '失策' },
  { key: 'caught_stealing', label: '盗塁死' },
  { key: 'catcher_caught_stealing', label: '盗塁阻止' },
];

function toNumber(value: unknown): number {
  if (value === '-' || value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function displayValue(value: unknown): string | number {
  if (value === null || value === undefined) return 0;
  return value as string | number;
}

export const CareerStatsTable: React.FC = () => {
  const [stats, setStats] = useState<CareerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('ops');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    let ignore = false;

    const fetchStats = async () => {
      try {
        const resp = await fetch('/api/stats/career');
        const json = await resp.json();

        if (!ignore && json.success && Array.isArray(json.stats)) {
          setStats(json.stats);
        } else if (!ignore) {
          setStats([]);
        }
      } catch {
        if (!ignore) setStats([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchStats();

    return () => {
      ignore = true;
    };
  }, []);

  const sortedStats = useMemo(() => {
    const safeStats = Array.isArray(stats) ? [...stats] : [];

    return safeStats.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];

      let cmp: number;
      if (typeof av === 'string' && typeof bv === 'string' && (Number.isNaN(Number(av)) || Number.isNaN(Number(bv)))) {
        cmp = av.localeCompare(bv);
      } else {
        cmp = toNumber(av) - toNumber(bv);
      }

      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [stats, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500 py-8">通算成績を読み込み中...</div>;
  }

  if (sortedStats.length === 0) {
    return <div className="text-center text-gray-500 py-8">通算成績データがありません</div>;
  }

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-4 py-3 border-b border-gray-800">
        <h2 className="text-sm font-black text-gray-100">通算成績</h2>
        <p className="text-[11px] text-gray-500 mt-1">Teams ONE転記用の集計表です。列名を押すと並び替えできます。</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1800px] w-full text-xs whitespace-nowrap">
          <thead className="bg-gray-950/80 sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-3 py-3 text-center cursor-pointer select-none border-b border-gray-800 ${
                    sortKey === col.key ? 'text-blue-400' : 'text-gray-400'
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && <span>{sortDir === 'asc' ? '▲' : '▼'}</span>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedStats.map((row) => (
              <tr key={row.player_id} className="border-b border-gray-800/60 hover:bg-gray-800/50">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-3 text-center ${
                      col.key === 'name' ? 'text-left font-bold text-white sticky left-0 bg-gray-900' : 'text-gray-300'
                    } ${col.key === 'ops' || col.key === 'avg' ? 'font-black text-blue-300' : ''}`}
                  >
                    {displayValue(row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
