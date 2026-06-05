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
        pa.player_id,
        p.name,
        p.uniform_number,

        COUNT(DISTINCT pa.game_id)::int AS games_played,
        COUNT(*)::int AS plate_appearances,

        SUM(CASE WHEN pa.is_at_bat THEN 1 ELSE 0 END)::int AS at_bats,
        SUM(CASE WHEN pa.is_hit THEN 1 ELSE 0 END)::int AS hits,

        COUNT(*) FILTER (WHERE pa.result_detail = 'DOUBLE')::int AS doubles,
        COUNT(*) FILTER (WHERE pa.result_detail = 'TRIPLE')::int AS triples,
        COUNT(*) FILTER (WHERE pa.result_detail = 'HOME_RUN')::int AS home_runs,

        COALESCE(SUM(pa.rbi), 0)::int AS rbi,
        COALESCE(SUM(pa.runs), 0)::int AS runs,
        COALESCE(SUM(pa.stolen_bases), 0)::int AS stolen_bases,

        COUNT(*) FILTER (WHERE pa.result_detail = 'STRIKEOUT')::int AS strikeouts,
        COUNT(*) FILTER (
          WHERE pa.result_category = 'WALK'
             OR pa.result_detail = 'WALK'
        )::int AS walks,
        COUNT(*) FILTER (WHERE pa.result_detail = 'HIT_BY_PITCH')::int AS hit_by_pitch,

        COUNT(*) FILTER (
          WHERE pa.result_detail = 'SAC_BUNT'
             OR pa.result_category = 'SACRIFICE'
        )::int AS sacrifices,
        COUNT(*) FILTER (
          WHERE pa.result_detail = 'SAC_FLY'
             OR pa.result_category = 'SACRIFICE_FLY'
        )::int AS sacrifice_flies,

        COALESCE(SUM(pa.slugging_value), 0)::int AS total_bases,
        SUM(CASE WHEN pa.risp = true AND pa.is_at_bat THEN 1 ELSE 0 END)::int AS risp_at_bats,
        SUM(CASE WHEN pa.risp = true AND pa.is_hit THEN 1 ELSE 0 END)::int AS risp_hits
      FROM plate_appearances pa
      JOIN players p ON pa.player_id = p.id
      GROUP BY pa.player_id, p.name, p.uniform_number
      ORDER BY p.uniform_number ASC;
    `);

    const stats = result.rows.map((row) => {
      const atBats = Number(row.at_bats || 0);
      const hits = Number(row.hits || 0);
      const walks = Number(row.walks || 0);
      const hbp = Number(row.hit_by_pitch || 0);
      const sf = Number(row.sacrifice_flies || 0);
      const totalBases = Number(row.total_bases || 0);
      const rispAtBats = Number(row.risp_at_bats || 0);
      const rispHits = Number(row.risp_hits || 0);

      const avg = atBats > 0 ? hits / atBats : 0;

      const obpDenominator = atBats + walks + hbp + sf;
      const obp = obpDenominator > 0
        ? (hits + walks + hbp) / obpDenominator
        : 0;

      const slg = atBats > 0 ? totalBases / atBats : 0;
      const ops = obp + slg;

      const rispAvg = rispAtBats > 0 ? rispHits / rispAtBats : 0;

      return {
        ...row,
        avg: fmtRate(avg),
        obp: fmtRate(obp),
        slg: fmtRate(slg),
        ops: fmtRate(ops),
        risp_avg: rispAtBats > 0 ? fmtRate(rispAvg) : '-',
      };
    });

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Career Stats Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch career stats' },
      { status: 500 }
    );
  }
}
