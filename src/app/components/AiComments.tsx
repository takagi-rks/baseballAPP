import React from 'react';
import type { AiComment } from '../types';

interface AiCommentsProps {
  comments: AiComment[];
}

export const AiComments: React.FC<AiCommentsProps> = ({ comments }) => {
  return (
    <div className="mt-12">
      <h2 className="text-gray-400 text-[10px] font-bold mb-4 uppercase tracking-[0.2em] flex items-center">
        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
        AI 監督のコメント
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {comments.map((comment) => (
          <div key={comment.player_id} className={`p-2 rounded-2xl border transition-all shadow-md ${
            comment.mood === 'great' ? 'bg-amber-500/10 border-amber-500/30' :
            comment.mood === 'good' ? 'bg-blue-500/10 border-blue-500/30' :
            'bg-gray-800/20 border-gray-700/50'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black text-gray-100 tracking-tight">{comment.name}</span>
              <div className="flex space-x-1">
                {comment.mood === 'great' && <span className="text-[9px] bg-amber-500 text-black font-black px-2 py-0.5 rounded shadow-[0_0_10px_rgba(245,158,11,0.4)]">EXCELLENT</span>}
                {comment.mood === 'good' && <span className="text-[9px] bg-blue-500 text-white font-black px-2 py-0.5 rounded shadow-[0_0_10px_rgba(59,130,246,0.4)]">GOOD</span>}
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              {comment.comment}
            </p>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-2xl">
            <p className="text-gray-600 text-xs italic">コメントを生成できる選手がいません</p>
          </div>
        )}
      </div>
    </div>
  );
};
