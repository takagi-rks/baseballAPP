import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');

    if (!gameId) {
      return NextResponse.json({ success: true, history: [] });
    }

    const query = `
      SELECT id, player_id, inning, result_category, result_detail, rbi, runs, created_at
      FROM plate_appearances
      WHERE game_id = $1
      ORDER BY created_at DESC
      LIMIT 10;
    `;
    const result = await pool.query(query, [gameId]);
    return NextResponse.json({ success: true, history: result.rows });
  } catch (error: any) {
    console.error("Fetch History Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
