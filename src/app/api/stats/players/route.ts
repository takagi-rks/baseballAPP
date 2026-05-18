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
      return NextResponse.json({ success: true, stats: [] });
    }

    const query = `
      SELECT
          player_id,
          COUNT(*)::int as pa,
          SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END)::int as ab,
          SUM(CASE WHEN is_hit THEN 1 ELSE 0 END)::int as h,
          SUM(rbi)::int as rbi,
          SUM(runs)::int as runs,
          -- 打率 (AVG)
          CASE WHEN SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END) > 0 
               THEN ROUND(SUM(CASE WHEN is_hit THEN 1 ELSE 0 END)::numeric / SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END), 3)
               ELSE 0 END as avg,
          -- 出塁率 (OBP)
          CASE WHEN COUNT(*) > 0
               THEN ROUND((SUM(CASE WHEN is_hit THEN 1 ELSE 0 END) + SUM(CASE WHEN result_category = 'WALK' THEN 1 ELSE 0 END))::numeric / COUNT(*), 3)
               ELSE 0 END as obp,
          -- 長打率 (SLG)
          CASE WHEN SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END) > 0
               THEN ROUND(SUM(slugging_value)::numeric / SUM(CASE WHEN is_at_bat THEN 1 ELSE 0 END), 3)
               ELSE 0 END as slg
      FROM plate_appearances
      WHERE game_id = $1
      GROUP BY player_id;
    `;
    const result = await pool.query(query, [gameId]);
    
    // JS側で計算してOPSを追加
    const stats = result.rows.map(row => ({
      ...row,
      avg: parseFloat(row.avg).toFixed(3).replace(/^0/, ''),
      obp: parseFloat(row.obp).toFixed(3).replace(/^0/, ''),
      slg: parseFloat(row.slg).toFixed(3).replace(/^0/, ''),
      ops: (parseFloat(row.obp) + parseFloat(row.slg)).toFixed(3).replace(/^0/, '')
    }));

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error("Fetch Stats Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
