import React from 'react';
import { Player } from '../types';

interface PlayerManagerProps {
  players: Player[];
  newPlayerName: string;
  setNewPlayerName: (v: string) => void;
  newPlayerNumber: string;
  setNewPlayerNumber: (v: string) => void;
  newPlayerPos: string;
  setNewPlayerPos: (v: string) => void;
  newPlayerOrder: string;
  setNewPlayerOrder: (v: string) => void;
  onAddPlayer: () => void;
  onDeactivatePlayer: (id: number) => void;
  editingPlayerId: number | null;
  setEditingPlayerId: (id: number | null) => void;
  editPlayerName: string;
  setEditPlayerName: (v: string) => void;
  editPlayerNumber: string;
  setEditPlayerNumber: (v: string) => void;
  editPlayerPos: string;
  setEditPlayerPos: (v: string) => void;
  editPlayerOrder: string;
  setEditPlayerOrder: (v: string) => void;
  onStartEditPlayer: (player: Player) => void;
  onUpdatePlayer: (id: number) => void;
  isProcessing: boolean;
}

export const PlayerManager: React.FC<PlayerManagerProps> = ({
  players,
  newPlayerName, setNewPlayerName,
  newPlayerNumber, setNewPlayerNumber,
  newPlayerPos, setNewPlayerPos,
  newPlayerOrder, setNewPlayerOrder,
  onAddPlayer, onDeactivatePlayer,
  editingPlayerId, setEditingPlayerId,
  editPlayerName, setEditPlayerName,
  editPlayerNumber, setEditPlayerNumber,
  editPlayerPos, setEditPlayerPos,
  editPlayerOrder, setEditPlayerOrder,
  onStartEditPlayer, onUpdatePlayer,
  isProcessing
}) => {
  return (
    <div className="mt-12 mb-12 bg-gray-900/10 rounded-2xl p-3 border border-gray-700/30 shadow-inner">
      <h2 className="text-gray-400 text-[10px] font-bold mb-5 uppercase tracking-[0.2em] flex items-center">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
        選手管理
      </h2>
      
      {/* Add New Player */}
      <div className="bg-gray-800/20 p-3 rounded-2xl mb-6 border border-gray-700/50 shadow-md">
        <p className="text-[10px] text-gray-500 font-black mb-4 uppercase tracking-widest">選手を登録する</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <input type="text" placeholder="名前" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} disabled={isProcessing} className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs text-white focus:border-blue-500 outline-none transition-all disabled:opacity-50" />
          <input type="number" placeholder="背番号" value={newPlayerNumber} onChange={(e) => setNewPlayerNumber(e.target.value)} disabled={isProcessing} className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs text-white focus:border-blue-500 outline-none transition-all disabled:opacity-50" />
          <input type="text" placeholder="守備位置" value={newPlayerPos} onChange={(e) => setNewPlayerPos(e.target.value)} disabled={isProcessing} className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs text-white focus:border-blue-500 outline-none transition-all disabled:opacity-50" />
          <input type="number" placeholder="打順" value={newPlayerOrder} onChange={(e) => setNewPlayerOrder(e.target.value)} disabled={isProcessing} className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs text-white focus:border-blue-500 outline-none transition-all disabled:opacity-50" />
        </div>
        <button 
          onClick={onAddPlayer} 
          disabled={isProcessing || !newPlayerName}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white text-[10px] font-black py-3 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
        >
          {isProcessing ? '処理中...' : '選手を追加'}
        </button>
      </div>

      {/* Player List */}
      <div className="space-y-3">
        {players.map((p) => (
          <div key={p.id} className="bg-gray-900/40 p-2 rounded-2xl border border-gray-700/30 transition-all shadow-sm">
            {editingPlayerId === p.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={editPlayerName} onChange={(e) => setEditPlayerName(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-xs text-white" placeholder="名前" />
                  <input type="number" value={editPlayerNumber} onChange={(e) => setEditPlayerNumber(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-xs text-white" placeholder="背番号" />
                  <input type="text" value={editPlayerPos} onChange={(e) => setEditPlayerPos(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-xs text-white" placeholder="守備" />
                  <input type="number" value={editPlayerOrder} onChange={(e) => setEditPlayerOrder(e.target.value)} className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-xs text-white" placeholder="打順" />
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => onUpdatePlayer(p.id)} disabled={isProcessing} className="flex-1 bg-blue-600 text-white text-[10px] font-black py-2 rounded-xl transition-all disabled:opacity-50">保存</button>
                  <button onClick={() => setEditingPlayerId(null)} disabled={isProcessing} className="flex-1 bg-gray-700 text-white text-[10px] font-black py-2 rounded-xl transition-all disabled:opacity-50">キャンセル</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-mono font-black text-blue-500 w-5">{p.batting_order}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-gray-100">
                      <span className="text-gray-600 mr-1.5">#{p.uniform_number}</span>
                      {p.name}
                    </span>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">{p.position}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => onStartEditPlayer(p)} disabled={isProcessing} className="text-[10px] font-black text-blue-400 px-3 py-1.5 border border-blue-500/20 rounded-xl hover:bg-blue-500/10 active:scale-95 transition-all disabled:opacity-30">編集</button>
                  <button onClick={() => onDeactivatePlayer(p.id)} disabled={isProcessing} className="text-[10px] font-black text-red-500 px-3 py-1.5 border border-red-500/20 rounded-xl hover:bg-red-500/10 active:scale-95 transition-all disabled:opacity-30">削除</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {players.length === 0 && (
           <div className="text-center py-10 border border-dashed border-gray-800 rounded-2xl">
             <p className="text-gray-700 text-xs italic">選手を登録してください</p>
           </div>
        )}
      </div>
    </div>
  );
};
