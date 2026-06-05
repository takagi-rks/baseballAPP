import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

export default pool;

let initialized = false;

export async function initDb() {
  if (initialized) return;

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  initialized = true;

  const queries = [
    `CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      game_date DATE DEFAULT CURRENT_DATE,
      opponent VARCHAR(100) DEFAULT '練習試合',
      tournament_name VARCHAR(100),
      location VARCHAR(100),
      memo TEXT,
      score_us INT DEFAULT 0,
      score_them INT DEFAULT 0,
      status VARCHAR(20) DEFAULT 'in_progress',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      uniform_number INT,
      position VARCHAR(50),
      batting_order INT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS plate_appearances (
      id SERIAL PRIMARY KEY,
      team_id INT DEFAULT 1,
      game_id INT REFERENCES games(id),
      player_id INT REFERENCES players(id),
      inning INT,
      result_category VARCHAR(20),
      result_detail VARCHAR(50),
      rbi INT DEFAULT 0,
      runs INT DEFAULT 0,
      stolen_bases INT DEFAULT 0,
      is_at_bat BOOLEAN DEFAULT true,
      is_hit BOOLEAN DEFAULT false,
      slugging_value INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS inning_scores (
      id SERIAL PRIMARY KEY,
      game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
      inning INTEGER NOT NULL,
      team_side VARCHAR(10) NOT NULL,
      runs INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(game_id, inning, team_side)
    );`,
  ];

  for (const query of queries) {
    await pool.query(query);
  }

  const alterQueries = [
    `ALTER TABLE games ADD COLUMN IF NOT EXISTS batting_side VARCHAR(10) DEFAULT 'TOP';`,
    `ALTER TABLE games ADD COLUMN IF NOT EXISTS tournament_name VARCHAR(100);`,
    `ALTER TABLE plate_appearances ADD COLUMN IF NOT EXISTS inning_half VARCHAR(10) DEFAULT 'TOP';`,
    `ALTER TABLE plate_appearances ADD COLUMN IF NOT EXISTS risp BOOLEAN DEFAULT false;`,
    `ALTER TABLE inning_scores ADD COLUMN IF NOT EXISTS hits_allowed INTEGER DEFAULT 0;`,
    `ALTER TABLE inning_scores ADD COLUMN IF NOT EXISTS walks_allowed INTEGER DEFAULT 0;`,
    `ALTER TABLE inning_scores ADD COLUMN IF NOT EXISTS hit_by_pitch_allowed INTEGER DEFAULT 0;`,
    `ALTER TABLE inning_scores ADD COLUMN IF NOT EXISTS errors_committed INTEGER DEFAULT 0;`,
    `ALTER TABLE inning_scores ADD COLUMN IF NOT EXISTS note TEXT DEFAULT '';`
  ];

  for (const query of alterQueries) {
    await pool.query(query);
  }
}
