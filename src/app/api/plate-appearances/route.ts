import { NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await initDb();
    const body = await request.json();
    const {
      game_id,
      player_id,
      inning,
      result_category,
      result_detail,
      rbi,
      runs,
      stolen_bases,
      slugging_value
    } = body;

    const team_id = 1;
    const isHit = result_category === 'HIT';
    const isAtBat = !['WALK', 'SACRIFICE'].includes(result_category) && result_detail !== 'HIT_BY_PITCH';

    const query = `
      INSERT INTO plate_appearances (
        team_id, game_id, player_id, inning, 
        result_category, result_detail, rbi, runs, stolen_bases, 
        is_at_bat, is_hit, slugging_value
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id;
    `;
    
    const values = [
      team_id, game_id, player_id, inning,
      result_category, result_detail, rbi, runs, stolen_bases,
      isAtBat, isHit, slugging_value
    ];

    const result = await pool.query(query, values);
    return NextResponse.json({ success: true, id: result.rows[0].id }, { status: 201 });
  } catch (error: any) {
    console.error("DB Insert Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
