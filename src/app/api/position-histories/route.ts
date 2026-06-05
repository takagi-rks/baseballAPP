import { NextRequest, NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';

const dbReady = initDb();

export async function POST(request: NextRequest) {
  try {
    await dbReady;

    const { game_id, player_id, position } = await request.json();

    if (!game_id || !player_id) {
      return NextResponse.json(
        { success: false, error: 'game_id and player_id required' },
        { status: 400 }
      );
    }

    await pool.query(
      `
      INSERT INTO player_position_histories (game_id, player_id, position)
      VALUES ($1, $2, $3)
      ON CONFLICT (game_id, player_id)
      DO UPDATE SET position = EXCLUDED.position;
      `,
      [game_id, player_id, position || '']
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save Position History Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save position history' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbReady;

    const result = await pool.query(`
      SELECT
        ph.player_id,
        p.name,
        p.uniform_number,
        ph.position,
        COUNT(*)::int AS games
      FROM player_position_histories ph
      JOIN players p ON p.id = ph.player_id
      WHERE COALESCE(ph.position, '') <> ''
      GROUP BY ph.player_id, p.name, p.uniform_number, ph.position
      ORDER BY p.uniform_number ASC, games DESC;
    `);

    return NextResponse.json({ success: true, histories: result.rows });
  } catch (error) {
    console.error('Fetch Position Histories Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch position histories' },
      { status: 500 }
    );
  }
}
