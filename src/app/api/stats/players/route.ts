import { NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');

    if (!gameId) {
      return NextResponse.json({ success: false, error: "game_id required" }, { status: 400 });
    }

    const query = `
      SELECT
          player_id,
          COUNT(*)::int as pa,
          SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END)::int as ab,
          SUM(CASE WHEN is_hit THEN 1 ELSE 0 END)::int as h,
          SUM(rbi)::int as rbi,
          SUM(runs)::int as runs,
          CASE WHEN SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END) > 0 
               THEN ROUND(SUM(CASE WHEN is_hit THEN 1 ELSE 0 END)::numeric / SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END), 3)
               ELSE 0 END as avg,
          CASE WHEN COUNT(*) > 0
               THEN ROUND((SUM(CASE WHEN is_hit THEN 1 ELSE 0 END) + SUM(CASE WHEN result_category = 'WALK' THEN 1 ELSE 0 END))::numeric / COUNT(*), 3)
               ELSE 0 END as obp,
          CASE WHEN SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END) > 0
               THEN ROUND(SUM(slugging_value)::numeric / SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END), 3)
               ELSE 0 END as slg
      FROM plate_appearances
      WHERE game_id = $1
      GROUP BY player_id;
    `;
    const result = await pool.query(query, [gameId]);
    const stats = result.rows.map(row => ({
      ...row,
      ops: (parseFloat(row.obp) + parseFloat(row.slg)).toFixed(3)
    }));

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error("Fetch Player Stats Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
