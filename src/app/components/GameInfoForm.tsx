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
  editMemo, setEditMemo,
  onSave,
  isProcessing
}) => {
  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-2 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
          試合情報
        </h2>

        <button
          onClick={onSave}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-1 text-[10px] font-black transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isProcessing ? '保存中' : '保存'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label className="block text-gray-500 mb-0.5 text-[10px]">対戦相手</label>
          <input
            type="text"
            value={editOpponent}
            onChange={(e) => setEditOpponent(e.target.value)}
            disabled={isProcessing}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 font-bold text-gray-100 focus:border-blue-500 outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-gray-500 mb-0.5 text-[10px]">球場</label>
          <input
            type="text"
            value={editLocation}
            onChange={(e) => setEditLocation(e.target.value)}
            disabled={isProcessing}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 font-bold text-gray-100 focus:border-blue-500 outline-none disabled:opacity-50"
            placeholder="〇〇球場"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-gray-500 mb-0.5 text-[10px]">メモ</label>
          <input
            type="text"
            value={editMemo}
            onChange={(e) => setEditMemo(e.target.value)}
            disabled={isProcessing}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-300 focus:border-blue-500 outline-none disabled:opacity-50"
            placeholder="メモ"
          />
        </div>
      </div>
    </div>
  );
};
