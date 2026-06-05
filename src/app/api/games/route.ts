import { NextRequest, NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';

const dbReady = initDb();

export async function POST(request: NextRequest) {
  try {
    await dbReady;

    const body = await request.json();
    const opponent = body.opponent ?? '練習試合';
    const tournamentName = body.tournament_name ?? '';
    const status = body.status ?? 'in_progress';
    const battingSide = body.batting_side ?? 'TOP';

    const query = `
      INSERT INTO games (opponent, tournament_name, status, batting_side)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;
    const result = await pool.query(query, [opponent, tournamentName, status, battingSide]);
    return NextResponse.json({ success: true, id: result.rows[0].id });

  } catch (error) {
    console.error('Create Game Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create game' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbReady;
    const result = await pool.query(
      'SELECT * FROM games ORDER BY created_at DESC;'
    );
    return NextResponse.json({ success: true, games: result.rows });

  } catch (error) {
    console.error('Fetch Games Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}
