import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

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
    const { opponent, location, memo, score_them, status } = body;

    const query = `
      UPDATE games
      SET opponent = $1, location = $2, memo = $3, score_them = $4, status = $5
      WHERE id = $6;
    `;
    await pool.query(query, [
      opponent || "練習試合", 
      location || "", 
      memo || "", 
      parseInt(score_them || 0), 
      status || "in_progress", 
      id
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Game Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
