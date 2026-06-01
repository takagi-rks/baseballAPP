import { NextRequest, NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';

const dbReady = initDb();

function calcSluggingValue(result_detail: string): number {
  const map: Record<string, number> = {
    SINGLE: 1,
    DOUBLE: 2,
    TRIPLE: 3,
    HOME_RUN: 4,
  };
  return map[result_detail] ?? 0;
}

export async function POST(request: NextRequest) {
  await dbReady;

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
  } = body;

  if (!game_id || !player_id || !inning || !result_category || !result_detail) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 }
    );
  }

  try {
    const isHit = ['SINGLE', 'DOUBLE', 'TRIPLE', 'HOME_RUN'].includes(result_detail);
    const isAtBat = !['WALK', 'SACRIFICE', 'SACRIFICE_FLY'].includes(result_category)
      && result_detail !== 'HIT_BY_PITCH';
    const slugging_value = calcSluggingValue(result_detail);
    const TEAM_ID_PLACEHOLDER = 1;

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
      TEAM_ID_PLACEHOLDER, game_id, player_id, inning,
      result_category, result_detail,
      rbi ?? 0, runs ?? 0, stolen_bases ?? 0,
      isAtBat, isHit, slugging_value,
    ];

    const result = await pool.query(query, values);
    return NextResponse.json({ success: true, id: result.rows[0].id }, { status: 201 });

  } catch (error) {
    console.error('DB Insert Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record plate appearance' },
      { status: 500 }
    );
  }
}
