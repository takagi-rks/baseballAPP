import { NextResponse } from 'next/server';
import pool from '@/lib/db';

function fmtRate(value: number): string {
  if (!Number.isFinite(value)) return '.000';
  return value.toFixed(3).replace(/^0/, '');
}

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(g.game_date, 'YYYY-MM') AS month,
        COUNT(DISTINCT g.id)::int AS games,
        COUNT(*)::int AS plate_appearances,
        SUM(CASE WHEN pa.is_at_bat THEN 1 ELSE 0 END)::int AS at_bats,
        SUM(CASE WHEN pa.is_hit THEN 1 ELSE 0 END)::int AS hits,
        COUNT(*) FILTER (WHERE pa.result_detail = 'HOME_RUN')::int AS home_runs,
        COALESCE(SUM(pa.rbi), 0)::int AS rbi,
        COALESCE(SUM(pa.slugging_value), 0)::int AS total_bases
      FROM plate_appearances pa
      JOIN games g ON g.id = pa.game_id
      GROUP BY TO_CHAR(g.game_date, 'YYYY-MM')
      ORDER BY month DESC;
    `);

    const monthly = result.rows.map((row) => {
      const atBats = Number(row.at_bats || 0);
      const hits = Number(row.hits || 0);
      const totalBases = Number(row.total_bases || 0);
      const avg = atBats > 0 ? hits / atBats : 0;
      const slg = atBats > 0 ? totalBases / atBats : 0;

      return {
        ...row,
        avg: fmtRate(avg),
        slg: fmtRate(slg),
      };
    });

    return NextResponse.json({ success: true, monthly });
  } catch (error) {
    console.error('Monthly Stats Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch monthly stats' },
      { status: 500 }
    );
  }
}
