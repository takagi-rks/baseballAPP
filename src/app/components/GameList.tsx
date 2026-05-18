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
    <div className="mt-12 mb-8 bg-gray-800/10 rounded-2xl p-5 border border-gray-700/30">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
          試合一覧・切り替え
        </h2>
        <button 
          onClick={onNewGame}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black px-4 py-2 rounded-xl border border-blue-400/30 shadow-lg active:scale-95 transition-all disabled:opacity-50"
        >
          ➕ 新規試合
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {games.map((game) => (
          <div key={game.id} className={`p-4 rounded-2xl border transition-all shadow-md ${currentGameId === game.id ? 'bg-blue-600/10 border-blue-500/50 ring-1 ring-blue-500/50' : 'bg-gray-900/40 border-gray-700/50 hover:border-gray-600'}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-mono text-gray-500 tracking-tighter">GID:{String(game.id).padStart(4, '0')}</span>
                <h3 className="text-sm font-black text-gray-100 leading-tight">vs {game.opponent}</h3>
              </div>
              {currentGameId === game.id ? (
                <span className="bg-blue-600 text-[9px] font-black px-2.5 py-1 rounded-full text-white uppercase tracking-tighter shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  ACTIVE
                </span>
              ) : (
                <button 
                  onClick={() => onSelectGame(game.id)}
                  disabled={isProcessing}
                  className="text-[9px] font-black text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/20 disabled:opacity-30"
                >
                  この試合を開く
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4 text-[10px] text-gray-500 font-bold">
              <span className="flex items-center">
                📅 {new Date(game.game_date).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                🏟️ {game.location || '場所不明'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-widest border ${
                game.status === 'completed' ? 'border-gray-700 text-gray-500' : 'border-green-500/30 text-green-400'
              }`}>
                {game.status === 'completed' ? 'FIN' : 'Live'}
              </span>
            </div>
          </div>
        ))}
        {games.length === 0 && (
          <div className="text-center py-10 border border-dashed border-gray-800 rounded-2xl">
            <p className="text-gray-700 text-xs italic">試合データが見つかりません</p>
          </div>
        )}
      </div>
    </div>
  );
};
