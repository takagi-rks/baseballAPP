export interface ApiSuccess<T> {
  success: true;
  data?: T; // Some APIs use "data", others use custom keys
  [key: string]: unknown; // allow extra keys like "scores"
}
export interface ApiError {
  success: false;
  error: string;
}

// Domain models
export interface Score {
  inning: number;
  runs: number;
}
export interface TimelineEvent {
  id: number;
  result_category: string;
  result_detail: string;
  rbi: number;
  runs: number;
  created_at: string;
  player_name: string;
  uniform_number: number;
}
export interface InningTimelineGroup {
  inning: number;
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
  memo?: string;
  game_date?: string; // optional date field from API
}
export interface PlayerStat {
  player_id: number;
  // add other stats fields as needed
  [key: string]: any;
}
export interface AiComment {
  id: number;
  content: string;
  // other fields as needed
  [key: string]: any;
}

// Specific endpoint response shapes
export type ScoreboardResponse = ApiSuccess<{ scores?: { us?: Score[]; them?: Score[] }; us?: Score[]; them?: Score[] }>;
export type TimelineResponse = ApiSuccess<{ timeline?: InningTimelineGroup[] }>; // may be under "data" or direct
export type StatsResponse = ApiSuccess<{ stats?: PlayerStat[] }>;
export type CommentsResponse = ApiSuccess<{ comments?: AiComment[] }>;
export type GamesResponse = ApiSuccess<{ games?: Game[] }>;
export type PlayersResponse = ApiSuccess<{ players?: Player[] }>;
