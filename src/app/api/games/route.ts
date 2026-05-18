import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// テーブル初期化
async function initTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      game_date DATE NOT NULL DEFAULT CURRENT_DATE,
      opponent VARCHAR(100) NOT NULL,
      location VARCHAR(100),
      memo TEXT,
      score_us INT DEFAULT 0,
      score_them INT DEFAULT 0,
      status VARCHAR(20) DEFAULT 'in_progress',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
  
  // 既存カラムの追加
  const addColumns = [
    "ALTER TABLE games ADD COLUMN IF NOT EXISTS location VARCHAR(100);",
    "ALTER TABLE games ADD COLUMN IF NOT EXISTS memo TEXT;",
    "ALTER TABLE games ADD COLUMN IF NOT EXISTS score_us INT DEFAULT 0;",
    "ALTER TABLE games ADD COLUMN IF NOT EXISTS score_them INT DEFAULT 0;",
    "ALTER TABLE games ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'in_progress';"
  ];
  for (const q of addColumns) {
    try { await pool.query(q); } catch (e) { /* すでに存在する場合など */ }
  }
}

export async function POST() {
  try {
    await initTable();
    
    const query = `
      INSERT INTO games (opponent, status)
      VALUES ($1, $2)
      RETURNING id;
    `;
    const result = await pool.query(query, ["練習試合", "in_progress"]);
    
    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    console.error("Create Game Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await initTable();
    const result = await pool.query('SELECT * FROM games ORDER BY created_at DESC;');
    return NextResponse.json({ success: true, games: result.rows });
  } catch (error: any) {
    console.error("Fetch Games Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
