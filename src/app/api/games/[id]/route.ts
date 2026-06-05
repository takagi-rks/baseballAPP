import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await pool.query('SELECT * FROM games WHERE id = $1;', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Game not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, game: result.rows[0] });
  } catch (error: any) {
    console.error("Fetch Game Details Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { opponent, tournament_name, location, memo, status, batting_side } = body;

    const query = `
      UPDATE games
      SET opponent = $1,
          tournament_name = $2,
          location = $3,
          memo = $4,
          status = $5,
          batting_side = $6
      WHERE id = $7;
    `;

    await pool.query(query, [
      opponent || "練習試合",
      tournament_name || "",
      location || "",
      memo || "",
      status || "in_progress",
      batting_side || "TOP",
      id
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Game Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
