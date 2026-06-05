import React from 'react';
import { Player } from '../types';

interface ScoreInputPanelProps {
  inning: number;
  inningHalf: 'TOP' | 'BOTTOM';
  outs: number;
  setOuts?: (v: number) => void;
  scoreEditInning?: number;
  setScoreEditInning?: (v: number) => void;
  currentRunsUs?: number;
  currentRunsThem?: number;
  onManualScoreAdjust?: (teamSide: 'us' | 'them', delta: number) => void;
  bases: { [key: number]: boolean };
  setBases?: (v: { [key: number]: boolean }) => void;
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
  const orderedPlayers = [...safePlayers].sort((a, b) => (a.batting_order || 999) - (b.batting_order || 999));
  const currentIndex = orderedPlayers.findIndex(p => p.id === parseInt(selectedPlayer));
  const currentPlayer = currentIndex >= 0 ? orderedPlayers[currentIndex] : orderedPlayers[0];
  const nextPlayer = orderedPlayers.length > 0
    ? orderedPlayers[(currentIndex >= 0 ? currentIndex + 1 : 1) % orderedPlayers.length]
    : null;

  const inningLabel = `${inning}回${inningHalf === 'TOP' ? '表' : '裏'}`;

  return (
    <div>
      {/* 試合状況バー */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-gray-900">{inningLabel}</div>
          <div className="flex gap-1.5 mt-0.5">
            <span className="text-[10px] text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">{outs}アウト</span>
            <span className="text-[10px] text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
              {bases[1] && bases[2] && bases[3] ? '満塁'
                : bases[1] && bases[2] ? '1・2塁'
                : bases[1] && bases[3] ? '1・3塁'
                : bases[2] && bases[3] ? '2・3塁'
                : bases[1] ? '1塁'
                : bases[2] ? '2塁'
                : bases[3] ? '3塁'
                : '走者なし'}
            </span>
          </div>
        </div>
        {/* ダイヤモンド */}
        <div className="relative w-9 h-9 flex-shrink-0">
          <div className="absolute inset-2 border border-gray-300 rotate-45 rounded-sm"></div>
          <div className={`absolute top-1/2 right-0.5 w-2.5 h-2.5 rotate-45 rounded-sm -translate-y-1/2 border ${bases[1] ? 'bg-blue-600 border-blue-700' : 'bg-gray-100 border-gray-300'}`}></div>
          <div className={`absolute top-0.5 left-1/2 w-2.5 h-2.5 rotate-45 rounded-sm -translate-x-1/2 border ${bases[2] ? 'bg-blue-600 border-blue-700' : 'bg-gray-100 border-gray-300'}`}></div>
          <div className={`absolute top-1/2 left-0.5 w-2.5 h-2.5 rotate-45 rounded-sm -translate-y-1/2 border ${bases[3] ? 'bg-blue-600 border-blue-700' : 'bg-gray-100 border-gray-300'}`}></div>
        </div>
      </div>

      {/* 打順リスト */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100">
          <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">打順</span>
        </div>
        {orderedPlayers.length === 0 ? (
          <div className="px-4 py-4 text-xs text-gray-400 text-center">選手を登録してください</div>
        ) : (
          orderedPlayers.slice(0, 9).map((player) => {
            const isCurrent = player.id === parseInt(selectedPlayer);
            const isNext = !isCurrent && player.id === nextPlayer?.id;
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => onPlayerChange(String(player.id))}
                disabled={isProcessing}
                className={`w-full flex items-center gap-3 px-4 py-2 border-b border-gray-50 last:border-b-0 transition-colors disabled:opacity-50 ${
                  isCurrent ? 'bg-blue-50' : isNext ? 'bg-gray-50/60' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <span className={`text-xs font-bold w-4 text-center ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`}>
                  {player.batting_order}
                </span>
                <span className={`text-sm flex-1 text-left ${isCurrent ? 'font-bold text-gray-900' : isNext ? 'font-medium text-gray-600' : 'text-gray-500 font-normal'}`}>
                  {player.name}
                </span>
                {isCurrent && (
                  <span className="text-[9px] bg-blue-600 text-white rounded px-1.5 py-0.5 font-semibold">打席中</span>
                )}
                {isNext && (
                  <span className="text-[9px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">次</span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* RBI / 得点 */}
      <div className="flex gap-2 px-4 py-2.5 bg-white border-b border-gray-200">
        <div className="flex-1 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <span className="text-[11px] text-gray-500 font-medium">打点</span>
          <div className="flex items-center gap-2.5">
            <button onClick={() => setRbi(Math.max(0, rbi - 1))} disabled={isProcessing}
              className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-sm font-bold flex items-center justify-center active:bg-gray-300 disabled:opacity-40">−</button>
            <span className="text-sm font-bold text-gray-900 w-4 text-center">{rbi}</span>
            <button onClick={() => setRbi(Math.min(4, rbi + 1))} disabled={isProcessing}
              className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-sm font-bold flex items-center justify-center active:bg-gray-300 disabled:opacity-40">+</button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <span className="text-[11px] text-gray-500 font-medium">得点</span>
          <div className="flex items-center gap-2.5">
            <button onClick={() => setRuns(Math.max(0, runs - 1))} disabled={isProcessing}
              className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-sm font-bold flex items-center justify-center active:bg-gray-300 disabled:opacity-40">−</button>
            <span className="text-sm font-bold text-gray-900 w-4 text-center">{runs}</span>
            <button onClick={() => setRuns(Math.min(4, runs + 1))} disabled={isProcessing}
              className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-sm font-bold flex items-center justify-center active:bg-gray-300 disabled:opacity-40">+</button>
          </div>
        </div>
      </div>

      {/* 打席結果ボタン */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100">
          <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">打席結果</span>
        </div>
        <div className="grid grid-cols-4 gap-2 px-4 py-3">
          {[
            { label: '単打',   detail: 'SINGLE',    cls: 'bg-blue-50 border-blue-200 text-blue-700' },
            { label: '二塁打', detail: 'DOUBLE',    cls: 'bg-blue-50 border-blue-200 text-blue-700' },
            { label: '三塁打', detail: 'TRIPLE',    cls: 'bg-blue-50 border-blue-200 text-blue-700' },
            { label: '本塁打', detail: 'HOME_RUN',  cls: 'bg-amber-50 border-amber-200 text-amber-700' },
            { label: '三振',   detail: 'STRIKEOUT', cls: 'bg-red-50 border-red-200 text-red-700' },
            { label: 'ゴロ',   detail: 'GROUND_OUT',cls: 'bg-red-50 border-red-200 text-red-700' },
            { label: 'フライ', detail: 'FLY_OUT',   cls: 'bg-red-50 border-red-200 text-red-700' },
            { label: '四球',   detail: 'WALK',      cls: 'bg-green-50 border-green-200 text-green-700' },
          ].map((item) => {
            const option = resultOptions.find((o: any) => o.detail === item.detail);
            if (!option) return null;
            return (
              <button
                key={item.detail}
                onClick={() => onResultTap(option)}
                disabled={players.length === 0 || isProcessing}
                className={`${item.cls} border rounded-lg py-2.5 text-center text-[11px] font-bold active:scale-95 transition-all disabled:opacity-40`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Undo */}
      <div className="px-4 py-2.5 bg-white border-b border-gray-200">
        <button
          onClick={onUndo}
          disabled={!lastInsertedId || isProcessing}
          className={`w-full py-2 rounded-lg text-xs font-medium border transition-all ${
            lastInsertedId && !isProcessing
              ? 'bg-white border-gray-300 text-gray-600 active:bg-gray-50'
              : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
          }`}
        >
          {isProcessing ? '処理中...' : lastInsertedId ? '↩ 直前の入力を取り消す' : '取り消せる履歴がありません'}
        </button>
      </div>
    </div>
  );
};
