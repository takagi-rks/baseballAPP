import { NextResponse } from 'next/server';
import pool from '@/lib/db';

async function recalculateInningScore(gameId: number, inning: number) {
  const sumQuery = `
    SELECT COALESCE(SUM(GREATEST(COALESCE(rbi, 0), COALESCE(runs, 0))), 0)::int AS runs
    FROM plate_appearances
    WHERE game_id = $1
      AND inning = $2;
  `;

  const sumResult = await pool.query(sumQuery, [gameId, inning]);
  const runs = Number(sumResult.rows[0]?.runs || 0);

  if (runs > 0) {
    await pool.query(
      `
      INSERT INTO inning_scores (game_id, inning, team_side, runs)
      VALUES ($1, $2, 'us', $3)
      ON CONFLICT (game_id, inning, team_side)
      DO UPDATE SET runs = EXCLUDED.runs;
      `,
      [gameId, inning, runs]
    );
  } else {
    await pool.query(
      `
      DELETE FROM inning_scores
      WHERE game_id = $1
        AND inning = $2
        AND team_side = 'us';
      `,
      [gameId, inning]
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const targetResult = await pool.query(
      `
      SELECT id, game_id, inning
      FROM plate_appearances
      WHERE id = $1;
      `,
      [id]
    );

    if (targetResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'plate appearance not found' },
        { status: 404 }
      );
    }

    const target = targetResult.rows[0];

    await pool.query('DELETE FROM plate_appearances WHERE id = $1;', [id]);

    await recalculateInningScore(Number(target.game_id), Number(target.inning));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
