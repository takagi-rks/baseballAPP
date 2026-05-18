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
      return NextResponse.json({ success: true, scores: [] });
    }

    const query = `
      SELECT inning, SUM(runs)::int as runs
      FROM plate_appearances
      WHERE game_id = $1
      GROUP BY inning
      ORDER BY inning ASC;
    `;
    const result = await pool.query(query, [gameId]);
    return NextResponse.json({ success: true, scores: result.rows });
  } catch (error: any) {
    console.error("Fetch Scoreboard Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
