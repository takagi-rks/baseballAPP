import { NextResponse } from 'next/server';
import pool, { initDb } from '@/lib/db';

export async function POST() {
  try {
    await initDb();
    const query = `
      INSERT INTO games (opponent, status)
      VALUES ($1, $2)
      RETURNING id;
    `;
    const result = await pool.query(query, ["練習試合", "in_progress"]);
    return NextResponse.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    console.error("Create Game Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await initDb();
    const result = await pool.query('SELECT * FROM games ORDER BY created_at DESC;');
    return NextResponse.json({ success: true, games: result.rows });
  } catch (error: any) {
    console.error("Fetch Games Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
