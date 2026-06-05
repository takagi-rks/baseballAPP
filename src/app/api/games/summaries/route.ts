import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const query = `
      SELECT
        g.id,
        g.opponent,
        g.location,
        g.status,
        g.game_date,
        COALESCE(us.total_runs, 0)::int AS score_us,
        COALESCE(them.total_runs, 0)::int AS score_them,
        COALESCE(pa.hits, 0)::int AS hits,
        COALESCE(pa.home_runs, 0)::int AS home_runs,
        COALESCE(pa.rbi, 0)::int AS rbi,
        COALESCE(mvp.player_id, 0)::int AS mvp_player_id,
        COALESCE(p.name, '') AS mvp_name,
        COALESCE(p.uniform_number, '') AS mvp_number,
        COALESCE(mvp.mvp_score, 0)::int AS mvp_score
      FROM games g
      LEFT JOIN (
        SELECT game_id, SUM(runs)::int AS total_runs
        FROM inning_scores
        WHERE team_side = 'us'
        GROUP BY game_id
      ) us ON us.game_id = g.id
      LEFT JOIN (
        SELECT game_id, SUM(runs)::int AS total_runs
        FROM inning_scores
        WHERE team_side = 'them'
        GROUP BY game_id
      ) them ON them.game_id = g.id
      LEFT JOIN (
        SELECT
          game_id,
          COUNT(*) FILTER (WHERE is_hit = true)::int AS hits,
          COUNT(*) FILTER (WHERE result_detail = 'HOME_RUN')::int AS home_runs,
          SUM(rbi)::int AS rbi
        FROM plate_appearances
        GROUP BY game_id
      ) pa ON pa.game_id = g.id
      LEFT JOIN LATERAL (
        SELECT
          player_id,
          (
            COUNT(*) FILTER (WHERE is_hit = true) * 2
            + COUNT(*) FILTER (WHERE result_detail = 'HOME_RUN') * 5
            + COALESCE(SUM(rbi), 0) * 2
            + COALESCE(SUM(runs), 0)
          )::int AS mvp_score
        FROM plate_appearances
        WHERE game_id = g.id
        GROUP BY player_id
        ORDER BY mvp_score DESC
        LIMIT 1
      ) mvp ON true
      LEFT JOIN players p ON p.id = mvp.player_id
      ORDER BY g.id DESC
      LIMIT 30;
    `;

    const result = await pool.query(query);

    return NextResponse.json({
      success: true,
      summaries: result.rows,
    });
  } catch (error) {
    console.error('Fetch Game Summaries Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch game summaries' },
      { status: 500 }
    );
  }
}
