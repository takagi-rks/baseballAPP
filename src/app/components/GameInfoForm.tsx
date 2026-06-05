import React from 'react';

interface GameInfoFormProps {
  editOpponent: string;
  setEditOpponent: (v: string) => void;
  editLocation: string;
  setEditLocation: (v: string) => void;
  editScoreThem: number;
  setEditScoreThem: (v: number) => void;
  editStatus: string;
  setEditStatus: (v: string) => void;
  editMemo: string;
  setEditMemo: (v: string) => void;
  onSave: () => void;
  isProcessing: boolean;
}

export const GameInfoForm: React.FC<GameInfoFormProps> = ({
  editOpponent, setEditOpponent,
  editLocation, setEditLocation,
  editScoreThem, setEditScoreThem,
  editStatus, setEditStatus,
  editMemo, setEditMemo,
  onSave,
  isProcessing
}) => {
  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-2 mb-6 shadow-lg">
      <h2 className="text-gray-400 text-[10px] font-bold mb-3 uppercase tracking-widest flex items-center">
        <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2"></span>
        試合情報
      </h2>
      
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="col-span-2">
          <label className="block text-gray-500 mb-1">対戦相手</label>
          <input 
            type="text" 
            value={editOpponent} 
            onChange={(e) => setEditOpponent(e.target.value)}
            disabled={isProcessing}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 font-bold text-gray-100 focus:border-blue-500 outline-none disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-gray-500 mb-1">球場</label>
          <input 
            type="text" 
            value={editLocation} 
            onChange={(e) => setEditLocation(e.target.value)}
            disabled={isProcessing}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 font-bold text-gray-100 focus:border-blue-500 outline-none disabled:opacity-50"
            placeholder="〇〇球場"
          />
        </div>
        <div>
          <label className="block text-gray-500 mb-1">相手の得点</label>
          <input 
            type="number" 
            value={editScoreThem} 
            onChange={(e) => setEditScoreThem(parseInt(e.target.value || '0'))}
            disabled={isProcessing}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 font-bold text-blue-400 focus:border-blue-500 outline-none disabled:opacity-50"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-gray-500 mb-1">ステータス</label>
          <div className="flex space-x-2">
            {['in_progress', 'completed', 'canceled'].map((s) => (
              <button
                key={s}
                disabled={isProcessing}
                onClick={() => setEditStatus(s)}
                className={`flex-1 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                  editStatus === s 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                  : 'bg-gray-900 border-gray-700 text-gray-500'
                } disabled:opacity-50`}
              >
                {s === 'in_progress' ? '試合中' : s === 'completed' ? '試合終了' : '中止'}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <textarea 
          rows={2}
          value={editMemo} 
          onChange={(e) => setEditMemo(e.target.value)}
          disabled={isProcessing}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs font-medium text-gray-300 focus:border-blue-500 outline-none disabled:opacity-50"
          placeholder="試合のメモ（天気、審判、特記事項など）"
        />
      </div>
      
      <button 
        onClick={onSave}
        disabled={isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-3 text-xs font-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
      >
        {isProcessing ? '保存中...' : '試合情報を保存'}
      </button>
    </div>
  );
};
