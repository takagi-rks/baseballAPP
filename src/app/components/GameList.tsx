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
  onNewGame,
  isProcessing
}) => {
  return (
    <div className="bg-gray-800/10 rounded-xl p-2 border border-gray-700/30">
      <div className="flex justify-between items-center mb-1.5">
        <h2 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.18em]">
          過去の試合
        </h2>
        <button
          onClick={onNewGame}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-md active:scale-95 disabled:opacity-50"
        >
          新規
        </button>
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
        {games.map((game) => {
          const isCurrent = currentGameId === game.id;
          const date = game.game_date
            ? new Date(game.game_date).toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' })
            : '--/--';

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
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[9px] text-gray-500 font-mono shrink-0">{date}</span>
                  <span className="text-[11px] font-black text-gray-100 truncate">
                    vs {game.opponent || '練習試合'}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {game.location && (
                    <span className="text-[9px] text-gray-500 max-w-[72px] truncate">
                      {game.location}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[9px] font-black text-blue-300">
                      選択中
                    </span>
                  )}
                </div>
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
