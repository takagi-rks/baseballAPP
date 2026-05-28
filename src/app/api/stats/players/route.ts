import { NextRequest, NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';

const dbReady = initDb();

export async function GET(request: NextRequest) {
  try {
    await dbReady;

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'game_id required' },
        { status: 400 }
      );
    }

    const query = `
      SELECT
        player_id,
        COUNT(*)::int AS pa,
        SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END)::int AS ab,
        SUM(CASE WHEN is_hit THEN 1 ELSE 0 END)::int AS h,
        SUM(rbi)::int AS rbi,
        SUM(runs)::int AS runs,
        CASE WHEN SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END) > 0
          THEN ROUND(
            SUM(CASE WHEN is_hit THEN 1 ELSE 0 END)::numeric
            / SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END), 3)
          ELSE 0
        END AS avg,
        CASE WHEN COUNT(*) > 0
          THEN ROUND((
            SUM(CASE WHEN is_hit THEN 1 ELSE 0 END)
            + SUM(CASE WHEN result_category = 'WALK' THEN 1 ELSE 0 END)
            + SUM(CASE WHEN result_detail = 'HIT_BY_PITCH' THEN 1 ELSE 0 END)
          )::numeric / COUNT(*), 3)
          ELSE 0
        END AS obp,
        CASE WHEN SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END) > 0
          THEN ROUND(
            SUM(slugging_value)::numeric
            / SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END), 3)
          ELSE 0
        END AS slg
      FROM plate_appearances
      WHERE game_id = $1
      GROUP BY player_id;
    `;

    const result = await pool.query(query, [gameId]);

    const stats = result.rows.map(row => ({
      ...row,
      ops: (parseFloat(row.obp) + parseFloat(row.slg)).toFixed(3),
    }));

    return NextResponse.json({ success: true, stats });

  } catch (error) {
    console.error('Fetch Player Stats Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch player stats' },
      { status: 500 }
    );
  }
}
