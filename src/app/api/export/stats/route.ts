import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');

    if (!gameId) {
      return NextResponse.json({ success: false, error: "game_id required" }, { status: 400 });
    }

    const query = `
      SELECT
          p.name,
          p.uniform_number,
          COUNT(*)::int as pa,
          SUM(CASE WHEN pa.is_at_bat THEN 1 ELSE 0 END)::int as ab,
          SUM(CASE WHEN pa.is_hit THEN 1 ELSE 0 END)::int as h,
          SUM(pa.rbi)::int as rbi,
          SUM(pa.runs)::int as runs,
          CASE WHEN SUM(CASE WHEN pa.is_at_bat THEN 1 ELSE 0 END) > 0 
               THEN ROUND(SUM(CASE WHEN pa.is_hit THEN 1 ELSE 0 END)::numeric / SUM(CASE WHEN pa.is_at_bat THEN 1 ELSE 0 END), 3)
               ELSE 0 END as avg,
          CASE WHEN COUNT(*) > 0
               THEN ROUND((SUM(CASE WHEN pa.is_hit THEN 1 ELSE 0 END) + SUM(CASE WHEN pa.result_category = 'WALK' THEN 1 ELSE 0 END))::numeric / COUNT(*), 3)
               ELSE 0 END as obp,
          CASE WHEN SUM(CASE WHEN pa.is_at_bat THEN 1 ELSE 0 END) > 0
               THEN ROUND(SUM(pa.slugging_value)::numeric / SUM(CASE WHEN pa.is_at_bat THEN 1 ELSE 0 END), 3)
               ELSE 0 END as slg
      FROM plate_appearances pa
      JOIN players p ON pa.player_id = p.id
      WHERE pa.game_id = $1
      GROUP BY p.id, p.name, p.uniform_number;
    `;
    const result = await pool.query(query, [gameId]);

    let csv = "\uFEFF選手名,背番号,打席数,打数,安打,打点,得点,打率,出塁率,長打率,OPS\n";
    result.rows.forEach(row => {
      const ops = (parseFloat(row.obp) + parseFloat(row.slg)).toFixed(3);
      csv += `${row.name},${row.uniform_number},${row.pa},${row.ab},${row.h},${row.rbi},${row.runs},${row.avg},${row.obp},${row.slg},${ops}\n`;
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="game_stats_${gameId}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Export Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
