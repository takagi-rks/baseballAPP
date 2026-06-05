import React, { useEffect, useMemo, useState } from 'react';

interface CareerStat {
  player_id: number;
  name: string;
  uniform_number: string | number;
  at_bats: number;
  avg: string;
}

export const BattingAverageTop5: React.FC = () => {
  const [stats, setStats] = useState<CareerStat[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const resp = await fetch('/api/stats/career', { cache: 'no-store' });
      const json = await resp.json();
      if (json.success && Array.isArray(json.stats)) setStats(json.stats);
    };
    fetchStats().catch(() => setStats([]));
  }, []);

  const top5 = useMemo(() => {
    return [...stats]
      .filter((row) => Number(row.at_bats || 0) > 0)
      .sort((a, b) => Number(b.avg) - Number(a.avg))
      .slice(0, 5);
  }, [stats]);

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-2 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
          打率ランキング TOP5
        </h2>
      </div>

      {top5.length === 0 ? (
        <div className="text-[11px] text-gray-600">データなし</div>
      ) : (
        <div className="space-y-1">
          {top5.map((row, index) => (
            <div
              key={row.player_id}
              className="bg-gray-950/50 border border-gray-800 rounded-lg px-2 py-1 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] font-black text-amber-300 w-5">
                  {index + 1}
                </span>
                <span className="text-[11px] font-black text-white truncate">
                  #{row.uniform_number} {row.name}
                </span>
              </div>
              <span className="text-[12px] font-black text-blue-300 font-mono">
                {row.avg}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
