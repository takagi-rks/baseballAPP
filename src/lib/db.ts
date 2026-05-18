import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default pool;

// 全テーブルの初期化（Supabase用）
export async function initDb() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      game_date DATE DEFAULT CURRENT_DATE,
      opponent VARCHAR(100) DEFAULT '練習試合',
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
    );`
  ];

  for (const query of queries) {
    await pool.query(query);
  }
}
