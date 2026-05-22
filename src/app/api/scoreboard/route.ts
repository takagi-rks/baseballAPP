import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');

    if (!gameId) {
      return NextResponse.json({ success: false, error: "game_id required" }, { status: 400 });
    }

    // Us (our team) scores aggregated from plate_appearances
    const usQuery = `
      SELECT inning, SUM(runs)::int as runs
      FROM plate_appearances
      WHERE game_id = $1
      GROUP BY inning
      ORDER BY inning ASC;
    `;
    const usResult = await pool.query(usQuery, [gameId]);

    // Them (opposing team) scores retrieved from inning_scores
    const themQuery = `
      SELECT inning, runs
      FROM inning_scores
      WHERE game_id = $1 AND team_side = 'them'
      ORDER BY inning ASC;
    `;
    const themResult = await pool.query(themQuery, [gameId]);

    return NextResponse.json({
      success: true,
      scores: {
        us: usResult.rows,
        them: themResult.rows
      }
    });
  } catch (error: any) {
    console.error("Fetch Scoreboard Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
