export interface Player {
  id: number;
  name: string;
  uniform_number: number | string;
  position: string;
  batting_order: number;
  is_active?: boolean;
}

export interface Game {
  id: number;
  game_date: string;
  opponent: string;
  location?: string;
  memo?: string;
  score_us: number;
  score_them: number;
  status: string;
  created_at: string;
}

export interface PlateAppearance {
  id: number;
  player_id: number;
  inning: number;
  result_category: string;
  result_detail: string;
  rbi: number;
  runs: number;
  created_at: string;
}

export interface PlayerStat {
  player_id: number;
  pa: number;
  ab: number;
  h: number;
  rbi: number;
  runs: number;
  avg: string;
  obp: string;
  slg: string;
  ops: string;
}

export interface AIComment {
  player_id: number;
  name: string;
  comment: string;
  mood: 'neutral' | 'good' | 'great';
}
