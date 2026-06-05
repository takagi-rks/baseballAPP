import React, { useEffect, useState } from 'react';

interface GameSummary {
  id: number;
  opponent: string;
  location?: string;
  status: 'in_progress' | 'completed';
  game_date?: string;
  score_us: number;
  score_them: number;
  hits: number;
  home_runs: number;
  rbi: number;
  mvp_player_id: number;
  mvp_name: string;
  mvp_number: string;
  mvp_score: number;
}

function resultLabel(us: number, them: number): string {
  if (us > them) return '勝利';
  if (us < them) return '敗戦';
  return '引分';
}

function resultClass(us: number, them: number): string {
  if (us > them) return 'text-blue-300';
  if (us < them) return 'text-red-300';
  return 'text-gray-300';
}

export const GameSummaryHistory: React.FC = () => {
  const [summaries, setSummaries] = useState<GameSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const resp = await fetch('/api/games/summaries', { cache: 'no-store' });
        const json = await resp.json();
        if (json.success) {
          setSummaries(Array.isArray(json.summaries) ? json.summaries : []);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-2 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
          試合別サマリー履歴
        </h2>
        <span className="text-[9px] text-gray-600">最新30件</span>
      </div>

      {isLoading ? (
        <div className="text-[11px] text-gray-600 py-2">読み込み中...</div>
      ) : summaries.length === 0 ? (
        <div className="text-[11px] text-gray-600 py-2">試合履歴がありません</div>
      ) : (
        <div className="space-y-1.5">
          {summaries.map((game) => (
            <div
              key={game.id}
              className="bg-gray-950/50 border border-gray-800 rounded-xl px-2 py-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] font-black text-white truncate">
                    vs {game.opponent || '練習試合'}
                  </div>
                  <div className="text-[9px] text-gray-500 truncate">
                    {game.location || '球場未設定'}
                    {game.status === 'completed' ? ' / FIN' : ' / LIVE'}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-[11px] font-black ${resultClass(game.score_us, game.score_them)}`}>
                    {resultLabel(game.score_us, game.score_them)}
                  </div>
                  <div className="text-sm font-black text-white font-mono">
                    {game.score_us}-{game.score_them}
                  </div>
                </div>
              </div>

              <div className="mt-1 flex items-center justify-between gap-2 text-[10px]">
                <div className="flex gap-2 text-gray-400">
                  <span>H {game.hits}</span>
                  <span>HR {game.home_runs}</span>
                  <span>RBI {game.rbi}</span>
                </div>

                {game.mvp_name && (
                  <div className="text-amber-300 font-black truncate">
                    MVP #{game.mvp_number} {game.mvp_name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
