export interface ApiSuccess<T> {
  success: true;
  data?: T;
  [key: string]: unknown;
}
export interface ApiError {
  success: false;
  error: string;
}

export interface Score {
  inning: number;
  runs: number;
}

export interface TimelineEvent {
  id: number;
  player_id: number;
  inning: number;
  inning_half: 'TOP' | 'BOTTOM';
  result_category: string;
  result_detail: string;
  rbi: number;
  runs: number;
  created_at: string;
  player_name: string;
  uniform_number: number | string;
}

export type PlateAppearance = TimelineEvent;

export interface InningTimelineGroup {
  inning: number;
  inning_half: 'TOP' | 'BOTTOM'; // 変更: 表裏表示のために追加
  events: TimelineEvent[];
}

export interface Player {
  id: number;
  name: string;
  uniform_number: string;
  position: string;
  batting_order: number;
}

export interface Game {
  id: number;
  opponent: string;
  location: string;
  score_us: number;
  score_them: number;
  status: 'in_progress' | 'completed';
  batting_side: 'TOP' | 'BOTTOM';
  memo?: string;
  game_date?: string;
}

export interface PlayerStat {
  player_id: number;
  [key: string]: any;
}

export interface AiComment {
  id: number;
  content: string;
  [key: string]: any;
}

export type ScoreboardResponse = ApiSuccess<{ scores?: { us?: Score[]; them?: Score[] }; us?: Score[]; them?: Score[] }>;
export type TimelineResponse = ApiSuccess<{ timeline?: InningTimelineGroup[] }>;
export type StatsResponse = ApiSuccess<{ stats?: PlayerStat[] }>;
export type CommentsResponse = ApiSuccess<{ comments?: AiComment[] }>;
export type GamesResponse = ApiSuccess<{ games?: Game[] }>;
export type PlayersResponse = ApiSuccess<{ players?: Player[] }>;
