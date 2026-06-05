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
    inning_half,
    result_category,
    result_detail,
    rbi,
    runs,
    stolen_bases,
    risp,
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

    // 打席登録
    const paQuery = `
      INSERT INTO plate_appearances (
        team_id, game_id, player_id, inning, inning_half,
        result_category, result_detail, rbi, runs, stolen_bases,
        is_at_bat, is_hit, slugging_value, risp
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id;
    `;
    const paValues = [
      TEAM_ID_PLACEHOLDER, game_id, player_id, inning,
      inning_half ?? 'TOP',
      result_category, result_detail,
      rbi ?? 0, runs ?? 0, stolen_bases ?? 0,
      isAtBat, isHit, slugging_value, Boolean(risp),
    ];
    const paResult = await pool.query(paQuery, paValues);

    // 自チーム得点を inning_scores に upsert
    // スコアボードには「この打席で入ったチーム得点」を保存する
    const teamRuns = Math.max(Number(rbi ?? 0), Number(runs ?? 0));

    if (teamRuns > 0) {
      const upsertQuery = `
        INSERT INTO inning_scores (game_id, inning, team_side, runs)
        VALUES ($1, $2, 'us', $3)
        ON CONFLICT (game_id, inning, team_side)
        DO UPDATE SET runs = inning_scores.runs + EXCLUDED.runs;
      `;
      await pool.query(upsertQuery, [game_id, inning, teamRuns]);
    }

    return NextResponse.json(
      { success: true, id: paResult.rows[0].id },
      { status: 201 }
    );

  } catch (error) {
    console.error('DB Insert Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record plate appearance' },
      { status: 500 }
    );
  }
}
