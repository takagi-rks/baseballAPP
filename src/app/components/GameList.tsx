import React from 'react';
import { Game } from '../types';

interface GameListProps {
  games: Game[];
  currentGameId: number | null;
  onSelectGame: (id: number) => void;
  onNewGame: () => void;
  isProcessing: boolean;
}

export const GameList: React.FC<GameListProps> = ({
  games,
  currentGameId,
  onSelectGame,
  isProcessing
}) => {
  return (
    <div className="bg-gray-800/10 rounded-xl p-2 border border-gray-700/30">
      <div className="flex justify-between items-center mb-1.5">
        <h2 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.18em]">
          過去の試合
        </h2>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
        {games.map((game: any) => {
          const isCurrent = currentGameId === game.id;
          const date = game.game_date
            ? new Date(game.game_date).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })
            : '--/--';

          const tournament = game.tournament_name || game.tournament || game.memo || '大会名未設定';
          const opponent = game.opponent || '対戦相手未設定';
          const score =
            typeof game.score_us === 'number' && typeof game.score_them === 'number'
              ? `${game.score_us}-${game.score_them}`
              : '-';

          return (
            <button
              key={game.id}
              type="button"
              onClick={() => onSelectGame(game.id)}
              disabled={isProcessing || isCurrent}
              className={`w-full rounded-md border px-2 py-1 text-left transition-all disabled:opacity-80 ${
                isCurrent
                  ? 'bg-blue-600/15 border-blue-500/60'
                  : 'bg-gray-900/40 border-gray-700/50 active:scale-[0.99]'
              }`}
            >
              <div className="grid grid-cols-[38px_1fr_1fr_38px] items-center gap-1">
                <span className="text-[9px] text-gray-500 font-mono">
                  {date}
                </span>
                <span className="text-[10px] text-gray-300 font-bold truncate">
                  {tournament}
                </span>
                <span className="text-[10px] text-gray-100 font-black truncate">
                  vs {opponent}
                </span>
                <span className="text-[10px] text-blue-300 font-black text-right">
                  {score}
                </span>
              </div>
            </button>
          );
        })}

        {games.length === 0 && (
          <div className="text-center py-3 border border-dashed border-gray-800 rounded-lg">
            <p className="text-gray-700 text-xs italic">試合データなし</p>
          </div>
        )}
      </div>
    </div>
  );
};
