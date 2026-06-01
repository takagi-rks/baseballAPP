import React from 'react';
import { Player } from '../types';

interface ScoreInputPanelProps {
  inning: number;
  inningHalf: 'TOP' | 'BOTTOM';
  outs: number;
  bases: { [key: number]: boolean };
  battingOrder: number;
  selectedPlayer: string;
  onPlayerChange: (pid: string) => void;
  players: Player[];
  rbi: number;
  setRbi: (v: number) => void;
  runs: number;
  setRuns: (v: number) => void;
  onResultTap: (option: any) => void;
  onUndo: () => void;
  lastInsertedId: number | null;
  isProcessing: boolean;
  resultOptions: any[];
}

export const ScoreInputPanel: React.FC<ScoreInputPanelProps> = ({
  inning, inningHalf, outs, bases,
  battingOrder, selectedPlayer, onPlayerChange, players,
  rbi, setRbi, runs, setRuns,
  onResultTap, onUndo, lastInsertedId,
  isProcessing, resultOptions
}) => {
  const safePlayers = Array.isArray(players) ? players : [];
  const currentIndex = safePlayers.findIndex(p => p.id === parseInt(selectedPlayer));
  const currentPlayer = currentIndex >= 0 ? safePlayers[currentIndex] : safePlayers[0];
  const nextPlayer = safePlayers.length > 0
    ? safePlayers[(currentIndex >= 0 ? currentIndex + 1 : 1) % safePlayers.length]
    : null;

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 mb-4 flex justify-between items-center shadow-lg">
        <div className="flex flex-col">
          <span className="text-blue-300 text-[10px] font-bold uppercase tracking-wider mb-1">Status</span>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-black text-white italic">
              {inning} <span className="text-xs not-italic mr-1">{inningHalf === 'TOP' ? '表' : '裏'}</span>
            </div>
            <div className="flex space-x-1 items-center">
              <span className="text-[10px] text-gray-500 font-bold mr-1">O</span>
              {[1, 2].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full border border-black/20 ${outs >= i ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-gray-800'}`}></div>
              ))}
            </div>
          </div>
        </div>

        {/* Diamond */}
        <div className="relative w-12 h-12 flex items-center justify-center translate-x-[-10px]">
          <div className="absolute w-8 h-8 border border-gray-700 rotate-45"></div>
          <div className={`absolute top-1/2 right-0 w-3 h-3 border border-gray-600 -translate-y-1/2 translate-x-1/2 ${bases[1] ? 'bg-amber-400' : 'bg-gray-800'}`}></div>
          <div className={`absolute top-0 left-1/2 w-3 h-3 border border-gray-600 -translate-x-1/2 -translate-y-1/2 ${bases[2] ? 'bg-amber-400' : 'bg-gray-800'}`}></div>
          <div className={`absolute top-1/2 left-0 w-3 h-3 border border-gray-600 -translate-y-1/2 -translate-x-1/2 ${bases[3] ? 'bg-amber-400' : 'bg-gray-800'}`}></div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-blue-300 font-black uppercase tracking-wider mb-1">現在打者</div>
          <div>
            <span className="text-2xl font-black text-blue-400 italic mr-2">{currentPlayer?.batting_order ?? battingOrder}<span className="text-xs not-italic font-normal ml-0.5">番</span></span>
            <span className="text-lg font-bold">
              {currentPlayer ? `#${currentPlayer.uniform_number} ${currentPlayer.name}` : "選手なし"}
            </span>
          </div>
          <div className="text-[10px] text-gray-400 mt-1">
            次: {nextPlayer ? `${nextPlayer.batting_order}番 #${nextPlayer.uniform_number} ${nextPlayer.name}` : "なし"}
          </div>
        </div>
      </div>

      {/* Batter Selection */}
      <div className="mb-4">
        <label className="block text-xs text-gray-400 mb-1 font-bold">打者を選択</label>
        <select 
          value={selectedPlayer} 
          onChange={(e) => onPlayerChange(e.target.value)}
          disabled={players.length === 0 || isProcessing}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-lg font-bold text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all shadow-inner"
        >
          {players.length === 0 && <option value="">選手を追加してください</option>}
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              #{p.uniform_number} {p.name} ({p.position})
            </option>
          ))}
        </select>
      </div>

      {/* RBI/Runs Control */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-800/60 p-3 rounded-2xl border border-gray-700 text-center shadow-lg">
          <span className="block text-xs text-gray-400 mb-2 font-bold">この打席の打点</span>
          <div className="flex justify-center items-center space-x-4">
            <button onClick={() => setRbi(Math.max(0, rbi - 1))} disabled={isProcessing} className="text-xl bg-gray-700 w-10 h-10 rounded-full active:scale-90 transition-transform">-</button>
            <span className="text-2xl font-black text-blue-400">{rbi}</span>
            <button onClick={() => setRbi(Math.min(4, rbi + 1))} disabled={isProcessing} className="text-xl bg-gray-700 w-10 h-10 rounded-full active:scale-90 transition-transform">+</button>
          </div>
        </div>
        <div className="bg-gray-800/60 p-3 rounded-2xl border border-gray-700 text-center shadow-lg">
          <span className="block text-xs text-gray-400 mb-2 font-bold">自身の得点(生還)</span>
          <div className="flex justify-center items-center mt-1 h-10">
            <button 
              onClick={() => setRuns(runs === 1 ? 0 : 1)} 
              disabled={isProcessing}
              className={`w-full h-full rounded-xl font-black text-xs transition-all ${runs === 1 ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-gray-700 text-white'}`}
            >
              {runs === 1 ? '得点(1)' : 'なし'}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <span className="block text-xs text-gray-400 mb-2 flex items-center font-bold">
          打席結果 <span className="text-[9px] bg-gray-800 ml-2 px-1.5 py-0.5 rounded text-gray-500 uppercase">One-tap record</span>
        </span>
        <div className="grid grid-cols-2 gap-3">
          {resultOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => onResultTap(option)}
              disabled={players.length === 0 || isProcessing}
              className={`${option.color} active:scale-95 transform transition-all h-20 rounded-2xl flex flex-col justify-center items-center shadow-lg border border-black/20 disabled:opacity-50 disabled:grayscale`}
            >
              <span className="text-lg font-black tracking-widest">{option.label.split(' ')[0]}</span>
              {option.slugging > 0 && <span className="text-[10px] font-bold opacity-70">{option.slugging}塁打</span>}
            </button>
          ))}
        </div>

        <button
          onClick={onUndo}
          disabled={!lastInsertedId || isProcessing}
          className={`w-full py-4 rounded-2xl font-black text-sm border transition-all shadow-lg ${
            lastInsertedId && !isProcessing
              ? 'border-red-500/50 text-red-400 bg-red-500/10 active:scale-[0.98]' 
              : 'border-gray-800 text-gray-700 bg-gray-900 cursor-not-allowed opacity-50'
          }`}
        >
          {isProcessing ? '処理中...' : lastInsertedId ? '↩ 直前の入力を取り消す' : '取り消せる履歴がありません'}
        </button>
      </div>
    </div>
  );
};
