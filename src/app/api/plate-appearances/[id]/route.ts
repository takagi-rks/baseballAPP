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

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { result_category, result_detail } = await request.json();

    if (!result_category || !result_detail) {
      return NextResponse.json(
        { success: false, error: 'result_category and result_detail are required' },
        { status: 400 }
      );
    }

    const sluggingMap: Record<string, number> = {
      SINGLE: 1, DOUBLE: 2, TRIPLE: 3, HOME_RUN: 4,
    };
    const isHit = ['SINGLE', 'DOUBLE', 'TRIPLE', 'HOME_RUN'].includes(result_detail);
    const slugging_value = sluggingMap[result_detail] ?? 0;

    const targetResult = await pool.query(
      `SELECT game_id, inning FROM plate_appearances WHERE id = $1;`,
      [id]
    );

    if (targetResult.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'plate appearance not found' },
        { status: 404 }
      );
    }

    const { game_id, inning } = targetResult.rows[0];

    await pool.query(
      `UPDATE plate_appearances
       SET result_category = $1,
           result_detail   = $2,
           is_hit          = $3,
           slugging_value  = $4
       WHERE id = $5;`,
      [result_category, result_detail, isHit, slugging_value, id]
    );

    await recalculateInningScore(Number(game_id), Number(inning));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update PlateAppearance Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
