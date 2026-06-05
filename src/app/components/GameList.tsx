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
    <div className="bg-gray-800/10 rounded-2xl p-2 border border-gray-700/30">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
          過去の試合
        </h2>
        <button
          onClick={onNewGame}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-blue-400/30 active:scale-95 transition-all disabled:opacity-50"
        >
          新規
        </button>
      </div>

      <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
        {games.map((game) => {
          const isCurrent = currentGameId === game.id;
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => onSelectGame(game.id)}
              disabled={isProcessing || isCurrent}
              className={`w-full rounded-lg border px-2 py-1.5 text-left transition-all disabled:opacity-80 ${
                isCurrent
                  ? 'bg-blue-600/15 border-blue-500/60'
                  : 'bg-gray-900/40 border-gray-700/50 active:scale-[0.99]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] font-black text-gray-100 truncate">
                    vs {game.opponent || '練習試合'}
                  </div>
                  <div className="text-[9px] text-gray-500 truncate">
                    {game.game_date ? new Date(game.game_date).toLocaleDateString() : '日付不明'}
                    {game.location ? ` / ${game.location}` : ''}
                  </div>
                </div>

                {isCurrent && (
                  <span className="text-[9px] font-black text-blue-300 shrink-0">
                    選択中
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {games.length === 0 && (
          <div className="text-center py-4 border border-dashed border-gray-800 rounded-xl">
            <p className="text-gray-700 text-xs italic">試合データなし</p>
          </div>
        )}
      </div>
    </div>
  );
};
