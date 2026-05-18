export const RESULT_OPTIONS = [
  { label: '単打 (ヒット)', category: 'HIT', detail: 'SINGLE', slugging: 1, color: 'bg-green-600' },
  { label: '二塁打', category: 'HIT', detail: 'DOUBLE', slugging: 2, color: 'bg-green-600' },
  { label: '三塁打', category: 'HIT', detail: 'TRIPLE', slugging: 3, color: 'bg-green-600' },
  { label: '本塁打', category: 'HIT', detail: 'HOME_RUN', slugging: 4, color: 'bg-red-600' },
  { label: '四球', category: 'WALK', detail: 'WALK', slugging: 0, color: 'bg-blue-600' },
  { label: '死球', category: 'WALK', detail: 'HIT_BY_PITCH', slugging: 0, color: 'bg-blue-600' },
  { label: '三振', category: 'OUT', detail: 'STRIKEOUT', slugging: 0, color: 'bg-gray-600' },
  { label: 'ゴロ凡退', category: 'OUT', detail: 'GROUND_OUT', slugging: 0, color: 'bg-gray-600' },
  { label: '飛球凡退', category: 'OUT', detail: 'FLY_OUT', slugging: 0, color: 'bg-gray-600' },
  { label: '犠飛', category: 'SACRIFICE', detail: 'SACRIFICE_FLY', slugging: 0, color: 'bg-yellow-600' },
];
