import React, { useState } from 'react';

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
  editStatus, setEditStatus,
  editMemo, setEditMemo,
  onSave,
  isProcessing
}) => {
  const [memoOpen, setMemoOpen] = useState(Boolean(editMemo));

  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-2 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
          試合情報
        </h2>

        <button
          onClick={onSave}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-md px-2.5 py-1 text-[10px] font-black active:scale-[0.98] disabled:opacity-50"
        >
          {isProcessing ? '保存中' : '保存'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div>
          <label className="block text-gray-500 mb-0.5 text-[9px]">対戦相手</label>
          <input
            type="text"
            value={editOpponent}
            onChange={(e) => setEditOpponent(e.target.value)}
            disabled={isProcessing}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-2 py-1 font-bold text-gray-100 focus:border-blue-500 outline-none disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-gray-500 mb-0.5 text-[9px]">球場</label>
          <input
            type="text"
            value={editLocation}
            onChange={(e) => setEditLocation(e.target.value)}
            disabled={isProcessing}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-2 py-1 font-bold text-gray-100 focus:border-blue-500 outline-none disabled:opacity-50"
            placeholder="〇〇球場"
          />
        </div>

        <div className="col-span-2 grid grid-cols-3 gap-1">
          {[
            ['in_progress', '試合中'],
            ['completed', '終了'],
            ['canceled', '中止'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              disabled={isProcessing}
              onClick={() => setEditStatus(value)}
              className={`py-1 rounded-md text-[10px] font-black border ${
                editStatus === value
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-900 border-gray-700 text-gray-500'
              } disabled:opacity-50`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="col-span-2">
          <button
            type="button"
            onClick={() => setMemoOpen((v) => !v)}
            className="w-full text-left text-[10px] text-gray-500 font-black py-0.5"
          >
            {memoOpen ? '▼ メモ' : '▶ メモ'}
          </button>

          {memoOpen && (
            <input
              type="text"
              value={editMemo}
              onChange={(e) => setEditMemo(e.target.value)}
              disabled={isProcessing}
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-2 py-1 text-xs font-medium text-gray-300 focus:border-blue-500 outline-none disabled:opacity-50"
              placeholder="メモ"
            />
          )}
        </div>
      </div>
    </div>
  );
};
