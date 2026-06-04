import { NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('game_id');

    if (!gameId) {
      return NextResponse.json({ success: false, error: 'game_id required' }, { status: 400 });
    }

    const query = `
      SELECT
        id,
        game_id,
        inning,
        team_side,
        runs,
        hits_allowed,
        walks_allowed,
        hit_by_pitch_allowed,
        errors_committed,
        note
      FROM inning_scores
      WHERE game_id = $1
      ORDER BY inning ASC, team_side ASC;
    `;
    const result = await pool.query(query, [gameId]);

    return NextResponse.json({ success: true, scores: result.rows });
  } catch (error: any) {
    console.error('Fetch Inning Scores Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDb();
    const body = await request.json();

    const {
      game_id,
      inning,
      team_side,
      runs,
      hits_allowed,
      walks_allowed,
      hit_by_pitch_allowed,
      errors_committed,
      note,
    } = body;

    if (!game_id || !inning || !team_side) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (team_side !== 'us' && team_side !== 'them') {
      return NextResponse.json({ success: false, error: "team_side must be 'us' or 'them'" }, { status: 400 });
    }

    const query = `
      INSERT INTO inning_scores (
        game_id,
        inning,
        team_side,
        runs,
        hits_allowed,
        walks_allowed,
        hit_by_pitch_allowed,
        errors_committed,
        note
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (game_id, inning, team_side)
      DO UPDATE SET
        runs = EXCLUDED.runs,
        hits_allowed = EXCLUDED.hits_allowed,
        walks_allowed = EXCLUDED.walks_allowed,
        hit_by_pitch_allowed = EXCLUDED.hit_by_pitch_allowed,
        errors_committed = EXCLUDED.errors_committed,
        note = EXCLUDED.note
      RETURNING id;
    `;

    const values = [
      game_id,
      inning,
      team_side,
      Number(runs ?? 0),
      Number(hits_allowed ?? 0),
      Number(walks_allowed ?? 0),
      Number(hit_by_pitch_allowed ?? 0),
      Number(errors_committed ?? 0),
      note ?? '',
    ];

    const result = await pool.query(query, values);

    return NextResponse.json({ success: true, id: result.rows[0].id }, { status: 201 });
  } catch (error: any) {
    console.error('Save Inning Score Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
