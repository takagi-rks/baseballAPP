import React, { useEffect, useMemo, useState } from 'react';

interface PositionHistoryRow {
  player_id: number;
  name: string;
  uniform_number: string | number;
  position: string;
  games: number;
}

export const PositionHistory: React.FC = () => {
  const [rows, setRows] = useState<PositionHistoryRow[]>([]);

  useEffect(() => {
    const fetchRows = async () => {
      const resp = await fetch('/api/position-histories', { cache: 'no-store' });
      const json = await resp.json();
      if (json.success && Array.isArray(json.histories)) {
        setRows(json.histories);
      }
    };

    fetchRows().catch(() => setRows([]));
  }, []);

  const grouped = useMemo(() => {
    return rows.reduce<Record<string, PositionHistoryRow[]>>((acc, row) => {
      const key = `${row.uniform_number} ${row.name}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {});
  }, [rows]);

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-2 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
          ポジション履歴
        </h2>
      </div>

      {rows.length === 0 ? (
        <div className="text-[11px] text-gray-600">データなし</div>
      ) : (
        <div className="space-y-1">
          {Object.entries(grouped).map(([playerLabel, items]) => (
            <div key={playerLabel} className="bg-gray-950/50 border border-gray-800 rounded-lg px-2 py-1">
              <div className="text-[11px] font-black text-white mb-1 truncate">
                #{playerLabel}
              </div>
              <div className="flex flex-wrap gap-1">
                {items.map((item) => (
                  <span
                    key={`${item.player_id}-${item.position}`}
                    className="text-[10px] text-gray-300 bg-gray-800 rounded-md px-2 py-0.5"
                  >
                    {item.position} {item.games}試合
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
