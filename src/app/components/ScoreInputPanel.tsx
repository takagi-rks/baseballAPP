import React from 'react';
import { Player } from '../types';

interface ScoreInputPanelProps {
  inning: number;
  inningHalf: 'TOP' | 'BOTTOM';
  outs: number;
  setOuts: (value: number) => void;
  scoreEditInning: number;
  setScoreEditInning: (value: number) => void;
  currentRunsUs: number;
  currentRunsThem: number;
  onManualScoreAdjust: (teamSide: 'us' | 'them', delta: number) => void;
  bases: { [key: number]: boolean };
  setBases: (bases: { [key: number]: boolean }) => void;
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
  inning, inningHalf, outs, setOuts, scoreEditInning, setScoreEditInning, currentRunsUs, currentRunsThem, onManualScoreAdjust, bases, setBases,
  battingOrder, selectedPlayer, onPlayerChange, players,
  rbi, setRbi, runs, setRuns,
  onResultTap, onUndo, lastInsertedId,
  isProcessing, resultOptions
}) => {
  const safePlayers = Array.isArray(players) ? players : [];
  const orderedPlayers = [...safePlayers].sort((a, b) => (a.batting_order || 999) - (b.batting_order || 999));
  const currentIndex = orderedPlayers.findIndex(p => p.id === parseInt(selectedPlayer));
  const currentPlayer = currentIndex >= 0 ? orderedPlayers[currentIndex] : orderedPlayers[0];
  const nextPlayer = orderedPlayers.length > 0
    ? orderedPlayers[(currentIndex >= 0 ? currentIndex + 1 : 1) % orderedPlayers.length]
    : null;

  return (
    <div className="space-y-4">
      {/* Compact Status Card */}
      <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-3 mb-3 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] text-blue-300 font-black uppercase tracking-wider mb-1">
              現在打者
            </div>
            <div className="truncate text-sm font-black text-white">
              {currentPlayer ? `${currentPlayer.batting_order}番 #${currentPlayer.uniform_number} ${currentPlayer.name}` : "選手なし"}
            </div>
            <div className="truncate text-[10px] text-gray-400 mt-0.5">
              NEXT {nextPlayer ? `${nextPlayer.batting_order}番 #${nextPlayer.uniform_number} ${nextPlayer.name}` : "なし"}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-[10px] text-gray-500 font-black">
                {inning}回{inningHalf === 'TOP' ? '表' : '裏'}
              </div>
              <div className="flex items-center gap-1 mt-1 justify-end">
                {[1, 2].map(i => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-full border border-black/20 ${outs >= i ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-gray-800'}`}></div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setOuts(Math.max(0, outs - 1))}
                disabled={isProcessing || outs <= 0}
                className="w-7 h-7 rounded-full bg-gray-800 text-white font-black disabled:opacity-30 active:scale-95"
              >
                -
              </button>
              <span className="w-4 text-center text-sm font-black text-white">{outs}</span>
              <button
                type="button"
                onClick={() => setOuts(Math.min(2, outs + 1))}
                disabled={isProcessing || outs >= 2}
                className="w-7 h-7 rounded-full bg-gray-800 text-white font-black disabled:opacity-30 active:scale-95"
              >
                +
              </button>
            </div>

            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute w-6 h-6 border border-gray-700 rotate-45"></div>
              <div className={`absolute top-1/2 right-0 w-2.5 h-2.5 border border-gray-600 -translate-y-1/2 translate-x-1/2 ${bases[1] ? 'bg-amber-400' : 'bg-gray-800'}`}></div>
              <div className={`absolute top-0 left-1/2 w-2.5 h-2.5 border border-gray-600 -translate-x-1/2 -translate-y-1/2 ${bases[2] ? 'bg-amber-400' : 'bg-gray-800'}`}></div>
              <div className={`absolute top-1/2 left-0 w-2.5 h-2.5 border border-gray-600 -translate-y-1/2 -translate-x-1/2 ${bases[3] ? 'bg-amber-400' : 'bg-gray-800'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Score Control */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-3 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] text-gray-400 font-black uppercase tracking-widest">得点手動修正</h3>
          <span className="text-[9px] text-blue-300 font-black">{scoreEditInning}回を修正中</span>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setScoreEditInning(i)}
              disabled={isProcessing}
              className={`py-1 rounded-lg text-[10px] font-black border ${
                scoreEditInning === i
                  ? 'bg-blue-600 text-white border-blue-400'
                  : 'bg-gray-950/60 text-gray-400 border-gray-800'
              }`}
            >
              {i}回
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-950/60 border border-gray-800 rounded-xl p-2">
            <div className="text-[9px] text-blue-300 font-black mb-1 text-center">自チーム</div>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onManualScoreAdjust('us', -1)}
                disabled={isProcessing || currentRunsUs <= 0}
                className="w-8 h-8 rounded-full bg-gray-800 text-white font-black disabled:opacity-30 active:scale-95"
              >
                -
              </button>
              <span className="w-6 text-center text-lg font-black text-white">{currentRunsUs}</span>
              <button
                type="button"
                onClick={() => onManualScoreAdjust('us', 1)}
                disabled={isProcessing}
                className="w-8 h-8 rounded-full bg-gray-800 text-white font-black disabled:opacity-30 active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          <div className="bg-gray-950/60 border border-gray-800 rounded-xl p-2">
            <div className="text-[9px] text-red-300 font-black mb-1 text-center">相手</div>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onManualScoreAdjust('them', -1)}
                disabled={isProcessing || currentRunsThem <= 0}
                className="w-8 h-8 rounded-full bg-gray-800 text-white font-black disabled:opacity-30 active:scale-95"
              >
                -
              </button>
              <span className="w-6 text-center text-lg font-black text-white">{currentRunsThem}</span>
              <button
                type="button"
                onClick={() => onManualScoreAdjust('them', 1)}
                disabled={isProcessing}
                className="w-8 h-8 rounded-full bg-gray-800 text-white font-black disabled:opacity-30 active:scale-95"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Runner Control */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-2 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs text-gray-400 font-black uppercase tracking-widest">ランナー手動調整</h3>
          <span className="text-[10px] text-gray-600">塁をタップでON/OFF</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3].map((base) => {
            const label = base === 1 ? '一塁' : base === 2 ? '二塁' : '三塁';
            const active = Boolean(bases[base]);

            return (
              <button
                key={base}
                type="button"
                onClick={() => setBases({ ...bases, [base]: !active })}
                className={`py-3 rounded-xl border text-xs font-black transition-all active:scale-[0.98] ${
                  active
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                    : 'bg-gray-950/60 text-gray-500 border-gray-800'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setBases({ 1: false, 2: false, 3: false })}
          className="w-full mt-3 py-2 rounded-xl bg-gray-800 text-gray-400 text-[11px] font-black border border-gray-700 active:scale-[0.98]"
        >
          ランナーをクリア
        </button>
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

      {/* Batting Order List */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-2 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] text-gray-400 font-black uppercase tracking-widest">打順一覧</h3>
          <span className="text-[9px] text-gray-600">タップで選択</span>
        </div>

        {orderedPlayers.length === 0 ? (
          <div className="text-center text-gray-600 text-xs py-2 border border-dashed border-gray-800 rounded-xl">
            選手が登録されていません
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1">
            {orderedPlayers.map((player) => {
              const isCurrent = String(player.id) === String(selectedPlayer);
              const isNext = nextPlayer && String(player.id) === String(nextPlayer.id);

              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => onPlayerChange(String(player.id))}
                  disabled={isProcessing}
                  className={`min-h-[30px] rounded-lg border px-1 py-1 text-left transition-all active:scale-[0.98] disabled:opacity-50 ${
                    isCurrent
                      ? 'bg-blue-500/25 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.18)]'
                      : isNext
                      ? 'bg-gray-800/70 border-gray-600 text-gray-200'
                      : 'bg-gray-950/40 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-1 min-w-0">
                    <span className={`text-[10px] font-black shrink-0 ${
                      isCurrent ? 'text-blue-200' : 'text-blue-400'
                    }`}>
                      {player.batting_order}
                    </span>
                    <span className="text-[10px] font-black truncate">
                      {player.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
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
          className={`w-full py-2 rounded-2xl font-black text-sm border transition-all shadow-lg ${
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
