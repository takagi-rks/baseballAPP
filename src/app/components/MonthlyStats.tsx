import React, { useEffect, useState } from 'react';

interface MonthlyStat {
  month: string;
  games: number;
  plate_appearances: number;
  at_bats: number;
  hits: number;
  home_runs: number;
  rbi: number;
  avg: string;
  slg: string;
}

export const MonthlyStats: React.FC = () => {
  const [monthly, setMonthly] = useState<MonthlyStat[]>([]);

  useEffect(() => {
    const fetchMonthly = async () => {
      const resp = await fetch('/api/stats/monthly', { cache: 'no-store' });
      const json = await resp.json();
      if (json.success && Array.isArray(json.monthly)) setMonthly(json.monthly);
    };
    fetchMonthly().catch(() => setMonthly([]));
  }, []);

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-2 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
          月別成績
        </h2>
      </div>

      {monthly.length === 0 ? (
        <div className="text-[11px] text-gray-600">データなし</div>
      ) : (
        <div className="space-y-1">
          {monthly.map((row) => (
            <div
              key={row.month}
              className="bg-gray-950/50 border border-gray-800 rounded-lg px-2 py-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-white">{row.month}</span>
                <span className="text-[10px] text-gray-400">{row.games}試合</span>
              </div>
              <div className="grid grid-cols-5 gap-1 mt-1 text-center text-[10px]">
                <span className="text-blue-300 font-black">AVG {row.avg}</span>
                <span className="text-gray-300">H {row.hits}</span>
                <span className="text-gray-300">HR {row.home_runs}</span>
                <span className="text-gray-300">RBI {row.rbi}</span>
                <span className="text-gray-300">SLG {row.slg}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
